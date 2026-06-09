"use client";

import { Download } from "lucide-react";
import { PROGRAMS } from "@/lib/constants";
import type { MediaItem, SchoolProfile } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

export function ImageGalleryModal({
  open,
  onClose,
  school,
  media
}: {
  open: boolean;
  onClose: () => void;
  school: SchoolProfile | null;
  media: MediaItem[];
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${school?.schoolName ?? "학교"} 이미지 갤러리`}
      className="max-w-5xl"
    >
      {media.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <figure
              key={item.id ?? item.storagePath}
              className="overflow-hidden rounded-card border border-skysoft-100 bg-white shadow-soft"
            >
              <a href={item.url} download={item.fileName} target="_blank" rel="noreferrer">
                <img src={item.url} alt={item.fileName} className="aspect-square w-full object-cover" />
              </a>
              <figcaption className="grid gap-2 p-3">
                <span className="text-xs font-extrabold text-slate-500">
                  {PROGRAMS[item.type].label}
                </span>
                <a
                  href={item.url}
                  download={item.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-skysoft-100 px-3 py-2 text-xs font-extrabold text-skysoft-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  다운로드
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <EmptyState title="제출된 이미지가 없습니다" />
      )}
    </Modal>
  );
}
