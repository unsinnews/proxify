package stream

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/poixeai/proxify/infra/logger"
)

type chunk struct {
	body []byte
}

func Smoothing(c *gin.Context, resp *http.Response) {
	ctx := c.Request.Context()

	// ==== Upstream Reader Layer ====
	in := readUpstreamChunks(ctx, resp.Body)

	// ==== Flow Control Layer ====
	out := applyFlowControl(ctx, in)

	// ==== Downstream Writer Layer ====
	writeToClient(c, resp, out)
}

func readUpstreamChunks(ctx context.Context, body io.ReadCloser) <-chan chunk {
	// ch := make(chan chunk)
	ch := make(chan chunk, 100) // add some cache

	go func() {
		defer close(ch)
		defer body.Close()

		reader := bufio.NewReader(body)
		for {
			line, err := reader.ReadBytes('\n')
			if err != nil && err != io.EOF {
				logger.Errorf("error reading upstream: %v", err)
				return
			}

			if len(line) > 0 {
				select {
				case <-ctx.Done():
					logger.Warn("client disconnected, stop reading upstream")
					return
				case ch <- chunk{body: line}:
				}
			}

			if err == io.EOF {
				return
			}
		}
	}()

	return ch
}

func applyFlowControl(ctx context.Context, in <-chan chunk) <-chan chunk {
	// config
	dataChanCapacity := 300
	targetBufferRatio := 0.2
	minInterval := time.Duration(2) * time.Millisecond
	maxInterval := time.Duration(20) * time.Millisecond
	adjustPeriod := time.Duration(100) * time.Millisecond
	rateSmoothing := 0.3
	tailBoost := true
	debugLog := true

	if debugLog {
		logger.Debugf("[FlowControl] enable smoothing: dataChanCapacity=%d, targetBufferRatio=%.2f, minInterval=%dms, maxInterval=%dms, adjustPeriod=%dms, rateSmoothing=%.2f, tailBoost=%v",
			dataChanCapacity, targetBufferRatio, minInterval.Milliseconds(),
			maxInterval.Milliseconds(), adjustPeriod.Milliseconds(),
			rateSmoothing, tailBoost)
	}

	// Statistics for additional time spent during the tail boost phase
	var doneSeenAt time.Time

	// Internal buffer
	buf := make(chan chunk, dataChanCapacity)
	doneFlag := false
	go func() {
		defer close(buf)
		for ck := range in {
			if DetectDoneSignal(ck.body) {
				logger.Debug("[FlowControl] Detected done signal from upstream")
				if doneSeenAt.IsZero() {
					doneSeenAt = time.Now()
				}
				doneFlag = true
			}
			select {
			case <-ctx.Done():
				logger.Warn("client disconnected, stop buffering")
				return
			case buf <- ck:
			}
		}
	}()

	// Output channel
	out := make(chan chunk, dataChanCapacity)

	go func() {
		defer close(out)

		startTime := time.Now()
		totalChunks := 0
		currentInterval := minInterval
		lastAdjustTime := time.Now()
		isFirstChunk := true

		// Limit log frequency during the sprint phase
		lastTailLog := time.Time{}
		// Interval for tail sprint logging; adjust as needed (100–500ms is typical)
		tailLogGap := 100 * time.Millisecond

		ticker := time.NewTicker(currentInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				logger.Warn("[FlowControl] Client disconnected, stopping flow control goroutine")
				return

			case ck, ok := <-buf:
				if !ok {
					// All chunks have been sent, about to exit the sending goroutine
					if !doneSeenAt.IsZero() {
						tailDrain := time.Since(doneSeenAt)
						logger.Infof("[FlowControl] Tail drain duration tail_drain=%v", tailDrain)
					}
					return
				}

				// Send the first chunk immediately
				if isFirstChunk {
					out <- ck
					isFirstChunk = false
					totalChunks++
					continue
				}

				// Sprint: buffer is nearly full
				if len(buf) > cap(buf)-10 && currentInterval > minInterval {
					currentInterval = minInterval
					ticker.Reset(currentInterval)
					if debugLog {
						logger.Infof("[FlowControl] Sprint: buffer %d/%d, interval forcibly set to %dms",
							len(buf), cap(buf), currentInterval.Milliseconds())
					}
				}

				// Tail sprint: upstream has ended
				if tailBoost && doneFlag {
					if currentInterval != minInterval {
						currentInterval = minInterval
						ticker.Reset(currentInterval)
					}

					// Rate-limited logging
					if time.Since(lastTailLog) >= tailLogGap {
						pending := len(buf) + 1
						eta := time.Duration(pending) * currentInterval
						logger.Debugf("[FlowControl] Tail sprint: interval=%dms | buf=%d/%d | pending=%d | eta~%v",
							minInterval.Milliseconds(), len(buf), cap(buf), pending, eta)
						lastTailLog = time.Now()
					}
				}

				// "Send the first packet immediately, then wait before sending the next"—feels more like a typewriter.
				select {
				case <-ticker.C:
				case <-ctx.Done():
					logger.Warn("[FlowControl] Client disconnected, stop streaming")
					return
				}
				out <- ck
				totalChunks++

				// Periodic adjustment
				if time.Since(lastAdjustTime) >= adjustPeriod && !(tailBoost && doneFlag) && totalChunks > 5 {
					bufLen := len(buf)
					elapsed := time.Since(startTime)
					historicalRate := float64(totalChunks) / elapsed.Seconds() // chunks/s

					if historicalRate > 0 {
						idealInterval := time.Duration(1000/historicalRate) * time.Millisecond

						var adjusted time.Duration
						if bufLen > int(float64(dataChanCapacity)*targetBufferRatio*2) {
							adjusted = idealInterval * 80 / 100
						} else if bufLen < int(float64(dataChanCapacity)*targetBufferRatio/2) && bufLen > 1 {
							adjusted = idealInterval * 120 / 100
						} else {
							adjusted = idealInterval
						}

						// Clamp
						if adjusted < minInterval {
							adjusted = minInterval
						} else if adjusted > maxInterval {
							adjusted = maxInterval
						}

						// Smoothing
						newInterval := time.Duration(float64(currentInterval)*(1-rateSmoothing) +
							float64(adjusted)*rateSmoothing)

						if newInterval != currentInterval {
							currentInterval = newInterval
							ticker.Reset(currentInterval)
							if debugLog {
								logger.Debugf("[FlowControl] Adjusting send rate, buffer:%d historical rate:%.2f/s new interval:%dms",
									bufLen, historicalRate, currentInterval.Milliseconds())
							}
						}
					}
					lastAdjustTime = time.Now()
				}
			}
		}
	}()

	return out
}

func writeToClient(c *gin.Context, resp *http.Response, out <-chan chunk) {
	w := c.Writer
	ctx := c.Request.Context()

	// === 1. Copy upstream Header ===
	for k, vv := range resp.Header {
		for _, v := range vv {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)

	flusher, ok := w.(http.Flusher)
	if !ok {
		logger.Error("ResponseWriter does not support streaming (http.Flusher)")
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	// === 2. Heartbeat config ===
	heartbeatEnabled := os.Getenv("STREAM_HEARTBEAT_ENABLED") == "true"
	pingInterval := 1 * time.Second
	var lastPing time.Time
	if heartbeatEnabled {
		lastPing = time.Now() // start counting from now
	}

	// === 3. Loop to send chunks and heartbeat ===
	start := time.Now()
	chunkCount := 0

	for {
		var timeout <-chan time.Time
		if heartbeatEnabled {
			timeout = time.After(time.Until(lastPing.Add(pingInterval)))
		}

		select {
		case <-ctx.Done():
			logger.Warn("[Downstream] Client disconnected, stopping push")
			return

		case ck, ok := <-out:
			if !ok {
				logger.Infof("[Downstream] Push complete, total %d chunks, duration %v", chunkCount, time.Since(start))
				return
			}
			// write chunk to client
			_, err := w.Write(ck.body)
			if err != nil {
				logger.Errorf("[Downstream] Write failed: %v", err)
				return
			}
			flusher.Flush()
			chunkCount++

		case <-timeout: // strict independent heartbeat
			msg := fmt.Sprintf(": ping - %d\n\n", time.Now().Unix())
			if _, err := w.Write([]byte(msg)); err != nil {
				return
			}
			logger.Debugf("[Heartbeat] Sent heartbeat: %s", msg)
			flusher.Flush()
			lastPing = time.Now()
		}
	}
}
