// supabase.ts — الاتصال بقاعدة البيانات
//
// Supabase client = الأداة اللي نستخدمها عشان نقرأ ونكتب بيانات
// نحتاج شيئين:
//   1. SUPABASE_URL = عنوان قاعدة البيانات
//   2. SUPABASE_ANON_KEY = مفتاح عام للوصول
//
// هذولا نحطهم في ملف .env.local (سري، ما ينرفع على GitHub)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ! = نقول لـ TypeScript "ثق فيني، هالقيمة موجودة"
// NEXT_PUBLIC_ = يعني هالمتغير متاح في المتصفح (client side)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
