// Minimal wrapper around the Google Gemini API (generateContent).
// Free tier: get a key at https://aistudio.google.com/apikey — no card required.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function askGemini(params: {
  systemPrompt: string;
  messages: ChatMessage[];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  // Gemini uses "model" instead of "assistant" for the AI's turns.
  const contents = params.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: params.systemPrompt }],
      },
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts.map((p: any) => p.text || "").join("\n").trim();

  if (!text) {
    const reason = candidate?.finishReason || "unknown reason";
    throw new Error(`Gemini returned no text (finishReason: ${reason}).`);
  }

  return text;
}