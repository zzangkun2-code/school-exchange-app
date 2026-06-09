"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Trash2 } from "lucide-react";
import { CountryMultiSelect } from "@/components/countries/CountryMultiSelect";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PROGRAMS } from "@/lib/constants";
import { normalizeCountries, countriesToText } from "@/lib/country-data";
import type {
  CalendarDraft,
  CountrySelection,
  FieldTripPayload,
  InvitationPayload,
  OnlinePayload,
  ProgramType,
  ScheduleItem,
  SchoolProfile
} from "@/lib/types";
import { safeNumber } from "@/lib/utils";

type FormState = {
  start: string;
  end: string;
  classTime: string;
  koreanStudentCount: number;
  countries: CountrySelection[];
  partnerSchool: string;
  visitingCity: string;
  visitingSchoolName: string;
  studentCount: number;
  teacherCount: number;
  visitingStudentCount: number;
  visitingTeacherCount: number;
};

const emptyState: FormState = {
  start: "",
  end: "",
  classTime: "",
  koreanStudentCount: 0,
  countries: [],
  partnerSchool: "",
  visitingCity: "",
  visitingSchoolName: "",
  studentCount: 0,
  teacherCount: 0,
  visitingStudentCount: 0,
  visitingTeacherCount: 0
};

function countriesFromPayload(payload: Record<string, unknown>) {
  const fromCountries = normalizeCountries(payload.countries);
  if (fromCountries.length) return fromCountries;
  const fromCountry = normalizeCountries(payload.country);
  if (fromCountry.length) return fromCountry;
  return normalizeCountries(payload.invitedCountry);
}

function getInitialState(draft: CalendarDraft | null, item: ScheduleItem | null): FormState {
  if (item) {
    const payload = item.payload as unknown as Record<string, unknown>;
    return {
      ...emptyState,
      start: item.start,
      end: item.end,
      classTime: String(payload.classTime ?? ""),
      koreanStudentCount: Number(payload.koreanStudentCount ?? 0),
      countries: countriesFromPayload(payload),
      partnerSchool: String(payload.partnerSchool ?? ""),
      visitingCity: String(payload.visitingCity ?? payload.countryCity ?? ""),
      visitingSchoolName: String(payload.visitingSchoolName ?? ""),
      studentCount: Number(payload.studentCount ?? 0),
      teacherCount: Number(payload.teacherCount ?? 0),
      visitingStudentCount: Number(payload.visitingStudentCount ?? 0),
      visitingTeacherCount: Number(payload.visitingTeacherCount ?? 0)
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  return {
    ...emptyState,
    start: draft?.start ?? today,
    end: draft?.end ?? draft?.start ?? today
  };
}

function buildTitle(type: ProgramType, state: FormState) {
  const countryText = countriesToText(state.countries) || "교류국가";
  if (type === "online") {
    return `${state.classTime || "온라인수업"} · ${countryText}`;
  }
  if (type === "fieldTrip") {
    return `${countryText} 현장체험`;
  }
  return `${countryText} 초청수업`;
}

function validateCountries(countries: CountrySelection[]) {
  if (!countries.length) {
    throw new Error("교류국가를 1개 이상 선택해 주세요.");
  }

  if (countries.some((item) => !item.country.trim())) {
    throw new Error("기타 국가명을 입력해 주세요.");
  }
}

function buildPayload(type: ProgramType, state: FormState, formData: FormData) {
  if (type === "online") {
    return {
      classTime: String(formData.get("classTime") ?? ""),
      koreanStudentCount: safeNumber(formData.get("koreanStudentCount")),
      countries: state.countries,
      partnerSchool: String(formData.get("partnerSchool") ?? "")
    } satisfies OnlinePayload;
  }

  if (type === "fieldTrip") {
    return {
      countries: state.countries,
      visitingCity: String(formData.get("visitingCity") ?? ""),
      visitingSchoolName: String(formData.get("visitingSchoolName") ?? ""),
      studentCount: safeNumber(formData.get("studentCount")),
      teacherCount: safeNumber(formData.get("teacherCount"))
    } satisfies FieldTripPayload;
  }

  return {
    countries: state.countries,
    visitingSchoolName: String(formData.get("visitingSchoolName") ?? ""),
    visitingStudentCount: safeNumber(formData.get("visitingStudentCount")),
    visitingTeacherCount: safeNumber(formData.get("visitingTeacherCount")),
    koreanStudentCount: safeNumber(formData.get("koreanStudentCount"))
  } satisfies InvitationPayload;
}

export function ScheduleFormModal({
  draft,
  editingItem,
  profile,
  onClose,
  onSave,
  onDelete
}: {
  draft: CalendarDraft | null;
  editingItem: ScheduleItem | null;
  profile: SchoolProfile;
  onClose: () => void;
  onSave: (item: ScheduleItem) => Promise<void>;
  onDelete: (item: ScheduleItem) => Promise<void>;
}) {
  const open = Boolean(draft || editingItem);
  const type = editingItem?.type ?? draft?.type ?? "online";
  const program = PROGRAMS[type];
  const [state, setState] = useState<FormState>(() => getInitialState(draft, editingItem));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState(getInitialState(draft, editingItem));
    setError(null);
  }, [draft, editingItem]);

  const modalTitle = useMemo(
    () => `${program.label} ${editingItem ? "수정" : "입력"}`,
    [editingItem, program.label]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextState: FormState = {
      ...state,
      start: String(formData.get("start") ?? state.start),
      end: String(formData.get("end") ?? state.end),
      classTime: String(formData.get("classTime") ?? state.classTime),
      koreanStudentCount: safeNumber(formData.get("koreanStudentCount")),
      partnerSchool: String(formData.get("partnerSchool") ?? state.partnerSchool),
      visitingCity: String(formData.get("visitingCity") ?? state.visitingCity),
      visitingSchoolName: String(formData.get("visitingSchoolName") ?? state.visitingSchoolName),
      studentCount: safeNumber(formData.get("studentCount")),
      teacherCount: safeNumber(formData.get("teacherCount")),
      visitingStudentCount: safeNumber(formData.get("visitingStudentCount")),
      visitingTeacherCount: safeNumber(formData.get("visitingTeacherCount"))
    };

    try {
      validateCountries(nextState.countries);
      if (nextState.end < nextState.start) {
        throw new Error("종료일은 시작일 이후로 선택해 주세요.");
      }

      setSaving(true);
      setError(null);
      await onSave({
        id: editingItem?.id,
        ownerUid: profile.uid,
        schoolName: profile.schoolName,
        type,
        title: buildTitle(type, nextState),
        start: nextState.start,
        end: type === "online" ? nextState.start : nextState.end,
        payload: buildPayload(type, nextState, formData)
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "일정을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(editingItem);
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "일정을 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
      footer={
        <>
          {editingItem ? (
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              loading={deleting}
              onClick={handleDelete}
            >
              삭제
            </Button>
          ) : null}
          <Button
            form="schedule-form"
            type="submit"
            icon={<CalendarCheck className="h-4 w-4" />}
            loading={saving}
          >
            저장
          </Button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <form id="schedule-form" className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={type === "online" ? "수업 날짜" : "시작일"}>
            <TextInput
              type="date"
              name="start"
              value={state.start}
              onChange={(event) => setState((prev) => ({ ...prev, start: event.target.value }))}
              required
            />
          </Field>
          {type !== "online" ? (
            <Field label="종료일">
              <TextInput
                type="date"
                name="end"
                value={state.end}
                onChange={(event) => setState((prev) => ({ ...prev, end: event.target.value }))}
                required
              />
            </Field>
          ) : null}
        </div>

        <CountryMultiSelect
          value={state.countries}
          onChange={(countries) => setState((prev) => ({ ...prev, countries }))}
          label={type === "fieldTrip" ? "교류국가" : "교류국가"}
        />

        {type === "online" ? (
          <>
            <Field label="수업시간">
              <TextInput
                name="classTime"
                defaultValue={state.classTime}
                placeholder="예: 10:00~11:40"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="참여학생 수(한국측)">
                <TextInput
                  type="number"
                  min={0}
                  name="koreanStudentCount"
                  defaultValue={state.koreanStudentCount || ""}
                  placeholder="예: 24"
                  required
                />
              </Field>
              <Field label="파트너 학교">
                <TextInput
                  name="partnerSchool"
                  defaultValue={state.partnerSchool}
                  placeholder="예: 하노이 글로벌스쿨"
                  required
                />
              </Field>
            </div>
          </>
        ) : null}

        {type === "fieldTrip" ? (
          <>
            <Field label="방문도시">
              <TextInput
                name="visitingCity"
                defaultValue={state.visitingCity}
                placeholder="예: 시드니"
                required
              />
            </Field>
            <Field label="방문학교명">
              <TextInput
                name="visitingSchoolName"
                defaultValue={state.visitingSchoolName}
                placeholder="예: Sydney Future College"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="참여학생 수">
                <TextInput
                  type="number"
                  min={0}
                  name="studentCount"
                  defaultValue={state.studentCount || ""}
                  placeholder="예: 18"
                  required
                />
              </Field>
              <Field label="인솔교사 수">
                <TextInput
                  type="number"
                  min={0}
                  name="teacherCount"
                  defaultValue={state.teacherCount || ""}
                  placeholder="예: 3"
                  required
                />
              </Field>
            </div>
          </>
        ) : null}

        {type === "invitation" ? (
          <>
            <Field label="방문단 학교명">
              <TextInput
                name="visitingSchoolName"
                defaultValue={state.visitingSchoolName}
                placeholder="예: Paris Lumiere School"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="방문단 학생 수">
                <TextInput
                  type="number"
                  min={0}
                  name="visitingStudentCount"
                  defaultValue={state.visitingStudentCount || ""}
                  placeholder="예: 20"
                  required
                />
              </Field>
              <Field label="방문단 교사 수">
                <TextInput
                  type="number"
                  min={0}
                  name="visitingTeacherCount"
                  defaultValue={state.visitingTeacherCount || ""}
                  placeholder="예: 4"
                  required
                />
              </Field>
              <Field label="수업참여 학생 수(한국측)">
                <TextInput
                  type="number"
                  min={0}
                  name="koreanStudentCount"
                  defaultValue={state.koreanStudentCount || ""}
                  placeholder="예: 28"
                  required
                />
              </Field>
            </div>
          </>
        ) : null}
      </form>
    </Modal>
  );
}
