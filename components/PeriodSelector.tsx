"use client";

import { cn } from "@/lib/utils";

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
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {groups.map((group) => (
        <div key={group.label} className="flex items-center gap-1">
          <span className="text-xs text-muted mr-1 hidden sm:inline">{group.label}</span>
          <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
            {group.options.map((opt) => (
              <button
                key={opt.idx}
                onClick={() => onChange(opt.idx)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all duration-150",
                  selected === opt.idx
                    ? "bg-[#1d4ed8] text-white shadow-sm"
                    : "text-subtle hover:text-slate-200 hover:bg-surface-2"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
