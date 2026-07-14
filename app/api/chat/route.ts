import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { askGemini, ChatMessage } from "@/lib/gemini";

const SYSTEM_PROMPT_HEADER = `You are the LiMStudios Process Assistant. You answer questions ONLY using the process documents provided below in <processes>. These are the company's internal, real, documented workflows.

Rules:
- If the answer is fully or partially covered by the provided processes, answer clearly and step-by-step where relevant, matching the source's own steps as closely as possible. Do not invent steps that aren't in the source.
- At the end of your answer, on its own line, list which process titles you drew from, formatted exactly as: SOURCES: Title One | Title Two
- If none of the provided processes cover the question, say plainly that there's no documented process for that yet, suggest the person add one or check with Victoria, and still output a SOURCES line with just "SOURCES: none".
- Do not use outside/general knowledge to fill gaps in a documented process — if a process is incomplete, say so rather than guessing.
- Keep answers focused and practical, like a coworker explaining the steps, not a formal report.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userMessage = (body?.message as string | undefined)?.trim();
  const history = (body?.history as ChatMessage[] | undefined) || [];
  const includedIds = (body?.includedProcessIds as string[] | undefined) || null;

  if (!userMessage) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  let query = supabase.from("processes").select("*").eq("is_active", true);
  if (includedIds && includedIds.length > 0) {
    query = query.in("id", includedIds);
  }
  const { data: processes, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contextBlock =
    processes && processes.length > 0
      ? processes
          .map((p) => `<process title="${p.title}" category="${p.category || "General"}">\n${p.content}\n</process>`)
          .join("\n\n")
      : "(No processes are currently selected/available.)";

  const systemPrompt = `${SYSTEM_PROMPT_HEADER}\n\n<processes>\n${contextBlock}\n</processes>`;

  const messages: ChatMessage[] = [
    ...history.slice(-10), // keep last few turns for continuity
    { role: "user", content: userMessage },
  ];

  try {
    const reply = await askGemini({ systemPrompt, messages });

    // Pull out the SOURCES line so the UI can render citation chips separately.
    const sourceMatch = reply.match(/SOURCES:\s*(.*)$/im);
    const sources =
      sourceMatch && sourceMatch[1].trim().toLowerCase() !== "none"
        ? sourceMatch[1].split("|").map((s) => s.trim()).filter(Boolean)
        : [];
    const answer = reply.replace(/SOURCES:\s*(.*)$/im, "").trim();

    return NextResponse.json({ answer, sources });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Chat failed." }, { status: 500 });
  }
}
