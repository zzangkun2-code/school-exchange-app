import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(value?: string) {
  if (!value) return "";

  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
}

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key)
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin SDK 환경변수가 설정되지 않았습니다.");
  }

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY 형식이 올바르지 않습니다. 서비스 계정 JSON의 private_key 전체를 넣어 주세요.");
  }

  return {
    projectId,
    clientEmail,
    privateKey
  };
}

function assertSameProject(projectId?: string) {
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && clientProjectId && projectId !== clientProjectId) {
    throw new Error(
      `Firebase 프로젝트 ID가 서로 다릅니다. NEXT_PUBLIC_FIREBASE_PROJECT_ID=${clientProjectId}, FIREBASE_PROJECT_ID=${projectId}`
    );
  }
}

export function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();
  assertSameProject(serviceAccount.projectId);

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
