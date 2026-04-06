import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { LiffProvider } from "@/lib/liff";
import { BuyerProvider } from "@/context/BuyerContext";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Order Management System | Admin & Ordering",
  description: "Next-generation ordering and buying management system.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
  return (
    <html lang="en">
      <body className={`${sarabun.className} text-gray-900`}>
        <div className="app-shell min-h-screen">
          <LiffProvider liffId={liffId}>
            <BuyerProvider>
              <main className="relative mx-auto min-h-screen">
                {children}
              </main>
            </BuyerProvider>
          </LiffProvider>
        </div>
      </body>
    </html>
  );
}
