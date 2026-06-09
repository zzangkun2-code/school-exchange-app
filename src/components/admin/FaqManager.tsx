"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, PlusCircle, Save, Trash2 } from "lucide-react";
import { PROGRAMS, PROGRAM_ORDER } from "@/lib/constants";
import { deleteFaq, subscribeFaqs, upsertFaq } from "@/lib/firestore";
import type { FaqItem, ProgramType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StaticCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Textarea, TextInput } from "@/components/ui/Input";

const emptyFaq: FaqItem = {
  category: "online",
  question: "",
  answer: ""
};

export function FaqManager() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProgramType>("online");
  const [editing, setEditing] = useState<FaqItem>(emptyFaq);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeFaqs(setFaqs, (faqError) => setError(faqError.message));
    return unsubscribe;
  }, []);

  const visibleFaqs = useMemo(
    () => faqs.filter((faq) => faq.category === activeCategory),
    [activeCategory, faqs]
  );

  const resetForm = (category = activeCategory) => {
    setEditing({ ...emptyFaq, category });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await upsertFaq(editing);
      resetForm(editing.category);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "FAQ를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faq: FaqItem) => {
    if (!faq.id) return;
    setError(null);
    try {
      await deleteFaq(faq.id);
      if (editing.id === faq.id) {
        resetForm(faq.category);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "FAQ를 삭제하지 못했습니다.");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
      <StaticCard className="p-5">
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
                  selected ? `${program.chip} shadow-soft` : "bg-white text-slate-600"
                )}
                onClick={() => {
                  setActiveCategory(category);
                  resetForm(category);
                }}
              >
                <Icon className="h-4 w-4" />
                {program.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
            {error}
          </div>
        ) : null}

        {visibleFaqs.length ? (
          <div className="grid gap-3">
            {visibleFaqs.map((faq) => (
              <article key={faq.id} className="rounded-card border border-skysoft-100 bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-ink-900">{faq.question}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-skysoft-100 text-skysoft-700"
                      onClick={() => setEditing(faq)}
                      aria-label="FAQ 수정"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700"
                      onClick={() => handleDelete(faq)}
                      aria-label="FAQ 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="등록된 FAQ가 없습니다" />
        )}
      </StaticCard>

      <StaticCard className="h-fit p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pinkwarm-100 text-pinkwarm-700">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-skysoft-700">
              {PROGRAMS[editing.category].label}
            </p>
            <h2 className="text-xl font-black text-ink-900">
              {editing.id ? "FAQ 수정" : "FAQ 작성"}
            </h2>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="카테고리">
            <select
              className="focus-ring min-h-12 w-full rounded-card border border-skysoft-100 bg-white/90 px-4 text-sm font-extrabold text-ink-900"
              value={editing.category}
              onChange={(event) =>
                setEditing((prev) => ({ ...prev, category: event.target.value as ProgramType }))
              }
            >
              {PROGRAM_ORDER.map((category) => (
                <option key={category} value={category}>
                  {PROGRAMS[category].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="질문">
            <TextInput
              value={editing.question}
              onChange={(event) => setEditing((prev) => ({ ...prev, question: event.target.value }))}
              placeholder="예: 온라인수업 증빙 자료는 무엇을 제출하나요?"
              required
            />
          </Field>
          <Field label="답변">
            <Textarea
              value={editing.answer}
              onChange={(event) => setEditing((prev) => ({ ...prev, answer: event.target.value }))}
              placeholder="교사가 바로 이해할 수 있도록 짧고 명확하게 적어 주세요."
              required
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
              저장
            </Button>
            <Button type="button" variant="secondary" onClick={() => resetForm()}>
              새 글
            </Button>
          </div>
        </form>
      </StaticCard>
    </div>
  );
}
