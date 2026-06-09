import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import { isConfiguredAdminEmail } from "@/lib/admin-accounts";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

async function assertAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    throw new Error("관리자 인증 토큰이 없습니다. 다시 로그인해 주세요.");
  }

  const decoded = await getAdminAuth().verifyIdToken(token);
  if (isConfiguredAdminEmail(decoded.email)) {
    return decoded.uid;
  }

  const adminDoc = await getAdminDb().doc(`admins/${decoded.uid}`).get();

  if (!adminDoc.exists) {
    throw new Error("관리자 권한이 없습니다.");
  }

  return decoded.uid;
}

export async function POST(request: NextRequest) {
  try {
    const adminUid = await assertAdmin(request);
    const body = (await request.json()) as {
      uid?: string;
      newPassword?: string;
    };

    if (!body.uid || !body.newPassword) {
      throw new Error("학교 UID와 새 비밀번호가 필요합니다.");
    }

    if (body.newPassword.length < 6) {
      throw new Error("새 비밀번호는 6자 이상이어야 합니다.");
    }

    await getAdminAuth().updateUser(body.uid, {
      password: body.newPassword
    });

    await getAdminDb().doc(`schools/${body.uid}`).set(
      {
        isFirstLogin: true,
        mustChangePassword: true,
        passwordResetBy: adminUid,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, uid: body.uid });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "비밀번호를 초기화하지 못했습니다."
      },
      { status: 400 }
    );
  }
}
