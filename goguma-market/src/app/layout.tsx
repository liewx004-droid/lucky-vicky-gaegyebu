import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "🍠 고구마마켓 - 달콤한 중고거래",
  description: "귀여운 중고거래 마켓, 고구마마켓!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-6 text-sm text-orange-400 font-medium">
          🍠 고구마마켓 &copy; 2026 · 달콤한 중고거래
        </footer>
      </body>
    </html>
  );
}
