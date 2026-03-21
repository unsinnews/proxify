"use client";

import { useState } from "react";

import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import {
    CodeBlock,
    CodeBlockBody,
    CodeBlockContent,
    CodeBlockCopyButton,
    CodeBlockFilename,
    CodeBlockFiles,
    CodeBlockHeader,
    CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

const code = [
    {
        language: "bash",
        filename: "curl.sh",
        code: `# cURL example using /openai proxy endpoint
curl https://proxify.poixe.com/openai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer API_KEY" \\
  -d '{
    "model": "gpt-5",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "stream": false
  }'`,
    },
    {
        language: "javascript",
        filename: "openai-sdk.js",
        code: `// Node.js example using /openai proxy endpoint
import OpenAI from "openai";

const openai = new OpenAI({ 
    apiKey: "API_KEY", 
    baseURL: "https://proxify.poixe.com/openai/v1",
});

async function main() {
    const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello!" }
        ],
    });

    console.log(completion.choices[0].message.content);
}

main();`,
    },
    {
        language: "python",
        filename: "openai-sdk.py",
        code: `# Python example using /openai proxy endpoint
from openai import OpenAI

client = OpenAI(
    api_key="API_KEY", 
    base_url="https://proxify.poixe.com/openai/v1",
)

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
    ],
)

print(completion.choices[0].message.content)`,
    },
    {
        language: "go",
        filename: "openai-sdk.go",
        code: `// Golang example using /openai proxy endpoint
package main

import (
	"context"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

func main() {
	newConfig := openai.DefaultConfig("API_KEY")
	newConfig.BaseURL = "https://proxify.poixe.com/openai/v1"
	client := openai.NewClientWithConfig(newConfig)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-5",
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "You are a helpful assistant.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "Hello!",
				},
			},
		},
	)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v", err)
		return
	}

	fmt.Println(resp.Choices[0].Message.Content)
}`,
    }
];

export default function CodeBlockRoutes() {
    const { t } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");

    return (
        <section id="code-block" className="mt-10 border-t pt-5 mb-15">
            <h2 className="text-3xl font-semibold text-center mb-8">{t("home.code_examples.title")}</h2>
            <div className="container">
                <div className="grid place-items-center gap-10 lg:grid-cols-2 lg:gap-0">
                    <div className="flex flex-col gap-6 lg:pr-20">
                        <span className="text-muted-foreground text-lg">
                            {t("home.code_examples.show.note")}
                        </span>
                        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                            {t("home.code_examples.show.style.top")}
                            <br />
                            <span className="text-muted-foreground">{t("home.code_examples.show.style.bottom")}</span>
                        </h2>
                        <p className="text-muted-foreground md:text-lg leading-relaxed">
                            {t("home.code_examples.show.description")}
                        </p>
                        <div className="flex gap-3">
                            <a href="#quick-start">
                                <Button size="lg" className="px-8 text-base hover:cursor-pointer">
                                    {t("home.code_examples.show.get_started")}
                                </Button>
                            </a>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-1 overflow-hidden">
                        <Tabs defaultValue="javascript" onValueChange={setSelectedLanguage}>
                            <TabsList className="h-10 w-full">
                                <TabsTrigger value="javascript">Javascript</TabsTrigger>
                                <TabsTrigger value="python">Python</TabsTrigger>
                                <TabsTrigger value="go">Go</TabsTrigger>
                                <TabsTrigger value="bash">Bash</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <CodeBlock data={code} value={selectedLanguage} className="w-full">
                            <CodeBlockHeader>
                                <CodeBlockFiles>
                                    {(item) => (
                                        <CodeBlockFilename
                                            key={item.language}
                                            value={item.language}
                                        >
                                            {item.filename}
                                        </CodeBlockFilename>
                                    )}
                                </CodeBlockFiles>
                                <CodeBlockCopyButton
                                    onCopy={() => console.log("Copied code to clipboard")}
                                    onError={() =>
                                        console.error("Failed to copy code to clipboard")
                                    }
                                />
                            </CodeBlockHeader>
                            <ScrollArea className="w-full">
                                <CodeBlockBody>
                                    {(item) => (
                                        <CodeBlockItem
                                            key={item.language}
                                            value={item.language}
                                            className="max-h-96 w-full"
                                        >
                                            <CodeBlockContent
                                                language={item.language as BundledLanguage}
                                            >
                                                {item.code}
                                            </CodeBlockContent>
                                        </CodeBlockItem>
                                    )}
                                </CodeBlockBody>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CodeBlock>
                    </div>
                </div>
            </div>
        </section>
    );
};