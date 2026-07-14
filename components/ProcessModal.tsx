"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import type { ProcessRecord } from "@/lib/types";

export default function ProcessModal({
  existing,
  onClose,
  onSaved,
}: {
  existing: ProcessRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(existing?.title || "");
  const [category, setCategory] = useState(existing?.category || "");
  const [content, setContent] = useState(existing?.content || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not read that file.");
      } else {
        setContent((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
        if (!title) setTitle(data.suggestedTitle);
      }
    } catch {
      setError("Upload failed. Try again.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are both required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = existing ? `/api/processes/${existing.id}` : "/api/processes";
      const method = existing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, category, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Something went wrong saving this process.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {existing ? "Edit process" : "Add a new process"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Upload Photos to Pixieset"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Category (optional)
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Podcast, CRM, Photo Delivery"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 block">
                Process content / steps
              </label>
              <label className="flex items-center gap-1 text-xs text-brand.gold cursor-pointer text-amber-700 hover:text-amber-900">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                Upload transcript/doc (.txt, .md, .docx, .pdf)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              placeholder="Paste or write the step-by-step process here. If you upload a file, its extracted text will appear here for you to review/clean up before saving."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-brand-dark text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : existing ? "Save changes" : "Add process"}
          </button>
        </div>
      </div>
    </div>
  );
}
