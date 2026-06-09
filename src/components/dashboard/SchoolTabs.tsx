"use client";

import { PROGRAMS } from "@/lib/constants";
import type { ProgramType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SchoolTabs({
  tabs,
  active,
  onChange
}: {
  tabs: ProgramType[];
  active: ProgramType;
  onChange: (type: ProgramType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const program = PROGRAMS[tab];
        const Icon = program.icon;
        const selected = active === tab;
        return (
          <button
            key={tab}
            type="button"
            className={cn(
              "focus-ring inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition hover:-translate-y-0.5",
              selected
                ? `${program.chip} shadow-soft`
                : "border border-white/80 bg-white/75 text-slate-600 hover:bg-white"
            )}
            onClick={() => onChange(tab)}
          >
            <Icon className="h-4 w-4" />
            {program.navLabel}
          </button>
        );
      })}
    </div>
  );
}
