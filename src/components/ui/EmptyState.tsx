import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  children,
  className
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-skysoft-200 bg-white/70 px-5 py-8 text-center",
        className
      )}
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-mint-100 text-mint-700">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="text-base font-black text-ink-900">{title}</p>
      {children ? <div className="mt-2 text-sm font-semibold text-slate-600">{children}</div> : null}
    </div>
  );
}
