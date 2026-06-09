"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { auth, requireAuth } from "@/lib/firebase";
import { isAdminUser, subscribeSchoolProfile } from "@/lib/firestore";
import type { SchoolProfile, UserRole } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  role: UserRole | null;
  profile: SchoolProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribeProfile?.();
      setError(null);
      setUser(currentUser);
      setProfile(null);
      setRole(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const admin = await isAdminUser(currentUser.uid);
        if (admin) {
          setRole("admin");
          setLoading(false);
          return;
        }

        setRole("school");
        unsubscribeProfile = subscribeSchoolProfile(
          currentUser.uid,
          (nextProfile) => {
            setProfile(nextProfile);
            setLoading(false);
          },
          (profileError) => {
            setError(profileError.message);
            setLoading(false);
          }
        );
      } catch (authError) {
        setError(authError instanceof Error ? authError.message : "로그인 정보를 확인하지 못했습니다.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, [profileVersion]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      profile,
      loading,
      error,
      refreshProfile: () => setProfileVersion((value) => value + 1),
      logout: async () => {
        await signOut(requireAuth());
      }
    }),
    [error, loading, profile, role, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
