import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitchfolio",
  description: "Invest in ideas, compare outcomes, and track returns with Pitchfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
