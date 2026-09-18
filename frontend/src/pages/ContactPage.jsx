import { useState } from "react";

import { useLanguage } from "../context/LanguageContext";


function ContactPage() {
  const { language } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [success, setSuccess] = useState("");


  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };


  const handleSubmit = (event) => {
    event.preventDefault();

    /*
      Hozircha backendda contact endpoint yo‘q.
      Shuning uchun real serverga yubormaymiz.
    */

    setSuccess(
      language === "ru"
        ? "Форма подготовлена. Отправку подключим после добавления контактного API."
        : "Forma tayyor. Contact API qo‘shilgandan keyin yuborishni ulaymiz."
    );
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

              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">
                  {language === "ru"
                    ? "Имя"
                    : "Ism"}
                </label>

                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">
                  {language === "ru"
                    ? "Сообщение"
                    : "Xabar"}
                </label>

                <textarea
                  name="message"
                  required
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>

            </div>


            {success && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}


            <button
              type="submit"
              className="mt-6 rounded-full bg-[#173f35] px-7 py-3.5 font-medium text-white transition hover:bg-[#245448]"
            >
              {language === "ru"
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