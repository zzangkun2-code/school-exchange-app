"use client";

import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventInput } from "@fullcalendar/core";
import koLocale from "@fullcalendar/core/locales/ko";
import { PROGRAMS } from "@/lib/constants";
import type { ScheduleItem } from "@/lib/types";
import { addDays } from "@/lib/utils";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false
});

function buildEvents(schedules: ScheduleItem[]): EventInput[] {
  return schedules.map((item) => {
    const program = PROGRAMS[item.type];
    const allDay = item.type !== "online";
    return {
      id: `${item.ownerUid}-${item.id}`,
      title: `${item.schoolName} · ${program.label}`,
      start: item.start,
      end: allDay ? addDays(item.end, 1) : item.start,
      allDay,
      backgroundColor: program.eventColor,
      borderColor: program.eventColor,
      textColor: "#ffffff"
    };
  });
}

export function AdminCalendar({ schedules }: { schedules: ScheduleItem[] }) {
  return (
    <div className="rounded-card border border-white/80 bg-white/80 p-3 shadow-soft">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        height="auto"
        dayMaxEvents
        events={buildEvents(schedules)}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek"
        }}
        buttonText={{
          today: "오늘",
          month: "월",
          week: "주"
        }}
      />
    </div>
  );
}
