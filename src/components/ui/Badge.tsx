import type { HTMLAttributes, ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "mint" | "pink" | "peach" | "danger" | "neutral";

const tones: Record<BadgeTone, string> = {
  blue: "bg-skysoft-100 text-skysoft-700",
  mint: "bg-mint-100 text-mint-700",
  pink: "bg-pinkwarm-100 text-pinkwarm-700",
  peach: "bg-peach-100 text-peach-700",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-slate-100 text-slate-700"
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  complete,
  children
}: {
  complete: boolean;
  children: ReactNode;
}) {
  return (
    <Badge tone={complete ? "mint" : "danger"}>
      {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      {children}
    </Badge>
  );
}
