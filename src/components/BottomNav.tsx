// BottomNav.tsx
// شريط التنقل السفلي — مثل اللي تشوفه في أي تطبيق جوال
//
// "use client" = هذا الكومبوننت يشتغل على المتصفح (client side)
// ليش؟ لأنه يحتاج يعرف وش الصفحة الحالية (usePathname)
// ويتفاعل مع ضغطات المستخدم
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// كل تاب: الاسم، الرابط، والأيقونة (SVG بسيط)
const tabs = [
  {
    name: "Home",
    href: "/",
    // أيقونة بيت
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    name: "Workout",
    href: "/workout",
    // أيقونة دامبل
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h2.25M3 12h2.25m0-4.5v9m0-9h2.25m0 0V6a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v3m-5.25 0h5.25m0 0v9m0-9h2.25M15.75 12h2.25m0-4.5v9m0-9h2.25m0 0V6a1.5 1.5 0 0 1 1.5-1.5H21M21 7.5v9m-2.25-9h2.25" />
      </svg>
    ),
  },
  {
    name: "Weight",
    href: "/weight",
    // أيقونة ميزان
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
      </svg>
    ),
  },
  {
    name: "Coach",
    href: "/coach",
    // أيقونة دماغ/ذكاء
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  // usePathname() — يعطينا الرابط الحالي (مثلاً "/" أو "/workout")
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      {/* safe-area-inset = مساحة آمنة للأيفون اللي عنده notch */}
      <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          // نشيك إذا هذا التاب هو الصفحة الحالية
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "text-blue-600 font-semibold" // لون أزرق للتاب النشط
                  : "text-slate-400 hover:text-slate-600" // رمادي للباقي
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
