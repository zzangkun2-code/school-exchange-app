"use client";

import { Edit3, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PROGRAMS } from "@/lib/constants";
import { countriesToText } from "@/lib/country-data";
import type {
  FieldTripPayload,
  InvitationPayload,
  OnlinePayload,
  ScheduleItem
} from "@/lib/types";
import { formatKoreanDate } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-card border border-skysoft-100 bg-skysoft-50/60 px-4 py-3">
      <p className="text-xs font-extrabold text-skysoft-700">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-ink-900">
        {value || "등록된 정보가 없습니다"}
      </p>
    </div>
  );
}

function getDateText(item: ScheduleItem) {
  if (item.type === "online" || item.start === item.end) {
    return formatKoreanDate(item.start);
  }
  return `${formatKoreanDate(item.start)} ~ ${formatKoreanDate(item.end)}`;
}

export function ScheduleDetailModal({
  item,
  videoLinks = [],
  onClose,
  onEdit
}: {
  item: ScheduleItem | null;
  videoLinks?: string[];
  onClose: () => void;
  onEdit?: (item: ScheduleItem) => void;
}) {
  if (!item) return null;

  const program = PROGRAMS[item.type];
  const Icon = program.icon;

  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title="일정 상세보기"
      className="max-w-3xl"
      footer={
        onEdit ? (
          <Button
            type="button"
            variant="secondary"
            icon={<Edit3 className="h-4 w-4" />}
            onClick={() => onEdit(item)}
          >
            수정 화면 열기
          </Button>
        ) : null
      }
    >
      <div className="grid gap-4">
        <div className="flex items-start gap-3 rounded-card bg-white p-4 shadow-soft">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${program.chip}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-500">{program.label}</p>
            <h3 className="text-xl font-black text-ink-900">{item.schoolName}</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">{getDateText(item)}</p>
          </div>
        </div>

        {item.type === "online" ? (
          <OnlineDetails payload={item.payload as OnlinePayload} />
        ) : null}
        {item.type === "fieldTrip" ? (
          <FieldTripDetails payload={item.payload as FieldTripPayload} />
        ) : null}
        {item.type === "invitation" ? (
          <InvitationDetails payload={item.payload as InvitationPayload} />
        ) : null}

        <VideoLinkDetails links={videoLinks} />
      </div>
    </Modal>
  );
}

function OnlineDetails({ payload }: { payload: OnlinePayload }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailRow label="교류국가" value={countriesToText(payload.countries)} />
      <DetailRow label="파트너 학교" value={payload.partnerSchool} />
      <DetailRow label="수업시간" value={payload.classTime} />
      <DetailRow label="참여학생 수(한국측)" value={`${payload.koreanStudentCount || 0}명`} />
    </div>
  );
}

function FieldTripDetails({ payload }: { payload: FieldTripPayload }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailRow label="교류국가" value={countriesToText(payload.countries)} />
      <DetailRow label="방문도시" value={payload.visitingCity} />
      <DetailRow label="방문학교명" value={payload.visitingSchoolName} />
      <DetailRow label="참여학생 수" value={`${payload.studentCount || 0}명`} />
      <DetailRow label="인솔교사 수" value={`${payload.teacherCount || 0}명`} />
    </div>
  );
}

function InvitationDetails({ payload }: { payload: InvitationPayload }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailRow label="초청단 국가" value={countriesToText(payload.countries)} />
      <DetailRow label="방문단 학교명" value={payload.visitingSchoolName} />
      <DetailRow label="방문단 학생 수" value={`${payload.visitingStudentCount || 0}명`} />
      <DetailRow label="방문단 교사 수" value={`${payload.visitingTeacherCount || 0}명`} />
      <DetailRow label="수업참여 학생 수(한국측)" value={`${payload.koreanStudentCount || 0}명`} />
    </div>
  );
}

function VideoLinkDetails({ links }: { links: string[] }) {
  const fiveLinks = [...links, "", "", "", "", ""].slice(0, 5);
  const hasLinks = fiveLinks.some(Boolean);

  return (
    <div className="rounded-card border border-skysoft-100 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-skysoft-100 text-skysoft-700">
          <LinkIcon className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-base font-black text-ink-900">제출된 영상 링크</h4>
          <p className="text-xs font-bold text-slate-500">학교가 제출한 영상 링크 5개입니다.</p>
        </div>
      </div>

      {hasLinks ? (
        <div className="grid gap-2">
          {fiveLinks.map((link, index) => (
            <div
              key={index}
              className="rounded-card border border-skysoft-100 bg-skysoft-50/60 px-4 py-3"
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
        <p className="rounded-card bg-skysoft-50 px-4 py-3 text-sm font-bold text-slate-500">
          제출된 영상 링크가 없습니다.
        </p>
      )}
    </div>
  );
}
