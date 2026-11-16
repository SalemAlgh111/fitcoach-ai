-- =============================================
-- FitCoach AI — Database Schema
-- =============================================
-- هذا الملف يحتوي على كل جداول قاعدة البيانات
-- تنسخه وتلصقه في Supabase SQL Editor

-- =============================================
-- 1. جدول التمارين المتاحة (Exercise Library)
-- =============================================
-- قائمة كل التمارين اللي تقدر تختار منها
-- day_number = أي يوم في الأسبوع (1-5)
-- sort_order = ترتيب التمرين داخل اليوم
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- اسم التمرين
  muscle_group TEXT NOT NULL,            -- العضلة المستهدفة (chest, back, legs, etc.)
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 5),  -- يوم التمرين
  sort_order INTEGER NOT NULL DEFAULT 1, -- ترتيب التمرين في اليوم
  default_sets INTEGER NOT NULL DEFAULT 2, -- عدد الـ sets المبرمجة
  default_reps TEXT NOT NULL DEFAULT '8-10', -- نطاق التكرارات المبرمج
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. جدول الـ Mesocycles (دورات التدريب)
-- =============================================
-- كل mesocycle = 4 أسابيع تدريب
-- فيه RPE مختلف لكل أسبوع
CREATE TABLE mesocycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- مثال: "Mesocycle 1"
  start_date DATE NOT NULL,             -- تاريخ بداية الدورة
  end_date DATE NOT NULL,               -- تاريخ نهاية الدورة
  week1_rpe NUMERIC(3,1) DEFAULT 7.0,   -- RPE الأسبوع الأول
  week2_rpe NUMERIC(3,1) DEFAULT 8.0,   -- RPE الأسبوع الثاني
  week3_rpe NUMERIC(3,1) DEFAULT 9.0,   -- RPE الأسبوع الثالث
  week4_rpe NUMERIC(3,1) DEFAULT 6.0,   -- RPE الأسبوع الرابع (deload)
  is_active BOOLEAN DEFAULT true,       -- هل هذي الدورة الحالية؟
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. جدول تسجيل التمارين (Workout Logs)
-- =============================================
-- كل سطر = set واحد من تمرين واحد
-- مثال: Bench Press, Set 1, 80kg, 8 reps
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id),  -- أي تمرين
  mesocycle_id UUID REFERENCES mesocycles(id), -- أي دورة تدريب
  workout_date DATE NOT NULL,            -- تاريخ التمرين
  set_number INTEGER NOT NULL,           -- رقم الـ set (1, 2, 3)
  weight_kg NUMERIC(5,1) NOT NULL,       -- الوزن بالكيلو
  reps INTEGER NOT NULL,                 -- عدد التكرارات
  rpe NUMERIC(3,1),                      -- مستوى الجهد (اختياري)
  notes TEXT,                            -- ملاحظات (اختياري)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. جدول الوزن اليومي (Weight Logs)
-- =============================================
CREATE TABLE weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL UNIQUE,         -- تاريخ الوزن (يوم واحد = قيمة واحدة)
  weight_kg NUMERIC(5,1) NOT NULL,       -- الوزن بالكيلو
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 5. جدول العادات اليومية (Daily Habits)
-- =============================================
-- أسئلة نعم/لا يومية
CREATE TABLE daily_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL UNIQUE,         -- تاريخ اليوم
  creatine BOOLEAN DEFAULT false,        -- أخذت كرياتين؟
  protein_target BOOLEAN DEFAULT false,  -- وصلت هدف البروتين؟
  water_target BOOLEAN DEFAULT false,    -- شربت كفاية ماء؟
  steps_target BOOLEAN DEFAULT false,    -- مشيت 10k خطوة؟
  hungry_level INTEGER CHECK (hungry_level BETWEEN 1 AND 5), -- مستوى الجوع (1-5)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 6. بيانات التمارين — من جدول سالم الفعلي
-- =============================================
-- 5 أيام Full Body — كل يوم فيه 4-5 تمارين
-- الأوزان فاضية — تنسجل من التطبيق

-- ==================== Day 1 ====================
INSERT INTO exercises (name, muscle_group, day_number, sort_order, default_sets, default_reps) VALUES
  ('Hammer Strength Super Incline',    'chest',     1, 1, 2, '8-10'),
  ('Neutral Grip Lat Pulldown',        'back',      1, 2, 2, '8-10'),
  ('Seated Leg Curl',                  'legs',      1, 3, 2, '10-12'),
  ('Standing Lateral Machine',         'shoulders', 1, 4, 2, '10-12'),
  ('EZ Bar Tricep Pushdown',           'arms',      1, 5, 2, '10-12');

-- ==================== Day 2 ====================
INSERT INTO exercises (name, muscle_group, day_number, sort_order, default_sets, default_reps) VALUES
  ('Leg Press',                                'legs',  2, 1, 2, '8-10'),
  ('Seated Cable Wide Grip Row',       'back',      2, 2, 2, '8-10'),
  ('Lying Abdominal Crunch',           'core',      2, 3, 2, '10-12'),
  ('Incline Dumbbell Curls',           'arms',      2, 4, 2, '10-12');

-- ==================== Day 3 ====================
INSERT INTO exercises (name, muscle_group, day_number, sort_order, default_sets, default_reps) VALUES
  ('High Incline Dumbbell Bench Press','chest',     3, 1, 2, '8-10'),
  ('Upper Back Pulldown',              'back',      3, 2, 2, '8-10'),
  ('Machine Fly',                      'chest',     3, 3, 2, '10-12'),
  ('Cable Face Pulls',                 'shoulders', 3, 4, 2, '10-12'),
  ('Adductor Machine',                 'legs',      3, 5, 2, '10-12');

-- ==================== Day 4 ====================
INSERT INTO exercises (name, muscle_group, day_number, sort_order, default_sets, default_reps) VALUES
  ('45 Degree Hip Extension',          'legs',      4, 1, 2, '8-10'),
  ('Cable Y-Raise',                    'shoulders', 4, 2, 2, '10-12'),
  ('Preacher Curl Machine',            'arms',      4, 3, 2, '10-12'),
  ('Calf Raises On The Leg Press',     'legs',      4, 4, 2, '10-12');

-- ==================== Day 5 ====================
INSERT INTO exercises (name, muscle_group, day_number, sort_order, default_sets, default_reps) VALUES
  ('Hammer Strength Horizontal Flat Bench Press', 'chest', 5, 1, 2, '8-10'),
  ('Cable Shrugs',                     'shoulders', 5, 2, 2, '10-12'),
  ('Leg Extensions',                   'legs',      5, 3, 2, '10-12'),
  ('Rope Triceps Pushdown',            'arms',      5, 4, 2, '10-12');
