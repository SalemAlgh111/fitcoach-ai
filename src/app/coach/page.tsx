// coach/page.tsx — صفحة الـ AI Coach
//
// مربوطة بالبروكسي على Render:
//   - Insights: يسحب بيانات من Supabase ويرسلها للـ AI
//   - Chat: محادثة مباشرة مع الـ AI عبر Groq
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// =============================================
// رابط البروكسي
// =============================================
const PROXY_URL = "https://fitcoach-proxy.onrender.com";

// =============================================
// أنواع البيانات
// =============================================
type Insight = {
  type: string;
  title: string;
  message: string;
  icon: string;
};

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState("");

  // =============================================
  // سحب Insights من الـ AI
  // =============================================
  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoadingInsights(true);
    setInsightsError("");

    try {
      // 1. نسحب بيانات المستخدم من Supabase
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000)
        .toISOString()
        .split("T")[0];

      // آخر وزن
      const { data: weightData } = await supabase
        .from("weight_logs")
        .select("weight_kg, log_date")
        .order("log_date", { ascending: false })
        .limit(7);

      // عادات آخر 7 أيام
      const { data: habitsData } = await supabase
        .from("daily_habits")
        .select("*")
        .gte("log_date", weekAgo)
        .order("log_date", { ascending: false });

      // تمارين آخر 7 أيام
      const { data: workoutData } = await supabase
        .from("workout_logs")
        .select("*, exercises(name)")
        .gte("log_date", weekAgo)
        .order("log_date", { ascending: false });

      const userData = {
        recentWeights: weightData || [],
        recentHabits: habitsData || [],
        recentWorkouts: (workoutData || []).map((w) => ({
          date: w.log_date,
          exercise: (w.exercises as { name: string } | null)?.name || "Unknown",
          weight_kg: w.weight_kg,
          reps: w.reps,
          rpe: w.rpe,
        })),
        today,
      };

      // 2. نرسل للبروكسي
      const res = await fetch(`${PROXY_URL}/api/coach/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData }),
      });

      if (!res.ok) throw new Error("Failed to get insights");

      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error("Insights error:", err);
      setInsightsError("Could not load insights. The AI server might be warming up — try again in a minute.");
      // Fallback insights
      setInsights([
        {
          type: "tip",
          title: "Coach Tip",
          message: "Start logging your workouts and weight to get personalized AI insights!",
          icon: "💡",
        },
      ]);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-28">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">AI Coach</h1>
        <p className="text-slate-500 text-sm mt-1">
          Powered by Llama 3.3 via Groq
        </p>
      </header>

      {/* تابات: Insights / Chat */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "insights"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          Ask Coach
        </button>
      </div>

      {/* محتوى Insights */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          {loadingInsights ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">Loading AI insights...</p>
            </div>
          ) : (
            <>
              {insightsError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-sm text-amber-700">{insightsError}</p>
                </div>
              )}

              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {insight.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* زر إعادة التحميل */}
              <button
                onClick={loadInsights}
                className="w-full py-2 text-sm text-blue-600 font-medium"
              >
                ↻ Refresh Insights
              </button>
            </>
          )}

          {/* Whoop Data Preview — بعدين يتربط */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl p-4 text-white">
            <p className="text-xs font-medium text-slate-300 mb-2">
              WHOOP DATA
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-slate-400">Recovery</p>
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-slate-400">Strain</p>
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-slate-400">HRV</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Connect Whoop to see live data</p>
          </div>
        </div>
      )}

      {/* محتوى Chat */}
      {activeTab === "chat" && <ChatView />}
    </div>
  );
}

// =============================================
// واجهة الشات مع الـ AI Coach
// =============================================
function ChatView() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hey! I'm your AI fitness coach. Ask me anything about your training, nutrition, or recovery.",
    },
  ]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    setMessage("");

    // نضيف رسالة المستخدم
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(newMessages);
    setSending(true);

    try {
      // نرسل كل المحادثة للبروكسي
      const res = await fetch(`${PROXY_URL}/api/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't respond right now. The server might be warming up — try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col pb-4">
      {/* الرسائل */}
      <div className="space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* إدخال الرسالة */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your coach..."
          className="flex-1 h-11 px-4 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="h-11 w-11 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
