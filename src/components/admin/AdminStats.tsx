"use client";

import { useMemo, useState } from "react";
import { BarChart3, PieChart, UsersRound } from "lucide-react";
import { BUSINESS_OPTIONS, PROGRAMS, PROGRAM_ORDER } from "@/lib/constants";
import { CONTINENTS } from "@/lib/country-data";
import { getScheduleCountries } from "@/lib/csv";
import type {
  Continent,
  FieldTripPayload,
  InvitationPayload,
  OnlinePayload,
  ProgramType,
  ScheduleItem,
  SchoolLevel,
  SchoolProfile
} from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { StaticCard } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Input";

const SCHOOL_LEVELS: Array<SchoolLevel | "전체"> = ["전체", "초등학교", "중학교", "고등학교"];
const CHART_COLORS = ["#62aef4", "#42c7a6", "#ef6fa5", "#fb9b5f", "#8b5cf6", "#14b8a6", "#f43f5e", "#84cc16"];

type StatItem = {
  label: string;
  value: number;
};

function countBy<T extends string>(items: T[], keys: T[]) {
  return keys.map((key) => ({
    key,
    value: items.filter((item) => item === key).length
  }));
}

function conicGradient(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total) return "#e2e8f0 0deg 360deg";

  let start = 0;
  return values
    .map((value, index) => {
      const degrees = (value / total) * 360;
      const segment = `${CHART_COLORS[index % CHART_COLORS.length]} ${start}deg ${start + degrees}deg`;
      start += degrees;
      return segment;
    })
    .join(", ");
}

function MetricCard({ label, value, helper }: { label: string; value: number; helper?: string }) {
  return (
    <StaticCard className="p-4">
      <p className="text-sm font-extrabold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink-900">{value.toLocaleString()}</p>
      {helper ? <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{helper}</p> : null}
    </StaticCard>
  );
}

function Legend({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center justify-between gap-3 text-sm font-bold">
          <span className="flex items-center gap-2 text-slate-600">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            {item.label}
          </span>
          <span className="text-ink-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieCard({ title, items }: { title: string; items: StatItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <StaticCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-ink-900">{title}</h3>
        <Badge tone={total ? "mint" : "neutral"}>{total}건</Badge>
      </div>
      <div
        className="mx-auto h-44 w-44 rounded-full"
        style={{
          background: `conic-gradient(${conicGradient(items.map((item) => item.value))})`
        }}
      />
      <div className="mt-4">
        <Legend items={items} />
      </div>
    </StaticCard>
  );
}

function buildUniqueContinentStats(schedules: ScheduleItem[], type: ProgramType): StatItem[] {
  const uniqueSchoolCountryPairs = new Set<string>();
  const continentCounts = new Map<Continent, number>();

  schedules
    .filter((item) => item.type === type)
    .forEach((item) => {
      getScheduleCountries(item).forEach((country) => {
        const key = `${item.ownerUid}::${country.country}`;
        if (uniqueSchoolCountryPairs.has(key)) return;

        uniqueSchoolCountryPairs.add(key);
        continentCounts.set(country.continent, (continentCounts.get(country.continent) ?? 0) + 1);
      });
    });

  return CONTINENTS.map((continent) => ({
    label: continent,
    value: continentCounts.get(continent) ?? 0
  }));
}

function getOnlineMaxStudentsBySchool(schedules: ScheduleItem[]) {
  const maxBySchool = new Map<string, number>();

  schedules
    .filter((item) => item.type === "online")
    .forEach((item) => {
      const payload = item.payload as OnlinePayload;
      const current = maxBySchool.get(item.ownerUid) ?? 0;
      const next = Number(payload.koreanStudentCount ?? 0);
      maxBySchool.set(item.ownerUid, Math.max(current, next));
    });

  return [...maxBySchool.values()].reduce((sum, value) => sum + value, 0);
}

function getParticipantTotals(schedules: ScheduleItem[]) {
  return schedules.reduce(
    (acc, item) => {
      if (item.type === "fieldTrip") {
        const payload = item.payload as FieldTripPayload;
        acc.fieldTripStudents += Number(payload.studentCount ?? 0);
        acc.fieldTripTeachers += Number(payload.teacherCount ?? 0);
      }

      if (item.type === "invitation") {
        const payload = item.payload as InvitationPayload;
        acc.invitationStudents += Number(payload.visitingStudentCount ?? 0);
        acc.invitationTeachers += Number(payload.visitingTeacherCount ?? 0);
      }

      return acc;
    },
    {
      fieldTripStudents: 0,
      invitationStudents: 0,
      fieldTripTeachers: 0,
      invitationTeachers: 0
    }
  );
}

export function AdminStats({
  schools,
  schedules
}: {
  schools: SchoolProfile[];
  schedules: ScheduleItem[];
}) {
  const years = useMemo(
    () => [...new Set(schools.map((school) => school.year).filter(Boolean))].sort((a, b) => b - a),
    [schools]
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">(years[0] ?? "all");
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | "전체">("전체");

  const filteredSchools = schools.filter((school) => {
    const yearMatch = selectedYear === "all" || school.year === selectedYear;
    const levelMatch = selectedLevel === "전체" || school.schoolLevel === selectedLevel;
    return yearMatch && levelMatch;
  });
  const filteredUids = new Set(filteredSchools.map((school) => school.uid));
  const filteredSchedules = schedules.filter((item) => filteredUids.has(item.ownerUid));

  const schoolLevelStats = countBy(
    filteredSchools.map((school) => school.schoolLevel),
    ["초등학교", "중학교", "고등학교"]
  );

  const businessStats = BUSINESS_OPTIONS.map((option) => ({
    label: option.shortLabel,
    value: filteredSchools.filter((school) => school.businessType === option.value).length
  }));

  const continentStatsByProgram = PROGRAM_ORDER.map((type) => ({
    type,
    title: `${PROGRAMS[type].label} 교류 대륙`,
    items: buildUniqueContinentStats(filteredSchedules, type)
  }));

  const participantTotals = getParticipantTotals(filteredSchedules);
  const onlineMaxStudents = getOnlineMaxStudentsBySchool(filteredSchedules);
  const maxBusiness = Math.max(...businessStats.map((item) => item.value), 1);
  const uniqueCountryCount = new Set(
    PROGRAM_ORDER.flatMap((type) =>
      filteredSchedules
        .filter((item) => item.type === type)
        .flatMap((item) => getScheduleCountries(item).map((country) => `${type}::${item.ownerUid}::${country.country}`))
    )
  ).size;

  return (
    <div className="grid gap-4">
      <StaticCard className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-skysoft-100 text-skysoft-700">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-mint-700">통계</p>
              <h2 className="text-xl font-black text-ink-900">교육청 보고용 집계 현황</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                대륙/국가 통계는 학교당 같은 국가를 1건으로만 계산합니다.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="연도 선택">
              <Select
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(event.target.value === "all" ? "all" : Number(event.target.value))
                }
              >
                <option value="all">전체 연도</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="학교급 필터">
              <Select
                value={selectedLevel}
                onChange={(event) => setSelectedLevel(event.target.value as SchoolLevel | "전체")}
              >
                {SCHOOL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </StaticCard>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="온라인 수업 참여 학생 수"
          value={onlineMaxStudents}
          helper="학교별 온라인 일정 중 최대 참여학생 수만 합산"
        />
        <MetricCard
          label="해외 현장체험학습 참여 학생 수"
          value={participantTotals.fieldTripStudents}
          helper="입력된 모든 현장체험 학생 수 합산"
        />
        <MetricCard
          label="초청 방문단 학생 수"
          value={participantTotals.invitationStudents}
          helper="입력된 모든 초청 방문단 학생 수 합산"
        />
        <MetricCard
          label="해외 현장체험 인솔 교사 총합"
          value={participantTotals.fieldTripTeachers}
          helper="한국 인솔교사 수 합산"
        />
        <MetricCard
          label="초청 교류 방문 교사 총합"
          value={participantTotals.invitationTeachers}
          helper="외국 방문교사 수 합산"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StaticCard className="p-5">
          <h3 className="mb-4 text-lg font-black text-ink-900">학교급 비율</h3>
          <div
            className="mx-auto h-44 w-44 rounded-full"
            style={{
              background: `conic-gradient(${conicGradient(schoolLevelStats.map((item) => item.value))})`
            }}
          />
          <div className="mt-4">
            <Legend items={schoolLevelStats.map((item) => ({ label: item.key, value: item.value }))} />
          </div>
        </StaticCard>

        <StaticCard className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-ink-900">
            <BarChart3 className="h-5 w-5 text-skysoft-700" />
            사업 유형 분포
          </h3>
          <div className="grid gap-3">
            {businessStats.map((item, index) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.value / maxBusiness) * 100}%`,
                      backgroundColor: CHART_COLORS[index]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </StaticCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {continentStatsByProgram.map((chart) => (
          <PieCard key={chart.type} title={chart.title} items={chart.items} />
        ))}
      </div>

      <StaticCard className="p-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="blue">
            <UsersRound className="h-3.5 w-3.5" />
            참여 학교 {filteredSchools.length}
          </Badge>
          <Badge tone="mint">일정 {filteredSchedules.length}</Badge>
          <Badge tone="peach">학교-국가 고유 조합 {uniqueCountryCount}</Badge>
        </div>
      </StaticCard>
    </div>
  );
}
