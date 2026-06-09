"use client";

import { Loader2, LogOut } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { LoginScreen } from "@/components/LoginScreen";
import { MissingProfileNotice } from "@/components/MissingProfileNotice";
import { Button } from "@/components/ui/Button";
import { StaticCard } from "@/components/ui/Card";

function AppContent() {
  const { user, role, profile, loading, error, logout } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <StaticCard className="flex items-center gap-3 px-6 py-5">
          <Loader2 className="h-5 w-5 animate-spin text-skysoft-700" />
          <span className="font-extrabold text-ink-700">화면을 준비하고 있어요</span>
        </StaticCard>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (role === "school" && !profile) {
    return <MissingProfileNotice />;
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/jeonbuk-office-logo.svg"
            alt="전북특별자치도교육청"
            className="h-12 w-auto rounded-card bg-white shadow-soft"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-black text-ink-900">국제교류수업사업 관리</p>
            <p className="text-xs font-bold text-slate-500">{user.email}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<LogOut className="h-4 w-4" />}
          onClick={logout}
          className="px-4"
        >
          로그아웃
        </Button>
      </div>

      {error ? (
        <div className="mx-auto mb-4 max-w-7xl rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      {role === "admin" ? <AdminDashboard /> : profile ? <UserDashboard profile={profile} /> : null}
    </main>
  );
}

export function AppRouter() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
