const CART_KEY = "velmora_cart";


export function getCart() {
  try {
    const cart = JSON.parse(
      localStorage.getItem(CART_KEY)
    );

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}


export function saveCart(cart) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new Event("cart-updated")
  );
}


export function addToCart(product, variant, quantity) {
  const cart = getCart();

  const existingItem = cart.find(
    (item) => item.variant_id === variant.id
  );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + quantity;

    if (newQuantity > variant.stock) {
      throw new Error(
        `Omborda faqat ${variant.stock} dona mavjud.`
      );
    }

    existingItem.quantity = newQuantity;
    existingItem.stock = variant.stock;
    existingItem.price = variant.price;
  } else {
    cart.push({
      variant_id: variant.id,

      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,

      image:
        product.images?.find(
          (image) => image.is_primary
        )?.image ??
        product.images?.[0]?.image ??
        null,

      sku: variant.sku,
      color: variant.color,
      color_code: variant.color_code,
      size: variant.size,

      price: variant.price,
      stock: variant.stock,

      quantity,
    });
  }

  saveCart(cart);
}


export function updateCartQuantity(
  variantId,
  quantity
) {
  const cart = getCart();

  const item = cart.find(
    (cartItem) =>
      cartItem.variant_id === variantId
  );

  if (!item) {
    return;
  }

  if (quantity < 1) {
    return;
  }

  if (quantity > item.stock) {
    throw new Error(
      `Omborda faqat ${item.stock} dona mavjud.`
    );
  }

  item.quantity = quantity;

  saveCart(cart);
}


export function removeFromCart(variantId) {
  const cart = getCart().filter(
    (item) =>
      item.variant_id !== variantId
  );

  saveCart(cart);
}


export function clearCart() {
  localStorage.removeItem(CART_KEY);

  window.dispatchEvent(
    new Event("cart-updated")
  );
}