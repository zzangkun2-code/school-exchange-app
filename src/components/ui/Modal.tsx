"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Modal({
  title,
  children,
  open,
  onClose,
  footer,
  className
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <section
        className={cn(
          "max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-card border border-white/80 bg-white shadow-lift",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-center justify-between border-b border-skysoft-100 px-5 py-4">
          <h2 className="text-lg font-black text-ink-900">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            className="min-h-10 px-3"
            icon={<X className="h-5 w-5" />}
            onClick={onClose}
            aria-label="닫기"
          >
            닫기
          </Button>
        </header>
        <div className="max-h-[68vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-skysoft-100 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
