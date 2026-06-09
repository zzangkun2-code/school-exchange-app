"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-skysoft-500 text-white shadow-[0_10px_24px_rgba(98,174,244,0.28)] hover:bg-mint-500",
  secondary:
    "bg-white text-ink-700 border border-skysoft-100 shadow-soft hover:border-mint-200 hover:text-mint-700",
  danger:
    "bg-red-500 text-white shadow-[0_10px_24px_rgba(239,68,68,0.24)] hover:bg-red-600",
  ghost: "bg-transparent text-ink-700 hover:bg-white/70"
};

export function Button({
  children,
  className,
  variant = "primary",
  icon,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition duration-200 ease-out hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
}
