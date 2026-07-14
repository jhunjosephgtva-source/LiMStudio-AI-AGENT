"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

export default function AdminUnlock({
  isAdmin,
  onChange,
}: {
  isAdmin: boolean;
  onChange: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Incorrect password.");
        setLoading(false);
        return;
      }
      onChange(true);
      setOpen(false);
      setPassword("");
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  async function handleLock() {
    await fetch("/api/admin/logout", { method: "POST" });
    onChange(false);
  }

  if (isAdmin) {
    return (
      <button
        onClick={handleLock}
        className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-full hover:bg-emerald-100"
        title="Click to lock admin mode"
      >
        <Unlock size={13} /> Admin mode — click to lock
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1.5 rounded-full hover:bg-gray-50"
      >
        <Lock size={13} /> Unlock admin
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
          <p className="text-xs text-gray-500 mb-2">
            Enter the admin password to add, edit, upload, or remove processes.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Admin password"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2"
            autoFocus
          />
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <button
            onClick={handleUnlock}
            disabled={loading || !password}
            className="w-full bg-brand-dark text-white text-sm rounded py-1.5 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </div>
      )}
    </div>
  );
}
