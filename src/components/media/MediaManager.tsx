"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Link as LinkIcon, Save, Trash2 } from "lucide-react";
import { PROGRAMS } from "@/lib/constants";
import {
  addMediaItem,
  deleteMediaItemDoc,
  saveVideoLinks,
  subscribeMedia,
  subscribeVideoLinks
} from "@/lib/firestore";
import { compressAndUploadImage, deleteUploadedImage } from "@/lib/media";
import type { MediaItem, ProgramType, SchoolProfile } from "@/lib/types";
import { isHttpUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StaticCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput } from "@/components/ui/Input";

export function MediaManager({
  profile,
  type,
  onBack
}: {
  profile: SchoolProfile;
  type: ProgramType;
  onBack: () => void;
}) {
  const program = PROGRAMS[type];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [links, setLinks] = useState<string[]>(["", "", "", "", ""]);
  const [uploading, setUploading] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeMedia(profile.uid, type, setMedia, (mediaError) =>
      setError(mediaError.message)
    );
    return unsubscribe;
  }, [profile.uid, type]);

  useEffect(() => {
    if (type !== "online") {
      setLinks(["", "", "", "", ""]);
      return undefined;
    }

    const unsubscribe = subscribeVideoLinks(
      profile.uid,
      (nextLinks) => {
        const padded = [...nextLinks.urls, "", "", "", "", ""].slice(0, 5);
        setLinks(padded);
      },
      (linkError) => setError(linkError.message)
    );
    return unsubscribe;
  }, [profile.uid, type]);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const uploaded = await compressAndUploadImage(profile.uid, type, file);
        await addMediaItem(profile.uid, {
          ownerUid: profile.uid,
          type,
          ...uploaded
        });
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "이미지를 업로드하지 못했습니다.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!item.id) return;
    setError(null);
    try {
      await deleteUploadedImage(item.storagePath);
      await deleteMediaItemDoc(profile.uid, item.id);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "이미지를 삭제하지 못했습니다.");
    }
  };

  const handleSaveLinks = async () => {
    const trimmed = links.map((link) => link.trim());
    const invalid = trimmed.filter(Boolean).find((link) => !isHttpUrl(link));
    if (invalid) {
      setError("동영상 링크는 http 또는 https 주소만 입력할 수 있습니다.");
      return;
    }

    setSavingLinks(true);
    setError(null);
    try {
      await saveVideoLinks(profile.uid, trimmed);
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : "동영상 링크를 저장하지 못했습니다.");
    } finally {
      setSavingLinks(false);
    }
  };

  return (
    <section className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-extrabold text-skysoft-700">{program.label}</p>
          <h2 className="text-2xl font-black text-ink-900">미디어 제출</h2>
        </div>
        <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          일정 목록
        </Button>
      </div>

      {error ? (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <StaticCard className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-black text-ink-900">이미지</h3>
            <p className="text-sm font-bold text-slate-500">5MB 이하로 압축 후 저장됩니다</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <Button
            icon={<ImagePlus className="h-4 w-4" />}
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            이미지 업로드
          </Button>
        </div>

        {media.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item) => (
              <figure
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-card border border-skysoft-100 bg-skysoft-50"
              >
                <img src={item.url} alt={item.fileName} className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="focus-ring absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white opacity-95 shadow-soft transition hover:-translate-y-0.5 hover:bg-red-600"
                  onClick={() => handleDelete(item)}
                  aria-label={`${item.fileName} 삭제`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </figure>
            ))}
          </div>
        ) : (
          <EmptyState title="제출된 이미지가 없습니다" className="mt-5" />
        )}
      </StaticCard>

      {type === "online" ? (
        <StaticCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skysoft-100 text-skysoft-700">
              <LinkIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-ink-900">동영상 링크</h3>
          </div>
          <div className="grid gap-3">
            {links.map((link, index) => (
              <Field key={index} label={`URL ${index + 1}`}>
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
          </div>
          <Button
            className="mt-4"
            icon={<Save className="h-4 w-4" />}
            loading={savingLinks}
            onClick={handleSaveLinks}
          >
            링크 저장
          </Button>
        </StaticCard>
      ) : null}
    </section>
  );
}
