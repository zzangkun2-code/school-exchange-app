"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { updateSchoolProfile } from "@/lib/firestore";
import type { SchoolProfile } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StaticCard } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Input";

export function SchoolInfoEditor({ profile }: { profile: SchoolProfile }) {
  const [partnerInfo, setPartnerInfo] = useState(profile.partnerInfo ?? "");
  const [theme, setTheme] = useState(profile.theme ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateSchoolProfile(profile.uid, { partnerInfo, theme });
      setMessage("학교 입력 정보가 저장되었습니다.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "학교 정보를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaticCard className="p-5">
      <div className="mb-4">
        <p className="text-sm font-extrabold text-skysoft-700">학교 입력 정보</p>
        <h2 className="text-xl font-black text-ink-900">교류 정보와 운영주제</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">
          학교 ID, 학교명, 사업유형은 교육청 관리자만 수정합니다.
        </p>
      </div>

      {message ? (
        <div className="mb-4 rounded-card border border-mint-200 bg-mint-50 px-4 py-3 text-sm font-extrabold text-mint-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
          {error}
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="교류국/교류학교">
          <TextInput
            value={partnerInfo}
            onChange={(event) => setPartnerInfo(event.target.value)}
            placeholder="예: 일본 오사카 / 사쿠라중학교"
            required
          />
        </Field>
        <Field label="운영주제">
          <TextInput
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            placeholder="예: 지속가능한 문화교류"
            required
          />
        </Field>
        <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />} className="w-fit">
          학교 정보 저장
        </Button>
      </form>
    </StaticCard>
  );
}
