-- =============================================
-- FitCoach AI — Row Level Security (RLS)
-- =============================================
-- هذا التطبيق شخصي (مستخدم واحد) — نسمح بالوصول الكامل
-- بعدين لما نضيف Auth، نقيد الوصول حسب المستخدم
--
-- الصق هذا الكود في Supabase SQL Editor بعد إنشاء الجداول

-- تفعيل RLS على كل الجداول
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;

-- سياسة: السماح بالقراءة والكتابة للجميع (مؤقت — مستخدم واحد)
-- exercises — قراءة فقط (التمارين ثابتة)
CREATE POLICY "Allow read exercises" ON exercises FOR SELECT USING (true);

-- mesocycles — قراءة وكتابة
CREATE POLICY "Allow all mesocycles" ON mesocycles FOR ALL USING (true) WITH CHECK (true);

-- workout_logs — قراءة وكتابة
CREATE POLICY "Allow all workout_logs" ON workout_logs FOR ALL USING (true) WITH CHECK (true);

-- weight_logs — قراءة وكتابة
CREATE POLICY "Allow all weight_logs" ON weight_logs FOR ALL USING (true) WITH CHECK (true);

-- daily_habits — قراءة وكتابة
CREATE POLICY "Allow all daily_habits" ON daily_habits FOR ALL USING (true) WITH CHECK (true);
