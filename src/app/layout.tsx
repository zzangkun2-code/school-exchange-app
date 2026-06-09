import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "국제교류수업사업 관리",
  description: "국제교류수업사업 관리 웹앱"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d7f8ee"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
