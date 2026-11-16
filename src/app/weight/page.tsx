// weight/page.tsx — صفحة تسجيل الوزن والعادات اليومية
//
// مربوطة بـ Supabase:
//   - تحفظ الوزن في weight_logs
//   - تحفظ العادات في daily_habits
//   - لو فيه بيانات اليوم، تحملها تلقائي
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function WeightPage() {
  const [todayLabel, setTodayLabel] = useState("");
  const [todayDate, setTodayDate] = useState("");
  const [weight, setWeight] = useState("");
  const [habits, setHabits] = useState({
    creatine: false,
    protein_target: false,
    water_target: false,
    steps_target: false,
    hungry_level: 3,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // =============================================
  // تاريخ اليوم + تحميل البيانات الموجودة
  // =============================================
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // "2024-01-15"
    setTodayDate(dateStr);
    setTodayLabel(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    );

    // نحمل بيانات اليوم لو موجودة
    loadTodayData(dateStr);
  }, []);

  const loadTodayData = async (date: string) => {
    setLoading(true);

    // سحب الوزن
    const { data: weightData } = await supabase
      .from("weight_logs")
      .select("weight_kg")
      .eq("log_date", date)
      .single();

    if (weightData) {
      setWeight(String(weightData.weight_kg));
    }

    // سحب العادات
    const { data: habitData } = await supabase
      .from("daily_habits")
      .select("*")
      .eq("log_date", date)
      .single();

    if (habitData) {
      setHabits({
        creatine: habitData.creatine ?? false,
        protein_target: habitData.protein_target ?? false,
        water_target: habitData.water_target ?? false,
        steps_target: habitData.steps_target ?? false,
        hungry_level: habitData.hungry_level ?? 3,
      });
    }

    setLoading(false);
  };

  // =============================================
  // Toggle عادة
  // =============================================
  const toggleHabit = (key: keyof typeof habits) => {
    if (key === "hungry_level") return;
    setHabits({ ...habits, [key]: !habits[key] });
  };

  // =============================================
  // حفظ في Supabase
  // =============================================
  const handleSave = async () => {
    if (!weight) return;
    setSaving(true);

    // 1. حفظ الوزن — upsert (لو موجود يحدثه، لو لا ينشئه)
    const { error: weightError } = await supabase
      .from("weight_logs")
      .upsert(
        { log_date: todayDate, weight_kg: parseFloat(weight) },
        { onConflict: "log_date" }
      );

    if (weightError) {
      console.error("Error saving weight:", weightError);
      setSaving(false);
      return;
    }

    // 2. حفظ العادات
    const { error: habitError } = await supabase
      .from("daily_habits")
      .upsert(
        {
          log_date: todayDate,
          creatine: habits.creatine,
          protein_target: habits.protein_target,
          water_target: habits.water_target,
          steps_target: habits.steps_target,
          hungry_level: habits.hungry_level,
        },
        { onConflict: "log_date" }
      );

    if (habitError) {
      console.error("Error saving habits:", habitError);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // =============================================
  // UI
  // =============================================
  if (loading) {
    return (
      <div className="px-4 pt-6 text-center text-slate-400 py-16">
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-28">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Log Weight</h1>
        <p className="text-slate-500 text-sm mt-1">{todayLabel}</p>
      </header>

      {/* إدخال الوزن */}
      <section className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Morning Weight
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="85.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 h-14 px-4 bg-white border border-slate-200 rounded-xl text-2xl font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-lg font-medium text-slate-400">kg</span>
        </div>
      </section>

      {/* العادات اليومية */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Daily Habits
        </h2>
        <div className="space-y-3">
          <HabitToggle
            label="Creatine"
            emoji="💊"
            checked={habits.creatine}
            onToggle={() => toggleHabit("creatine")}
          />
          <HabitToggle
            label="Hit Protein Target"
            emoji="🥩"
            checked={habits.protein_target}
            onToggle={() => toggleHabit("protein_target")}
          />
          <HabitToggle
            label="Water Target"
            emoji="💧"
            checked={habits.water_target}
            onToggle={() => toggleHabit("water_target")}
          />
          <HabitToggle
            label="10K Steps"
            emoji="🚶"
            checked={habits.steps_target}
            onToggle={() => toggleHabit("steps_target")}
          />
        </div>
      </section>

      {/* مستوى الجوع */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Hunger Level
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Not hungry</span>
            <span>Very hungry</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={habits.hungry_level}
            onChange={(e) =>
              setHabits({ ...habits, hungry_level: parseInt(e.target.value) })
            }
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-300 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={
                  n === habits.hungry_level
                    ? "text-amber-500 font-bold"
                    : ""
                }
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* زر الحفظ */}
      <button
        onClick={handleSave}
        disabled={!weight || saving}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
          saved
            ? "bg-green-500"
            : saving
              ? "bg-green-400 cursor-wait"
              : weight
                ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                : "bg-slate-300 cursor-not-allowed"
        }`}
      >
        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Today's Log"}
      </button>
    </div>
  );
}

// =============================================
// زر عادة (toggle)
// =============================================
function HabitToggle({
  label,
  emoji,
  checked,
  onToggle,
}: {
  label: string;
  emoji: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
        checked
          ? "bg-green-50 border-green-200"
          : "bg-white border-slate-200"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="flex-1 font-medium text-slate-700">{label}</span>
      <div
        className={`w-10 h-6 rounded-full transition-colors relative ${
          checked ? "bg-green-500" : "bg-slate-200"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
