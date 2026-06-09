"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Link as LinkIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StaticCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput } from "@/components/ui/Input";
import { PROGRAMS } from "@/lib/constants";
import { saveVideoLinks } from "@/lib/firestore";
import type { ProgramType, SchoolProfile } from "@/lib/types";
import { isHttpUrl } from "@/lib/utils";

function toFiveLinks(value: string[] | undefined) {
  return [...(value ?? []), "", "", "", "", ""].slice(0, 5);
}

export function VideoLinkManager({
  profile,
  type,
  onBack,
  readOnly = false
}: {
  profile: SchoolProfile;
  type: ProgramType;
  onBack: () => void;
  readOnly?: boolean;
}) {
  const program = PROGRAMS[type];
  const [links, setLinks] = useState<string[]>(() => toFiveLinks(profile.videoLinks?.[type]));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLinks(toFiveLinks(profile.videoLinks?.[type]));
    setMessage(null);
    setError(null);
  }, [profile.videoLinks, type]);

  const handleSave = async () => {
    const trimmed = links.map((link) => link.trim());
    const invalid = trimmed.find((link) => link && !isHttpUrl(link));

    if (invalid) {
      setError("영상 링크는 http 또는 https로 시작하는 주소만 입력할 수 있습니다.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveVideoLinks(profile.uid, type, trimmed);
      setMessage("영상 링크가 저장되었습니다.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "영상 링크를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const filledLinks = links.filter(Boolean);

  return (
    <section className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${program.chip}`}>
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-skysoft-700">{program.label}</p>
            <h2 className="text-2xl font-black text-ink-900">
              {readOnly ? "수업 영상 링크 확인" : "수업 영상 링크 제출"}
            </h2>
          </div>
        </div>
        <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          일정 목록
        </Button>
      </div>

      {message ? (
        <div className="rounded-card border border-mint-200 bg-mint-50 px-4 py-3 text-sm font-extrabold text-mint-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <StaticCard className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-black text-ink-900">수업 영상 링크</h3>
          <p className="text-sm font-bold text-slate-500">
            수업 영상, 결과 공유 영상, 온라인 회의 녹화 링크 등을 등록합니다.
          </p>
        </div>

        {readOnly ? (
          filledLinks.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="rounded-card border border-skysoft-100 bg-skysoft-50/70 px-4 py-3"
                >
                  <p className="text-xs font-extrabold text-skysoft-700">영상 링크 {index + 1}</p>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-2 break-all text-sm font-black text-ink-900 underline decoration-skysoft-300 underline-offset-4"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {link}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-slate-400">미입력</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="제출된 영상 링크가 없습니다" />
          )
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {links.map((link, index) => (
              <Field key={index} label={`영상 링크 ${index + 1}`}>
                <TextInput
                  value={link}
                  onChange={(event) => {
                    const next = [...links];
                    next[index] = event.target.value;
                    setLinks(next);
                  }}
                  placeholder="예: https://example.com/video"
                />
              </Field>
            ))}
            <Button
              className="mt-2 sm:col-span-2 xl:col-span-5"
              icon={<Save className="h-4 w-4" />}
              loading={saving}
              onClick={handleSave}
            >
              영상 링크 저장
            </Button>
          </div>
        )}
      </StaticCard>
    </section>
  );
}
