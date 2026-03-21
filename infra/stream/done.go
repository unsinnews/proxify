package stream

import "strings"

var doneKeywords = []string{
	`[DONE]`,             // openai /v1/chat/completions stream done signal
	`response.completed`, // openai /v1/responses stream done signal
	`message_stop`,       // anthropic /v1/messages stream done signal
}

func DetectDoneSignal(data []byte) bool {
	s := string(data)
	for _, kw := range doneKeywords {
		if strings.Contains(s, kw) {
			return true
		}
	}
	return false
}
