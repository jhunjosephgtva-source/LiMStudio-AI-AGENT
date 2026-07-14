// Minimal wrapper around Groq's OpenAI-compatible Chat Completions API.
// Free tier, no card required: get a key at https://console.groq.com/keys

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function askGroq(params: {
  systemPrompt: string;
  messages: ChatMessage[];
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_completion_tokens: 1200,
      temperature: 0.4,
      messages: [{ role: "system", content: params.systemPrompt }, ...params.messages],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}