"use client";

import { ChevronRight, Mail, Map, NotebookTabs } from "lucide-react";
import { BUSINESS_OPTIONS, BUSINESS_TABS, PROGRAMS } from "@/lib/constants";
import type { ScheduleItem, SchoolProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function SchoolCard({
  school,
  schedules,
  selected,
  onClick
}: {
  school: SchoolProfile;
  schedules: ScheduleItem[];
  selected: boolean;
  onClick: () => void;
}) {
  const tabs = BUSINESS_TABS[school.businessType];
  const businessLabel =
    BUSINESS_OPTIONS.find((option) => option.value === school.businessType)?.shortLabel ??
    school.businessType;

  return (
    <button type="button" className="text-left" onClick={onClick}>
      <Card
        className={cn(
          "p-4",
          selected ? "border-skysoft-200 bg-skysoft-50/90" : "bg-white/80"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-ink-900">{school.schoolName}</h3>
              <Badge tone="blue">{businessLabel}</Badge>
              <Badge tone="mint">{school.schoolId}</Badge>
              <Badge tone="peach">
                {school.year}년 · {school.schoolLevel}
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
              <Mail className="h-4 w-4" />
              {school.email}
            </p>
          </div>
          <ChevronRight className="mt-1 h-5 w-5 text-slate-400" />
        </div>

        <div className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
          <p className="flex items-start gap-2">
            <Map className="mt-0.5 h-4 w-4 shrink-0 text-mint-700" />
            {school.partnerInfo || "교류국/교류학교 미입력"}
          </p>
          <p className="flex items-start gap-2">
            <NotebookTabs className="mt-0.5 h-4 w-4 shrink-0 text-pinkwarm-700" />
            {school.theme || "운영주제 미입력"}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const hasSchedule = schedules.some((item) => item.type === tab);
            return (
              <StatusBadge key={tab} complete={hasSchedule}>
                {PROGRAMS[tab].label} {hasSchedule ? "입력" : "미입력"}
              </StatusBadge>
            );
          })}
        </div>
      </Card>
    </button>
  );
}
