// page.tsx — الصفحة الرئيسية (Home)
//
// في Next.js، هذا الملف يتحمل لما تفتح "/" (الرابط الرئيسي)
// كل page.tsx لازم يعمل export default لـ React component

export default function Home() {
  return (
    <div className="px-4 pt-6">
      {/* الهيدر */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          FitCoach AI
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your personal fitness companion
        </p>
      </header>

      {/* ملخص اليوم */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Today&apos;s Summary
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* كل كارد = بطاقة معلومات صغيرة */}
          <SummaryCard
            title="Workout"
            value="Full Body"
            subtitle="Week 2 of 4"
            color="blue"
          />
          <SummaryCard
            title="Weight"
            value="85.2 kg"
            subtitle="-0.3 from last week"
            color="green"
          />
          <SummaryCard
            title="Recovery"
            value="78%"
            subtitle="From Whoop"
            color="yellow"
          />
          <SummaryCard
            title="Sleep"
            value="7.2 hrs"
            subtitle="Quality: Good"
            color="purple"
          />
        </div>
      </section>

      {/* إجراءات سريعة */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <ActionButton
            title="Log Today's Workout"
            description="Full Body — All major muscle groups"
            emoji="🏋️"
          />
          <ActionButton
            title="Log Weight"
            description="Record your morning weight"
            emoji="⚖️"
          />
          <ActionButton
            title="Ask AI Coach"
            description="Get personalized advice"
            emoji="🤖"
          />
        </div>
      </section>
    </div>
  );
}

// ---
// الكومبوننتات المساعدة
// ---
// خليناها هنا مؤقتاً — لما يكبر المشروع ننقلها لملفات مستقلة

// SummaryCard = بطاقة ملخص صغيرة
function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  // ألوان مختلفة حسب نوع البطاقة
  const colorStyles = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-amber-50 border-amber-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <div
      className={`rounded-xl border p-3 ${colorStyles[color]}`}
    >
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

// ActionButton = زر إجراء سريع
function ActionButton({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <button className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </button>
  );
}
