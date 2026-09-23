import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Info,
  MessageSquare,
} from "lucide-react";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const STARTER_PROMPTS = [
  {
    uz: "❄️ Yozda salqin, terlatmaydigan qaysi to‘plamlar bor?",
    ru: "❄️ Какое постельное белье лучше на лето, чтобы не потеть?",
  },
  {
    uz: "👰 Kelin sarposi uchun eng hashamatli to‘plamlar",
    ru: "👰 Самые роскошные комплекты для приданого невесты",
  },
  {
    uz: "🌿 Ranfors va Satin matolarining asosiy farqi nima?",
    ru: "🌿 В чем разница между тканями ранфорс и сатин?",
  },
  {
    uz: "🚚 Toshkentda bepul yetkazib berish va to‘lov qanday?",
    ru: "🚚 Как работает бесплатная доставка по Ташкенту и оплата?",
  },
  {
    uz: "👶 Bolalar xonasi uchun qaysi to‘plam eng xavfsiz?",
    ru: "👶 Какой комплект самый безопасный и мягкий для детей?",
  },
];

const createWelcomeMessage = (lang) => ({
  id: "welcome-init",
  role: "assistant",
  content:
    lang === "ru"
      ? "Здравствуйте! Я персональный AI-консультант Velmora. С удовольствием помогу вам подобрать идеальный комплект постельного белья, одеяло, подушку или матрас под ваш интерьер, сон и бюджет. О чем вы хотите узнать?"
      : "Assalomu alaykum! Men Velmora uy tekstilining shaxsiy sun'iy intellekt maslahatchisiman. Sizga qulay uyqu, sifatli matolar, o‘lchamlar yoki sovg‘a to‘plamlari bo‘yicha yordam berishdan mamnunman. Qanday savolingiz bor?",
  recommendations: [],
  suggested_questions:
    lang === "ru"
      ? [
          "Какие комплекты сейчас в тренде?",
          "Как стирать постельное белье из сатина?",
        ]
      : [
          "Hozir eng ommabop to‘plamlar qaysilar?",
          "Satin to‘shaklarni qanday haroratda yuvish kerak?",
        ],
});

export default function AIChatView({ onClose }) {
  const { language } = useLanguage();
  const idCounter = useRef(1);
  const [messages, setMessages] = useState(() => [createWelcomeMessage(language)]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom smoothly when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleClearChat = () => {
    idCounter.current += 1;
    setMessages([
      {
        id: `welcome-${idCounter.current}`,
        role: "assistant",
        content:
          language === "ru"
            ? "Чат обновлен. Чем еще я могу вам помочь?"
            : "Suhbat yangilandi. Sizga yana qanday to‘plam yoki mato haqida ma'lumot kerak?",
        recommendations: [],
        suggested_questions: [],
      },
    ]);
    setError("");
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setError("");
    setInputValue("");

    idCounter.current += 1;
    const userMessageId = `user-${idCounter.current}`;
    const newHistory = [
      ...messages,
      {
        id: userMessageId,
        role: "user",
        content: text,
      },
    ];

    setMessages(newHistory);
    setLoading(true);

    try {
      // Build lightweight conversation history for the AI
      const backendHistory = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post(
        "/ai-chat/",
        {
          message: text,
          history: backendHistory,
          lang: language,
        },
        { timeout: 35000 }
      );

      const data = res.data;
      const replyContent =
        language === "ru"
          ? data.reply_ru || data.reply_uz
          : data.reply_uz || data.reply_ru;
      const suggestions =
        language === "ru"
          ? data.suggested_questions_ru || data.suggested_questions_uz || []
          : data.suggested_questions_uz || data.suggested_questions_ru || [];

      idCounter.current += 1;
      const assistantMessage = {
        id: `assistant-${idCounter.current}`,
        role: "assistant",
        content: replyContent,
        recommendations: data.recommendations || [],
        suggested_questions: suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI chat error:", err);
      const serverMsg =
        err?.response?.data?.error ||
        (language === "ru"
          ? "Не удалось получить ответ. Пожалуйста, попробуйте еще раз."
          : "Javob olishda xatolik yuz berdi. Iltimos, qaytadan yuborib ko‘ring.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[520px] sm:h-[580px] max-h-[75vh] w-full">
      {/* CHAT STATUS BAR */}
      <div className="shrink-0 flex items-center justify-between pb-3 mb-3 border-b border-[#ebdcca] dark:border-[#2f2720]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8a735e] to-[#c1a27c] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#faf7f2] dark:border-[#181411]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3b2d24] dark:text-[#f3ede4]">
              {language === "ru" ? "AI Консультант Velmora" : "Velmora AI Maslahatchisi"}
            </h4>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {language === "ru" ? "Онлайн • Эксперт по текстилю" : "Onlayn • Tekstil va uyqu eksperti"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#8a735e] dark:text-[#c1a27c] hover:underline px-2 py-1 rounded-lg hover:bg-[#8a735e]/10 transition"
          title={language === "ru" ? "Очистить диалог" : "Suhbatni yangilash"}
        >
          <RotateCcw className="h-3 w-3" />
          <span>{language === "ru" ? "Очистить" : "Tozalash"}</span>
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="mb-3 shrink-0 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}
            >
              {/* BUBBLE */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                  isUser
                    ? "bg-gradient-to-r from-[#3b2d24] via-[#5c4a3d] to-[#3b2d24] text-white rounded-br-xs"
                    : "bg-white dark:bg-[#201b17] text-[#3b2d24] dark:text-[#ede4da] border border-[#ebdcca] dark:border-[#382f27] rounded-bl-xs"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8a735e] dark:text-[#c1a27c]">
                    <Sparkles className="h-3 w-3" />
                    <span>Velmora AI</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>

              {/* IN-CHAT RECOMMENDED PRODUCTS (IF ANY) */}
              {!isUser && Array.isArray(msg.recommendations) && msg.recommendations.length > 0 && (
                <div className="w-full max-w-[92%] sm:max-w-[85%] space-y-2 pt-1 pl-1">
                  <span className="text-[11px] font-bold text-[#8a735e] dark:text-[#e5b378] flex items-center gap-1">
                    🛍 {language === "ru" ? "Подобранные товары:" : "Mavzuga mos to‘plamlar:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.recommendations.map((prod, pIdx) => {
                      const name = language === "ru" ? prod.name_ru || prod.name_uz : prod.name_uz;
                      const why = language === "ru" ? prod.why_matched_ru || prod.why_matched_uz : prod.why_matched_uz;
                      const priceFmt = prod.price ? `${Number(prod.price).toLocaleString("uz-UZ")} so‘m` : "";

                      return (
                        <div
                          key={prod.product_id || pIdx}
                          className="flex items-center gap-3 rounded-2xl border border-[#ebdcca] dark:border-[#382f27] bg-[#faf7f2] dark:bg-[#1a1613] p-2.5 hover:border-[#c1a27c] transition-all shadow-2xs group"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white dark:bg-[#25201c] border border-[#dfd2c0] dark:border-[#342b23]">
                            {prod.image ? (
                              <img src={prod.image} alt={name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] text-stone-400">
                                Velmora
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h5 className="font-bold text-xs text-[#3b2d24] dark:text-[#ede4da] truncate">
                              {name}
                            </h5>
                            {why && (
                              <p className="text-[10px] text-[#786352] dark:text-[#a69688] line-clamp-1">
                                {why}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-0.5">
                              <span className="font-bold text-xs text-[#3b2d24] dark:text-[#ede4da]">
                                {priceFmt}
                              </span>
                              <Link
                                to={`/catalog/${prod.slug}`}
                                onClick={onClose}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8a735e] dark:text-[#e5b378] hover:underline"
                              >
                                <span>{language === "ru" ? "Открыть" : "Ko‘rish"}</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DYNAMIC FOLLOW-UP SUGGESTIONS */}
              {!isUser && Array.isArray(msg.suggested_questions) && msg.suggested_questions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pl-1 max-w-[92%] sm:max-w-[85%]">
                  {msg.suggested_questions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSendMessage(q)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#dfd2c0] dark:border-[#382f27] bg-[#faf7f2] dark:bg-[#1f1915] text-[#5c4a3d] dark:text-[#c4b6a8] hover:border-[#8a735e] dark:hover:border-[#c1a27c] hover:bg-white dark:hover:bg-[#25201c] transition text-left"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="rounded-3xl rounded-bl-xs p-3.5 bg-white dark:bg-[#201b17] border border-[#ebdcca] dark:border-[#382f27] text-xs flex items-center gap-2 text-[#8a735e] dark:text-[#c1a27c]">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>{language === "ru" ? "AI пишет ответ..." : "AI javob tayyorlamoqda..."}</span>
              <span className="flex gap-1 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c1a27c] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#c1a27c] animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#c1a27c] animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        {/* STARTER PROMPTS IN EMPTY / EARLY STATE */}
        {messages.length <= 1 && !loading && (
          <div className="pt-2 pb-1 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#786352] dark:text-[#a69688]">
              {language === "ru" ? "Популярные вопросы:" : "Ommabop savollardan birini tanlang:"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {STARTER_PROMPTS.map((p, idx) => {
                const label = language === "ru" ? p.ru : p.uz;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(label)}
                    className="p-2.5 rounded-2xl border border-[#dfd2c0] dark:border-[#342b23] bg-white/70 dark:bg-[#1a1613] hover:border-[#8a735e] dark:hover:border-[#c1a27c] text-left text-xs font-medium text-[#3b2d24] dark:text-[#ede4da] transition hover:bg-white dark:hover:bg-[#221c17] shadow-2xs"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="shrink-0 pt-3 border-t border-[#ebdcca] dark:border-[#2f2720]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={
                language === "ru"
                  ? "Напишите ваш вопрос (например: какой комплект выбрать на подарок?)..."
                  : "Savolingizni yozing (masalan: to‘yga qaysi to‘plam mos keladi?)..."
              }
              className="w-full rounded-2xl border border-[#d8c8b4] dark:border-[#382f27] bg-white dark:bg-[#1a1613] pl-4 pr-10 py-3 text-xs sm:text-sm text-[#3b2d24] dark:text-[#ede4da] placeholder:text-[#998777] focus:border-[#8a735e] dark:focus:border-[#c1a27c] focus:outline-none shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-md transition-all ${
              inputValue.trim() && !loading
                ? "bg-gradient-to-r from-[#8a735e] to-[#c1a27c] text-white hover:brightness-110 cursor-pointer"
                : "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed"
            }`}
            aria-label="Yuborish"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
