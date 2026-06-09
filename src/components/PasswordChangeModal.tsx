"use client";

import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FormEvent, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { updateSchoolProfile } from "@/lib/firestore";

export function PasswordChangeModal({
  open,
  onClose,
  force = false
}: {
  open: boolean;
  onClose: () => void;
  force?: boolean;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!user?.email || !profile) {
        throw new Error("로그인 정보가 없습니다.");
      }

      if (newPassword.length < 6) {
        throw new Error("새 비밀번호는 6자 이상이어야 합니다.");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("새 비밀번호 확인이 일치하지 않습니다.");
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      await updateSchoolProfile(profile.uid, {
        isFirstLogin: false,
        mustChangePassword: false
      });
      refreshProfile();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("비밀번호가 변경되었습니다.");
      if (force) {
        onClose();
      }
    } catch (passwordError) {
      setError(
        passwordError instanceof Error
          ? passwordError.message
          : "비밀번호를 변경하지 못했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={force ? "최초 로그인 비밀번호 변경" : "비밀번호 변경"}
      onClose={force ? () => undefined : onClose}
      footer={
        <Button
          type="submit"
          form="password-change-form"
          icon={<Save className="h-4 w-4" />}
          loading={saving}
        >
          변경 저장
        </Button>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-card bg-mint-50 px-4 py-3 text-mint-700">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm font-bold leading-6">
          {force
            ? "초기 비밀번호 상태입니다. 계속 사용하기 전에 새 비밀번호로 변경해 주세요."
            : "학교에서 사용할 새 비밀번호로 변경할 수 있습니다."}
        </p>
      </div>

      {message ? (
        <div className="mb-4 rounded-card border border-mint-200 bg-mint-50 px-4 py-3 text-sm font-extrabold text-mint-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
          {error}
        </div>
      ) : null}

      <form id="password-change-form" className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="현재 비밀번호">
          <TextInput
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </Field>
        <Field label="새 비밀번호">
          <TextInput
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={6}
            required
          />
        </Field>
        <Field label="새 비밀번호 확인">
          <TextInput
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
          />
        </Field>
      </form>
    </Modal>
  );
}
