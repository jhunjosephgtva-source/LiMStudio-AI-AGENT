"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileText, ChevronDown, ChevronRight } from "lucide-react";
import type { ProcessRecord } from "@/lib/types";

export default function Sidebar({
  processes,
  isAdmin,
  includedIds,
  onToggleIncluded,
  onToggleAllInCategory,
  onAdd,
  onEdit,
  onDelete,
}: {
  processes: ProcessRecord[];
  isAdmin: boolean;
  includedIds: Set<string>;
  onToggleIncluded: (id: string) => void;
  onToggleAllInCategory: (ids: string[], nextState: boolean) => void;
  onAdd: () => void;
  onEdit: (p: ProcessRecord) => void;
  onDelete: (p: ProcessRecord) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, ProcessRecord[]>();
    for (const p of processes) {
      const cat = p.category?.trim() || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [processes]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleCollapse(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 text-sm">Processes</h1>
          <p className="text-xs text-gray-400">{processes.length} documented</p>
        </div>
        {isAdmin && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-xs bg-brand-dark text-white px-2.5 py-1.5 rounded-lg hover:opacity-90"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {processes.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-6 text-center">
            No processes yet. {isAdmin ? "Click Add to create one." : "Ask an admin to add some."}
          </p>
        )}

        {grouped.map(([category, items]) => {
          const isCollapsed = collapsed.has(category);
          const allIncluded = items.every((i) => includedIds.has(i.id));
          return (
            <div key={category} className="mb-1">
              <button
                onClick={() => toggleCollapse(category)}
                className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700"
              >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                {category}
                <span className="ml-auto normal-case font-normal text-gray-400">
                  {items.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="space-y-1">
                  <label className="flex items-center gap-2 px-3 py-1 text-[11px] text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allIncluded}
                      onChange={() =>
                        onToggleAllInCategory(
                          items.map((i) => i.id),
                          !allIncluded
                        )
                      }
                      className="rounded"
                    />
                    Select all in this category
                  </label>

                  {items.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={includedIds.has(p.id)}
                        onChange={() => onToggleIncluded(p.id)}
                        className="mt-1 rounded"
                      />
                      <FileText size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug truncate">{p.title}</p>
                        <p className="text-[10px] text-gray-400">
                          Updated {new Date(p.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onEdit(p)}
                            className="text-gray-400 hover:text-gray-700 p-1"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => onDelete(p)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
