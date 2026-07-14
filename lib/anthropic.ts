// Minimal wrapper around the Anthropic Messages API. No SDK dependency needed.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function askClaude(params: {
  systemPrompt: string;
  messages: ChatMessage[];
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: params.systemPrompt,
      messages: params.messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const textBlocks = (data.content || [])
    .filter((block: any) => block.type === "text")
    .map((block: any) => block.text);
  return textBlocks.join("\n").trim();
}
