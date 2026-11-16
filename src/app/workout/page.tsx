// workout/page.tsx — صفحة تسجيل التمارين
//
// الحين مربوطة بـ Supabase:
//   - تسحب التمارين من جدول exercises حسب اليوم
//   - تحفظ الـ sets في جدول workout_logs
//   - تعرض أعلى وزن من الأسبوع اللي فات (Last best)
//
// "use client" لأن الصفحة تتفاعل مع المستخدم (forms, state)
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Exercise } from "@/lib/types";

// =============================================
// Types
// =============================================
type SetData = {
  weight: string;
  reps: string;
};

type ExerciseEntry = {
  exerciseId: string;
  sets: SetData[];
};

// أسماء الأيام
const DAY_NAMES = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];

export default function WorkoutPage() {
  // =============================================
  // State
  // =============================================
  const [selectedDay, setSelectedDay] = useState(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [lastBest, setLastBest] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayLabel, setTodayLabel] = useState("");

  // =============================================
  // تاريخ اليوم
  // =============================================
  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  // =============================================
  // سحب التمارين من Supabase حسب اليوم
  // =============================================
  const loadExercises = useCallback(async (day: number) => {
    setLoading(true);

    // 1. سحب تمارين اليوم
    const { data: exerciseData, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("day_number", day)
      .order("sort_order");

    if (error) {
      console.error("Error loading exercises:", error);
      setLoading(false);
      return;
    }

    const dayExercises = exerciseData as Exercise[];
    setExercises(dayExercises);

    // 2. تجهيز الـ entries (فورم فاضي لكل تمرين)
    setEntries(
      dayExercises.map((ex) => ({
        exerciseId: ex.id,
        sets: Array.from({ length: ex.default_sets }, () => ({
          weight: "",
          reps: "",
        })),
      }))
    );

    // 3. سحب أعلى وزن من الأسبوع اللي فات لكل تمرين
    //    الأسبوع اللي فات = آخر 7-14 يوم (نستثني هالأسبوع)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 14);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const exerciseIds = dayExercises.map((ex) => ex.id);

    if (exerciseIds.length > 0) {
      const { data: bestData } = await supabase
        .from("workout_logs")
        .select("exercise_id, weight_kg")
        .in("exercise_id", exerciseIds)
        .gte("workout_date", weekAgo.toISOString().split("T")[0])
        .lt("workout_date", thisWeekStart.toISOString().split("T")[0])
        .order("weight_kg", { ascending: false });

      // نأخذ أعلى وزن لكل تمرين
      const bestMap: Record<string, number> = {};
      if (bestData) {
        for (const row of bestData) {
          if (!bestMap[row.exercise_id] || row.weight_kg > bestMap[row.exercise_id]) {
            bestMap[row.exercise_id] = row.weight_kg;
          }
        }
      }
      setLastBest(bestMap);
    }

    setLoading(false);
    setSaved(false);
  }, []);

  // لما يتغير اليوم، نحمل التمارين
  useEffect(() => {
    loadExercises(selectedDay);
  }, [selectedDay, loadExercises]);

  // =============================================
  // إضافة set إضافي
  // =============================================
  const addSet = (entryIndex: number) => {
    const updated = [...entries];
    updated[entryIndex].sets.push({ weight: "", reps: "" });
    setEntries(updated);
  };

  // =============================================
  // تحديث بيانات set
  // =============================================
  const updateSet = (
    entryIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    const updated = [...entries];
    updated[entryIndex].sets[setIndex][field] = value;
    setEntries(updated);
  };

  // =============================================
  // حفظ التمرين في Supabase
  // =============================================
  const handleSave = async () => {
    setSaving(true);

    const today = new Date().toISOString().split("T")[0]; // "2024-01-15"

    // نجهز كل الـ sets اللي فيها بيانات
    const rows = entries.flatMap((entry) =>
      entry.sets
        .map((set, setIndex) => ({
          exercise_id: entry.exerciseId,
          workout_date: today,
          set_number: setIndex + 1,
          weight_kg: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || 0,
        }))
        // نحفظ بس الـ sets اللي فيها وزن أو تكرارات
        .filter((row) => row.weight_kg > 0 || row.reps > 0)
    );

    if (rows.length === 0) {
      setSaving(false);
      return;
    }

    // نمسح بيانات اليوم القديمة (لو المستخدم يحفظ مرتين)
    const exerciseIds = entries.map((e) => e.exerciseId);
    await supabase
      .from("workout_logs")
      .delete()
      .eq("workout_date", today)
      .in("exercise_id", exerciseIds);

    // نضيف البيانات الجديدة
    const { error } = await supabase.from("workout_logs").insert(rows);

    if (error) {
      console.error("Error saving workout:", error);
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
  return (
    <div className="px-4 pt-6 pb-28">
      {/* الهيدر */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Log Workout</h1>
        <p className="text-slate-500 text-sm mt-1">
          Full Body — {todayLabel}
        </p>
      </header>

      {/* اختيار اليوم — tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {DAY_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i + 1)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === i + 1
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">Loading exercises...</p>
        </div>
      )}

      {/* قائمة تمارين اليوم */}
      {!loading && (
        <div className="space-y-4">
          {entries.map((entry, entryIndex) => {
            const exercise = exercises.find(
              (e) => e.id === entry.exerciseId
            );
            if (!exercise) return null;

            const bestWeight = lastBest[exercise.id];

            return (
              <div
                key={entry.exerciseId}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* عنوان التمرين + أعلى وزن الأسبوع اللي فات */}
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {exercise.muscle_group} · {exercise.default_reps} reps
                      </p>
                    </div>
                    {/* أعلى وزن من الأسبوع اللي فات */}
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Last best</p>
                      <p className="text-sm font-bold text-blue-600">
                        {bestWeight ? `${bestWeight} kg` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* جدول الـ Sets */}
                <div className="p-3">
                  {/* Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr] gap-2 mb-2">
                    <span className="text-xs text-slate-400 font-medium">
                      Set
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Weight (kg)
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Reps
                    </span>
                  </div>

                  {/* Sets */}
                  {entry.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="grid grid-cols-[40px_1fr_1fr] gap-2 mb-2"
                    >
                      <span className="flex items-center justify-center text-sm font-semibold text-slate-500 bg-slate-100 rounded-lg h-10">
                        {setIndex + 1}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(
                            entryIndex,
                            setIndex,
                            "weight",
                            e.target.value
                          )
                        }
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(
                            entryIndex,
                            setIndex,
                            "reps",
                            e.target.value
                          )
                        }
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  {/* زر إضافة set */}
                  <button
                    onClick={() => addSet(entryIndex)}
                    className="w-full py-1.5 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    + Add Set
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* زر الحفظ */}
      {!loading && entries.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition-colors ${
            saved
              ? "bg-green-500"
              : saving
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Workout"}
        </button>
      )}
    </div>
  );
}
