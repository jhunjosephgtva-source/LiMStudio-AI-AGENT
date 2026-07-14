"use client";

import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Loader2, Bot, User } from "lucide-react";
import type { ChatTurn } from "@/lib/types";

export default function ChatPanel({ includedIds }: { includedIds: Set<string> }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  async function handleSend() {
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    setError("");
    const nextTurns: ChatTurn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          history: turns.map((t) => ({ role: t.role, content: t.content })),
          includedProcessIds: Array.from(includedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      setTurns((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch {
      setError("Could not reach the assistant. Try again.");
    }
    setLoading(false);
  }

  function handleNewChat() {
    setTurns([]);
    setError("");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div>
          <h2 className="font-semibold text-gray-900">Ask about a LiMStudios process</h2>
          <p className="text-xs text-gray-400">
            {includedIds.size > 0
              ? `Answering from ${includedIds.size} selected process${includedIds.size === 1 ? "" : "es"}`
              : "No sources selected — answering from all processes"}
          </p>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-full hover:bg-gray-50"
        >
          <RotateCcw size={12} /> New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {turns.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2">
            <Bot size={32} className="text-gray-300" />
            <p className="text-sm">
              Ask something like "how do I upload photos to Pixieset?" or "what's the process for
              scheduling a podcast guest?"
            </p>
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i} className={`flex gap-3 ${turn.role === "user" ? "justify-end" : ""}`}>
            {turn.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                turn.role === "user"
                  ? "bg-brand-dark text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
              }`}
            >
              {turn.content}
              {turn.sources && turn.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
                  {turn.sources.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {turn.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2 border border-gray-300 rounded-2xl px-3 py-2 focus-within:border-gray-500">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask about any LiMStudios process…"
            className="flex-1 resize-none outline-none text-sm py-1 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-brand-dark text-white rounded-full p-2 disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
