// types.ts — أنواع البيانات (TypeScript Types)
//
// TypeScript يحتاج يعرف "شكل" كل بيان
// هذا يساعدك: لو كتبت اسم خطأ، يعطيك error قبل ما تشغل الكود

// تمرين من مكتبة التمارين
export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  day_number: number;        // أي يوم (1-5)
  sort_order: number;        // ترتيب التمرين في اليوم
  default_sets: number;      // عدد الـ sets المبرمجة (2)
  default_reps: string;      // نطاق التكرارات ("8-10" أو "10-12")
  created_at: string;
};

// دورة تدريب (4 أسابيع)
export type Mesocycle = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  week1_rpe: number;
  week2_rpe: number;
  week3_rpe: number;
  week4_rpe: number;
  is_active: boolean;
  created_at: string;
};

// تسجيل set واحد من تمرين
export type WorkoutLog = {
  id: string;
  exercise_id: string;
  mesocycle_id: string;
  workout_date: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
  created_at: string;
};

// تسجيل الوزن اليومي
export type WeightLog = {
  id: string;
  log_date: string;
  weight_kg: number;
  created_at: string;
};

// العادات اليومية
export type DailyHabit = {
  id: string;
  log_date: string;
  creatine: boolean;
  protein_target: boolean;
  water_target: boolean;
  steps_target: boolean;
  hungry_level: number | null;
  created_at: string;
};
