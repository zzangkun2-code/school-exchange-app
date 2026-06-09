import imageCompression from "browser-image-compression";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { requireStorage } from "@/lib/firebase";
import type { ProgramType } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function cleanFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function compressAndUploadImage(
  uid: string,
  type: ProgramType,
  file: File
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 4.8,
    maxWidthOrHeight: 1800,
    useWebWorker: true,
    initialQuality: 0.82
  });

  if (compressed.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지를 5MB 이하로 줄일 수 없습니다. 더 작은 파일을 선택해 주세요.");
  }

  const storagePath = `schools/${uid}/media/${type}/${Date.now()}-${cleanFileName(file.name)}`;
  const fileRef = ref(requireStorage(), storagePath);
  await uploadBytes(fileRef, compressed, {
    contentType: compressed.type || file.type
  });

  return {
    url: await getDownloadURL(fileRef),
    storagePath,
    size: compressed.size,
    fileName: file.name
  };
}

export async function deleteUploadedImage(storagePath: string) {
  await deleteObject(ref(requireStorage(), storagePath));
}
