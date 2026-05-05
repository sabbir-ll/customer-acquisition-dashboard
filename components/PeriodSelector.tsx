"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PeriodGroup {
  label: string;
  options: { label: string; idx: number }[];
}

interface Props {
  groups: PeriodGroup[];
  selected: number;
  onChange: (idx: number) => void;
}

export default function PeriodSelector({ groups, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const currentLabel = groups
    .flatMap((g) => g.options)
    .find((o) => o.idx === selected)?.label ?? "—";

  return (
    <>
      {/* Desktop: inline pill groups */}
      <div className="hidden xl:flex flex-wrap gap-1.5 items-center">
        {groups.map((group) => (
          <div key={group.label} className="flex items-center gap-1">
            <span className="text-[10px] text-muted font-medium mr-1">{group.label}</span>
            <div className="flex gap-0.5 bg-surface-2 rounded-lg p-0.5 border border-border">
              {group.options.map((opt) => (
                <button
                  key={opt.idx}
                  onClick={() => onChange(opt.idx)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150",
                    selected === opt.idx
                      ? "bg-primary text-white shadow-sm"
                      : "text-subtle hover:text-text-main hover:bg-surface"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile / tablet: dropdown */}
      <div className="xl:hidden relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-sm font-medium text-text-main hover:border-border-bright transition-all"
        >
          <span>{currentLabel}</span>
          <ChevronDown size={14} className={cn("text-muted transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-surface rounded-xl border border-border shadow-lg z-50 p-2 max-h-80 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{group.label}</p>
                {group.options.map((opt) => (
                  <button
                    key={opt.idx}
                    onClick={() => { onChange(opt.idx); setOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      selected === opt.idx
                        ? "bg-primary text-white"
                        : "text-subtle hover:bg-surface-2 hover:text-text-main"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
