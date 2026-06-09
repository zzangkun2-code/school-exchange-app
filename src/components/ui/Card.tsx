import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("soft-panel hover-lift", className)} {...props} />;
}

export function StaticCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("soft-panel", className)} {...props} />;
}
