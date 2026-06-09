"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import { PROGRAMS, PROGRAM_ORDER } from "@/lib/constants";
import { subscribeFaqs } from "@/lib/firestore";
import type { FaqItem, ProgramType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

export function FaqViewerModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProgramType>("online");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const unsubscribe = subscribeFaqs(setFaqs, (faqError) => setError(faqError.message));
    return unsubscribe;
  }, [open]);

  const visibleFaqs = useMemo(
    () => faqs.filter((item) => item.category === activeCategory),
    [activeCategory, faqs]
  );

  return (
    <Modal open={open} title="FAQ" onClose={onClose} className="max-w-3xl">
      <div className="mb-4 flex flex-wrap gap-2">
        {PROGRAM_ORDER.map((category) => {
          const program = PROGRAMS[category];
          const Icon = program.icon;
          const selected = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              className={cn(
                "focus-ring inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition hover:-translate-y-0.5",
                selected ? `${program.chip} shadow-soft` : "bg-slate-100 text-slate-600"
              )}
              onClick={() => setActiveCategory(category)}
            >
              <Icon className="h-4 w-4" />
              {program.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      {visibleFaqs.length ? (
        <div className="grid gap-3">
          {visibleFaqs.map((faq) => (
            <article key={faq.id} className="rounded-card border border-skysoft-100 bg-white/80 p-4">
              <h3 className="flex items-start gap-2 text-base font-black text-ink-900">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-skysoft-700" />
                {faq.question}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-600">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="등록된 FAQ가 없습니다">
          <span>교육청에서 FAQ를 등록하면 이곳에 표시됩니다.</span>
        </EmptyState>
      )}
    </Modal>
  );
}
