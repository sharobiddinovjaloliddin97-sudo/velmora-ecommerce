export const getOrderStatusLabel = (
  status,
  language
) => {
  const labels = {
    NEW: {
      uz: "Yangi",
      ru: "Новый",
    },

    CONFIRMED: {
      uz: "Tasdiqlangan",
      ru: "Подтверждён",
    },

    SHIPPING: {
      uz: "Yetkazilmoqda",
      ru: "Доставляется",
    },

    DELIVERED: {
      uz: "Yetkazildi",
      ru: "Доставлен",
    },

    CANCELLED: {
      uz: "Bekor qilindi",
      ru: "Отменён",
    },
  };

  return (
    labels[status]?.[language] ||
    status
  );
};


export const getPaymentStatusLabel = (
  status,
  language
) => {
  const labels = {
    UNPAID: {
      uz: "To‘lanmagan",
      ru: "Не оплачено",
    },

    PAID: {
      uz: "To‘langan",
      ru: "Оплачено",
    },

    REFUNDED: {
      uz: "Qaytarilgan",
      ru: "Возвращено",
    },
  };

  return (
    labels[status]?.[language] ||
    status
  );
};


export const getPaymentMethodLabel = (
  method,
  language
) => {
  const labels = {
    COD: {
      uz: "Yetkazilganda naqd to‘lov",
      ru: "Оплата при доставке",
    },
    CASH_ON_DELIVERY: {
      uz: "Yetkazilganda naqd to‘lov",
      ru: "Оплата при доставке",
    },
  };

  return (
    labels[method]?.[language] ||
    method
  );
};
