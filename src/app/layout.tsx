import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

// Metadata = المعلومات اللي تظهر في التاب وعند المشاركة
export const metadata: Metadata = {
  title: "FitCoach AI",
  description: "Your personal AI fitness coach",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitCoach AI",
  },
};

// Viewport منفصل عن Metadata في Next.js الجديد
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">
        {/* المحتوى الرئيسي — pb-20 عشان ما يختفي تحت الـ nav bar */}
        <main className="flex-1 pb-20">{children}</main>

        {/* شريط التنقل السفلي */}
        <BottomNav />
      </body>
    </html>
  );
}
