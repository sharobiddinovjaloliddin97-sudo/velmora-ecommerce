import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../api/client";

import {
  useLanguage,
} from "../context/LanguageContext";


function OrderDetailPage() {
  const { id } =
    useParams();

  const {
    language,
  } = useLanguage();


  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    const loadOrder =
      async () => {

        try {
          setLoading(true);
          setError("");

          const response = await api.get(
            `/orders/${id}/`
          );

          setOrder(
            response.data
          );

        } catch (err) {
          console.error(
            "Order detail error:",
            err.response?.data || err
          );

          setError(
            language === "ru"
              ? "Не удалось загрузить заказ."
              : "Buyurtmani yuklashda xatolik yuz berdi."
          );

        } finally {
          setLoading(false);
        }
      };


    loadOrder();

  }, [
    id,
    language,
  ]);


  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">

        <p className="text-stone-500">
          {language === "ru"
            ? "Загрузка..."
            : "Yuklanmoqda..."}
        </p>

      </div>
    );
  }


  if (
    error ||
    !order
  ) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 text-center">

        <p className="text-red-600">
          {error}
        </p>

        <Link
          to="/account"
          className="mt-6 rounded-full bg-[#173f35] px-6 py-3 text-white"
        >
          {language === "ru"
            ? "Вернуться в кабинет"
            : "Kabinetga qaytish"}
        </Link>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      <div className="mx-auto max-w-4xl px-6 py-12">

        <Link
          to="/account"
          className="text-sm font-medium text-[#52796f] hover:underline"
        >
          ←{" "}
          {language === "ru"
            ? "Вернуться в кабинет"
            : "Kabinetga qaytish"}
        </Link>


        <div className="mt-6 rounded-[30px] bg-white p-7 shadow-sm">

          <p className="text-sm font-medium text-[#52796f]">

            {language === "ru"
              ? "Заказ"
              : "Buyurtma"}

          </p>


          <h1 className="mt-2 text-3xl font-semibold text-[#173f35]">
            {
              order.order_number
            }
          </h1>


          {/* ORDER INFO */}
          <div className="mt-7 grid gap-5 rounded-2xl bg-[#f8f5ef] p-5 sm:grid-cols-2">

            <div>

              <p className="text-xs text-stone-500">
                {language === "ru"
                  ? "Статус"
                  : "Holat"}
              </p>

              <p className="mt-1 font-medium">
                {
                  order.status_display
                }
              </p>

            </div>


            <div>

              <p className="text-xs text-stone-500">
                {language === "ru"
                  ? "Оплата"
                  : "To‘lov"}
              </p>

              <p className="mt-1 font-medium">
                {
                  order.payment_status_display
                }
              </p>

            </div>


            <div>

              <p className="text-xs text-stone-500">
                {language === "ru"
                  ? "Район"
                  : "Tuman"}
              </p>

              <p className="mt-1 font-medium">
                {
                  order.district_display
                }
              </p>

            </div>


            <div>

              <p className="text-xs text-stone-500">
                {language === "ru"
                  ? "Телефон"
                  : "Telefon"}
              </p>

              <p className="mt-1 font-medium">
                {
                  order.phone
                }
              </p>

            </div>


            <div>

              <p className="text-xs text-stone-500">
                {language === "ru"
                  ? "Получатель"
                  : "Qabul qiluvchi"}
              </p>

              <p className="mt-1 font-medium">
                {
                  order.recipient_name
                }
              </p>

            </div>


            <div>

              <p className="text-xs text-stone-500">
                {language === "ru"
                  ? "Дата"
                  : "Sana"}
              </p>

              <p className="mt-1 font-medium">

                {new Date(
                  order.created_at
                ).toLocaleString(
                  language === "ru"
                    ? "ru-RU"
                    : "uz-UZ"
                )}

              </p>

            </div>

          </div>


          {/* ADDRESS */}
          <div className="mt-8">

            <h2 className="text-xl font-semibold text-[#173f35]">

              {language === "ru"
                ? "Адрес доставки"
                : "Yetkazib berish manzili"}

            </h2>


            <p className="mt-3 leading-7 text-stone-600">

              {order.city},{" "}
              {order.district_display},{" "}
              {order.street},{" "}

              {language === "ru"
                ? "дом"
                : "uy"}{" "}

              {order.house}

              {order.apartment
                ? `, ${
                    language ===
                    "ru"
                      ? "кв."
                      : "xonadon"
                  } ${order.apartment}`
                : ""}

            </p>


            {order.landmark && (
              <p className="mt-2 text-sm text-stone-500">

                {language === "ru"
                  ? "Ориентир:"
                  : "Mo‘ljal:"}{" "}

                {
                  order.landmark
                }

              </p>
            )}


            {order.comment && (
              <p className="mt-2 text-sm text-stone-500">

                {language === "ru"
                  ? "Комментарий:"
                  : "Izoh:"}{" "}

                {
                  order.comment
                }

              </p>
            )}

          </div>


          {/* ITEMS */}
          <div className="mt-8 border-t border-stone-200 pt-7">

            <h2 className="text-xl font-semibold text-[#173f35]">

              {language === "ru"
                ? "Товары"
                : "Mahsulotlar"}

            </h2>


            <div className="mt-5 space-y-4">

              {order.items?.map(
                (item) => (

                  <div
                    key={
                      item.id
                    }
                    className="flex flex-wrap justify-between gap-5 border-b border-stone-100 pb-4"
                  >

                    <div>

                      <p className="font-medium">
                        {
                          item.product_name
                        }
                      </p>


                      <p className="mt-1 text-sm text-stone-500">

                        {item.color}
                        {" · "}
                        {item.size}

                      </p>


                      <p className="mt-1 text-xs text-stone-400">
                        SKU:{" "}
                        {
                          item.sku
                        }
                      </p>

                    </div>


                    <div className="text-right">

                      <p>

                        {
                          item.quantity
                        }{" "}

                        {language === "ru"
                          ? "шт."
                          : "dona"}

                      </p>


                      <p className="mt-1 font-medium text-[#173f35]">

                        {Number(
                          item.line_total
                        ).toLocaleString(
                          "uz-UZ"
                        )}{" "}
                        so‘m

                      </p>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* TOTAL */}
            <div className="mt-6 flex justify-between gap-5 text-xl font-semibold">

              <span>
                {language === "ru"
                  ? "Итого"
                  : "Jami"}
              </span>

              <span className="text-[#173f35]">

                {Number(
                  order.total_amount
                ).toLocaleString(
                  "uz-UZ"
                )}{" "}
                so‘m

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default OrderDetailPage;