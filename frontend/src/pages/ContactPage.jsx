import { useState } from "react";
import {
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  HelpCircle,
  Truck,
} from "lucide-react";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

function ContactPage() {
  const { language } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");
    setSubmitting(true);

    try {
      await api.post("/contact/", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });

      setSuccess(
        language === "ru"
          ? "Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время."
          : "Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog‘lanamiz."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err.response?.data || err);
      const backendData = err.response?.data;

      if (backendData?.contact) {
        const contactError = Array.isArray(backendData.contact)
          ? backendData.contact[0]
          : backendData.contact;
        setError(contactError);
      } else {
        setError(
          language === "ru"
            ? "Не удалось отправить сообщение. Проверьте данные и попробуйте ещё раз."
            : "Xabarni yuborib bo‘lmadi. Qayta urinib ko‘ring."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const contactChannels = [
    {
      icon: Phone,
      title: language === "ru" ? "Основной телефон" : "Asosiy aloqa telefoni",
      value: "+998 91 165 22 11",
      desc: language === "ru" ? "Ежедневно с 09:00 до 21:00" : "Har kuni 09:00 dan 21:00 gacha",
      link: "tel:+998911652211",
      secondary: {
        title: language === "ru" ? "Дополнительный:" : "Qo‘shimcha:",
        value: "+998 93 079 17 34",
        link: "tel:+998930791734",
      },
    },
    {
      icon: Send,
      title: "Telegram",
      value: "@velmoramahsulotlari",
      desc: language === "ru" ? "Быстрый ответ и консультация" : "Tezkor javob va konsultatsiya",
      link: "https://t.me/velmoramahsulotlari",
    },
    {
      icon: Truck,
      title: language === "ru" ? "Формат работы" : "Xizmat ko‘rsatish",
      value: language === "ru" ? "Только доставка (без магазина)" : "Faqat yetkazib berish (do‘konsiz)",
      desc: language === "ru" ? "Бесплатная доставка по Ташкенту" : "Toshkent bo‘ylab bepul kuryer",
      link: null,
    },
    {
      icon: Clock,
      title: language === "ru" ? "Режим приёма заказов" : "Buyurtma qabul qilish",
      value: "09:00 — 21:00",
      desc: language === "ru" ? "Без выходных" : "Dam olish kunlarisiz",
      link: null,
    },
  ];

  const faqs = [
    {
      q: language === "ru" ? "Есть ли у вас физический магазин?" : "Sizda do‘kon yoki lokatsiya bormi?",
      a:
        language === "ru"
          ? "Нет, мы работаем исключительно в формате онлайн-заказа с быстрой бесплатной курьерской доставкой прямо к вашим дверям по всему Ташкенту."
          : "Yo‘q, biz ortiqcha do‘kon xarajatlarisiz, to‘g‘ridan-to‘g‘ri ishlab chiqaruvchidan eshikkacha bepul yetkazib berish tizimida ishlaymiz.",
    },
    {
      q: language === "ru" ? "Сколько стоит доставка по Ташкенту?" : "Toshkent bo‘ylab yetkazib berish narxi qancha?",
      a:
        language === "ru"
          ? "Доставка абсолютно бесплатная (0 сум) во все 12 районов города Ташкент."
          : "Yetkazib berish mutlaqo bepul (0 so‘m) — Toshkent shahrining barcha 12 ta tumaniga amal qiladi.",
    },
    {
      q: language === "ru" ? "Как и когда производится оплата?" : "To‘lov qanday va qachon amalga oshiriladi?",
      a:
        language === "ru"
          ? "Оплата производится наличными курьеру только после того, как вы получите заказ и лично проверите качество товара."
          : "To‘lov to‘plamni qabul qilib olganingizdan so‘ng, mato va o‘lchamini o‘z ko‘zingiz bilan ko‘rib, naqd pulda amalga oshiriladi.",
    },
  ];

  return (
    <div className="bg-[#faf7f2] min-h-screen py-10 sm:py-16 text-[#2d241e] transition-colors duration-200 dark:bg-[#141210] dark:text-[#ede4d8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c1a27c]">
            {language === "ru" ? "СВЯЗЬ С НАМИ" : "BOG‘LANISH"}
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#3b2d24] dark:text-[#f5efe6] tracking-tight">
            {language === "ru" ? "Контакты и служба заботы" : "Aloqa va mijozlarga xizmat"}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#6b584a] dark:text-[#a09081] leading-relaxed">
            {language === "ru"
              ? "У вас есть вопросы по ткани, размерам или хотите оформить заказ? Свяжитесь с нами удобным способом."
              : "Mahsulotlar, o‘lchamlar yoki buyurtma berish bo‘yicha savollaringiz bormi? Mutaxassislarimiz sizga yordam berishdan mamnun bo‘lishadi."}
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactChannels.map((ch, idx) => {
            const Icon = ch.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#ebdcca] shadow-sm hover:shadow-md transition-shadow dark:border-[#383028] dark:bg-[#1c1917]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#faf7f2] text-[#8a735e] border border-[#dfd2c0]/60 flex items-center justify-center mb-4 dark:border-[#3d342c] dark:bg-[#25201c] dark:text-[#e5b378]">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#8a735e] dark:text-[#c1a27c] uppercase tracking-wider">
                  {ch.title}
                </p>
                {ch.link ? (
                  <a
                    href={ch.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 block font-bold text-[#3b2d24] dark:text-[#f5efe6] text-base sm:text-lg hover:text-[#8a735e] dark:hover:text-[#e5b378] transition-colors"
                  >
                    {ch.value}
                  </a>
                ) : (
                  <p className="mt-1.5 font-bold text-[#3b2d24] dark:text-[#f5efe6] text-base sm:text-lg">
                    {ch.value}
                  </p>
                )}

                {/* Secondary Phone if available */}
                {ch.secondary && (
                  <div className="mt-1 pt-1 border-t border-[#ebdcca]/60 dark:border-[#383028]/60">
                    <span className="text-[11px] text-[#8a735e] dark:text-[#c1a27c] font-medium mr-1">
                      {ch.secondary.title}
                    </span>
                    <a
                      href={ch.secondary.link}
                      className="text-xs sm:text-sm font-semibold text-[#5c4a3d] dark:text-[#d4c8bc] hover:text-[#8a735e]"
                    >
                      {ch.secondary.value}
                    </a>
                  </div>
                )}

                <p className="mt-1.5 text-xs sm:text-sm text-[#7a6758] dark:text-[#a09081]">{ch.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Main Section: Form + Aside */}
        <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-10 border border-[#ebdcca] shadow-sm dark:border-[#383028] dark:bg-[#1c1917]">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f5efe6]">
              {language === "ru" ? "Напишите нам сообщение" : "Xabar qoldiring"}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#6b584a] dark:text-[#a09081]">
              {language === "ru"
                ? "Заполните форму ниже, и мы перезвоним вам в течение кратчайшего времени"
                : "Quyidagi formani to‘ldiring, tez fursatda siz bilan bog‘lanamiz"}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-2 dark:text-[#d4c8bc]"
                >
                  {language === "ru" ? "Ваше имя" : "Ismingiz"}
                </label>
                <div className="relative">
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder={language === "ru" ? "Имя и фамилия" : "Ism va familiyangiz"}
                    className="w-full pl-12 pr-4 py-3.5 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#25201c] focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15 dark:border-[#3d342c] dark:bg-[#25201c] dark:text-[#f5efe6] dark:focus:border-[#c1a27c]"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#e5b378]" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-2 dark:text-[#d4c8bc]"
                  >
                    {language === "ru" ? "Телефон" : "Telefon raqamingiz"}
                  </label>
                  <div className="relative">
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="+998 91 165 22 11"
                      className="w-full pl-12 pr-4 py-3.5 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#25201c] focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15 dark:border-[#3d342c] dark:bg-[#25201c] dark:text-[#f5efe6] dark:focus:border-[#c1a27c]"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#e5b378]" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-2 dark:text-[#d4c8bc]"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="example@gmail.com"
                      className="w-full pl-12 pr-4 py-3.5 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#25201c] focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15 dark:border-[#3d342c] dark:bg-[#25201c] dark:text-[#f5efe6] dark:focus:border-[#c1a27c]"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#e5b378]" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-2 dark:text-[#d4c8bc]"
                >
                  {language === "ru" ? "Ваше сообщение" : "Xabar matni"}
                </label>
                <div className="relative">
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={
                      language === "ru"
                        ? "Напишите, какой комплект вас интересует или оставьте вопрос..."
                        : "Sizni qaysi mahsulot yoki o‘lcham qiziqtirayotganini yozing..."
                    }
                    className="w-full p-4 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 resize-none focus:bg-white dark:focus:bg-[#25201c] focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15 dark:border-[#3d342c] dark:bg-[#25201c] dark:text-[#f5efe6] dark:focus:border-[#c1a27c]"
                  />
                </div>
              </div>

              {/* Feedback Alerts */}
              {success && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm leading-relaxed animate-fadeIn dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm leading-relaxed animate-fadeIn dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 py-4 px-9 rounded-full bg-[#3b2d24] text-white font-semibold text-base transition-all duration-300 shadow-md hover:bg-[#271f19] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#e5b378] dark:text-[#1c1917] dark:hover:bg-[#d9a365]"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === "ru" ? "Отправка..." : "Yuborilmoqda..."}
                  </span>
                ) : (
                  <>
                    <span>{language === "ru" ? "Отправить сообщение" : "Xabarni yuborish"}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Delivery Reassurance & FAQ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Banner Card */}
            <div className="rounded-3xl bg-[#3b2d24] dark:bg-[#1c1917] dark:border dark:border-[#383028] text-white p-8 shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-white/10 dark:bg-white/5 flex items-center justify-center text-[#c1a27c] mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold">
                {language === "ru" ? "Бесплатная доставка" : "Yetkazib berish xizmati"}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-stone-200 dark:text-[#c4b6a8] leading-relaxed font-light">
                {language === "ru"
                  ? "Мы работаем без физического магазина, доставляя все заказы прямо к вашей двери. Вы лично проверяете ткань и комплект перед оплатой курьеру."
                  : "Biz do‘konsiz, to‘g‘ridan-to‘g‘ri ishlab chiqaruvchidan bepul yetkazib beramiz. To‘lov qilishdan oldin kuryerdan mahsulotni to‘liq tekshirib olasiz."}
              </p>

              <div className="mt-6 pt-5 border-t border-white/10 dark:border-[#383028] space-y-3 text-sm text-stone-200 dark:text-[#d4c8bc]">
                <div className="flex items-center justify-between">
                  <span className="text-stone-300 dark:text-[#a09081]">{language === "ru" ? "Стоимость:" : "Yetkazish:"}</span>
                  <span className="font-bold text-white">0 UZS (Bepul)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-300 dark:text-[#a09081]">{language === "ru" ? "Оплата:" : "To‘lov:"}</span>
                  <span className="font-bold text-[#c1a27c]">{language === "ru" ? "Наличными курьеру" : "Qabul qilganda naqd"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-300 dark:text-[#a09081]">{language === "ru" ? "Сроки:" : "Yetkazish muddati:"}</span>
                  <span className="font-bold text-white">24 soat ichida</span>
                </div>
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#ebdcca] shadow-sm dark:border-[#383028] dark:bg-[#1c1917]">
              <div className="flex items-center gap-2.5 mb-5">
                <HelpCircle className="w-6 h-6 text-[#8a735e] dark:text-[#e5b378]" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3b2d24] dark:text-[#f5efe6]">
                  {language === "ru" ? "Частые вопросы" : "Ko‘p so‘raladigan savollar"}
                </h3>
              </div>

              <div className="space-y-4 divide-y divide-stone-100 dark:divide-[#2e2722]">
                {faqs.map((faq, idx) => (
                  <div key={idx} className={idx > 0 ? "pt-4" : ""}>
                    <p className="text-sm sm:text-base font-bold text-[#3b2d24] dark:text-[#f5efe6]">{faq.q}</p>
                    <p className="mt-1.5 text-sm text-[#6b584a] dark:text-[#a09081] leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;