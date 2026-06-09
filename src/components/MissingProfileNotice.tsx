"use client";

import { AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { StaticCard } from "@/components/ui/Card";

export function MissingProfileNotice() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <StaticCard className="w-full max-w-xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-ink-900">학교 정보가 아직 연결되지 않았습니다</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-slate-600">
          현재 로그인한 계정({user?.email})에 해당하는 학교 문서가 없습니다. 교육청 관리자에게
          학교 계정 발급 상태를 확인해 주세요.
        </p>
        <Button
          className="mt-6"
          variant="secondary"
          icon={<LogOut className="h-4 w-4" />}
          onClick={logout}
        >
          다른 계정으로 로그인
        </Button>
      </StaticCard>
    </main>
  );
}
