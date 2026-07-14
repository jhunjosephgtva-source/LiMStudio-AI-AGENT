"use client";

import { useEffect, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import ProcessModal from "@/components/ProcessModal";
import AdminUnlock from "@/components/AdminUnlock";
import type { ProcessRecord } from "@/lib/types";

export default function HomePage() {
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessRecord | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadProcesses = useCallback(async () => {
    const res = await fetch("/api/processes");
    const data = await res.json();
    if (res.ok) {
      setProcesses(data.processes || []);
      setIncludedIds((prev) => {
        if (prev.size > 0) return prev;
        return new Set((data.processes || []).map((p: ProcessRecord) => p.id));
      });
    }
  }, []);

  useEffect(() => {
    loadProcesses();
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => {});
  }, [loadProcesses]);

  function toggleIncluded(id: string) {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllInCategory(ids: string[], nextState: boolean) {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (nextState) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  async function handleDelete(p: ProcessRecord) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/processes/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      loadProcesses();
      setIncludedIds((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete this process.");
    }
  }

  return (
    <main className="h-screen w-screen flex overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 bg-white border border-gray-200 rounded-lg p-2 shadow-sm"
      >
        <Menu size={18} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-[300px] transform transition-transform md:transform-none ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="md:hidden flex justify-end p-2">
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1">
            <X size={18} />
          </button>
        </div>
        <Sidebar
          processes={processes}
          isAdmin={isAdmin}
          includedIds={includedIds}
          onToggleIncluded={toggleIncluded}
          onToggleAllInCategory={toggleAllInCategory}
          onAdd={() => {
            setEditingProcess(null);
            setModalOpen(true);
          }}
          onEdit={(p) => {
            setEditingProcess(p);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <div className="flex justify-end px-4 py-2">
          <AdminUnlock isAdmin={isAdmin} onChange={setIsAdmin} />
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel includedIds={includedIds} />
        </div>
      </div>

      {modalOpen && (
        <ProcessModal
          existing={editingProcess}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadProcesses();
          }}
        />
      )}
    </main>
  );
}
