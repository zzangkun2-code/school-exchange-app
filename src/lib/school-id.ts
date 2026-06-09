import { EXCHANGE_EMAIL_DOMAIN } from "@/lib/constants";
import type { SchoolLevel } from "@/lib/types";

const LEVEL_LABELS: Record<"e" | "m" | "h", SchoolLevel> = {
  e: "초등학교",
  m: "중학교",
  h: "고등학교"
};

const SCHOOL_ID_PATTERN = /^(\d{2})([emh])(\d{2,3})$/i;

export function normalizeSchoolId(value: string) {
  return value.trim().toLowerCase();
}

export function schoolIdToEmail(schoolId: string) {
  return `${normalizeSchoolId(schoolId)}${EXCHANGE_EMAIL_DOMAIN}`;
}

export function loginIdToEmail(value: string, isSchool: boolean) {
  const trimmed = value.trim().toLowerCase();
  if (!isSchool || trimmed.includes("@")) {
    return trimmed;
  }
  return schoolIdToEmail(trimmed);
}

export function parseSchoolId(value: string) {
  const schoolId = normalizeSchoolId(value);
  const match = schoolId.match(SCHOOL_ID_PATTERN);

  if (!match) {
    throw new Error("학교 ID는 26e01, 26m03, 26h17, 27e05 형식으로 입력해 주세요.");
  }

  const [, yearPart, levelPart, sequencePart] = match;
  const levelCode = levelPart.toLowerCase() as "e" | "m" | "h";
  const year = 2000 + Number(yearPart);
  const sequence = Number(sequencePart);

  return {
    schoolId,
    year,
    schoolLevel: LEVEL_LABELS[levelCode],
    sequence,
    email: schoolIdToEmail(schoolId)
  };
}
