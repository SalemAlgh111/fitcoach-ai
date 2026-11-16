// coach/page.tsx — صفحة الـ AI Coach
//
// هنا بعدين يجي Groq API (Llama 3.3)
// الحين نسوي الواجهة الأساسية
"use client";

import { useState } from "react";

// رسائل مؤقتة — بعدين تجي من الـ AI
const MOCK_INSIGHTS = [
  {
    type: "daily" as const,
    title: "Today's Recommendation",
    message:
      "Recovery at 78% — good to train. Stick to your planned RPE of 8. Focus on progressive overload on compound movements.",
    icon: "💪",
  },
  {
    type: "weekly" as const,
    title: "Weekly Summary",
    message:
      "You hit all 5 sessions this week. Average weight trending down by 0.3kg. Protein target hit 6/7 days — great consistency!",
    icon: "📊",
  },
  {
    type: "tip" as const,
    title: "Coach Tip",
    message:
      "Your sleep score has been dropping. Try to get to bed 30 minutes earlier this week for better recovery.",
    icon: "💡",
  },
];

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");

  return (
    <div className="px-4 pt-6">
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
          {MOCK_INSIGHTS.map((insight) => (
            <div
              key={insight.title}
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

          {/* Whoop Data Preview */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl p-4 text-white">
            <p className="text-xs font-medium text-slate-300 mb-2">
              WHOOP DATA
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-slate-400">Recovery</p>
              </div>
              <div>
                <p className="text-2xl font-bold">14.2</p>
                <p className="text-xs text-slate-400">Strain</p>
              </div>
              <div>
                <p className="text-2xl font-bold">52</p>
                <p className="text-xs text-slate-400">HRV</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* محتوى Chat */}
      {activeTab === "chat" && <ChatView />}
    </div>
  );
}

// واجهة الشات مع الـ AI Coach
function ChatView() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hey! I'm your AI fitness coach. Ask me anything about your training, nutrition, or recovery. I have access to your workout logs and Whoop data.",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    // نضيف رسالة المستخدم
    setMessages([...messages, { role: "user", content: message }]);

    // TODO: إرسال لـ Groq API عبر Render proxy
    // الحين نرد رد مؤقت
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'll be able to give you real advice once we connect the Groq API! For now, this is a placeholder response.",
        },
      ]);
    }, 500);

    setMessage("");
  };

  return (
    <div className="flex flex-col">
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
          disabled={!message.trim()}
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
