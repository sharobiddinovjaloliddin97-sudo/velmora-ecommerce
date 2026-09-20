import { useState } from "react";

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
    const {
      name,
      value,
    } = event.target;

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
      await api.post(
        "/contact/",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }
      );

      setSuccess(
        language === "ru"
          ? "Сообщение успешно отправлено. Мы свяжемся с вами."
          : "Xabaringiz muvaffaqiyatli yuborildi. Siz bilan bog‘lanamiz."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

    } catch (err) {
      console.error(
        "Contact form error:",
        err.response?.data || err
      );

      const backendData =
        err.response?.data;

      if (
        backendData?.contact
      ) {
        const contactError =
          Array.isArray(
            backendData.contact
          )
            ? backendData.contact[0]
            : backendData.contact;

        setError(
          contactError
        );

      } else {
        setError(
          language === "ru"
            ? "Не удалось отправить сообщение. Попробуйте ещё раз."
            : "Xabarni yuborib bo‘lmadi. Qayta urinib ko‘ring."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="max-w-2xl">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
            Velmora
          </p>

          <h1 className="mt-3 text-5xl font-semibold text-[#173f35]">
            {language === "ru"
              ? "Контакты"
              : "Aloqa"}
          </h1>

          <p className="mt-5 leading-8 text-stone-600">
            {language === "ru"
              ? "Если у вас есть вопрос по товару или заказу, заполните форму ниже."
              : "Mahsulot yoki buyurtma bo‘yicha savolingiz bo‘lsa, quyidagi formani to‘ldiring."}
          </p>

        </div>


        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-[30px] bg-white p-7 shadow-sm"
          >

            <div className="space-y-5">

              {/* NAME */}
              <div>

                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  {language === "ru"
                    ? "Имя"
                    : "Ism"}
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
                />

              </div>


              {/* EMAIL */}
              <div>

                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Email
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
                />

              </div>


              {/* PHONE */}
              <div>

                <label
                  htmlFor="contact-phone"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  {language === "ru"
                    ? "Телефон"
                    : "Telefon"}
                </label>

                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
                />

                <p className="mt-2 text-xs text-stone-500">
                  {language === "ru"
                    ? "Укажите хотя бы email или номер телефона."
                    : "Email yoki telefon raqamidan kamida bittasini kiriting."}
                </p>

              </div>


              {/* MESSAGE */}
              <div>

                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  {language === "ru"
                    ? "Сообщение"
                    : "Xabar"}
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
                />

              </div>

            </div>


            {/* SUCCESS */}
            {success && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}


            {/* ERROR */}
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}


            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 rounded-full bg-[#173f35] px-7 py-3.5 font-medium text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? language === "ru"
                  ? "Отправка..."
                  : "Yuborilmoqda..."
                : language === "ru"
                  ? "Отправить"
                  : "Yuborish"}
            </button>

          </form>


          {/* INFO */}
          <aside className="h-fit rounded-[30px] bg-[#173f35] p-7 text-white">

            <h2 className="text-2xl font-semibold">
              {language === "ru"
                ? "Информация"
                : "Ma’lumot"}
            </h2>


            <div className="mt-7 space-y-6">

              <div>

                <p className="text-sm text-[#b8c9c0]">
                  {language === "ru"
                    ? "Доставка"
                    : "Yetkazib berish"}
                </p>

                <p className="mt-1">
                  {language === "ru"
                    ? "Только по городу Ташкент"
                    : "Faqat Toshkent shahri bo‘ylab"}
                </p>

              </div>


              <div>

                <p className="text-sm text-[#b8c9c0]">
                  {language === "ru"
                    ? "Стоимость доставки"
                    : "Yetkazib berish narxi"}
                </p>

                <p className="mt-1">
                  {language === "ru"
                    ? "Бесплатно"
                    : "Bepul"}
                </p>

              </div>


              <div>

                <p className="text-sm text-[#b8c9c0]">
                  {language === "ru"
                    ? "Оплата"
                    : "To‘lov"}
                </p>

                <p className="mt-1">
                  {language === "ru"
                    ? "Наличными при получении"
                    : "Qabul qilganda naqd"}
                </p>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}


export default ContactPage;