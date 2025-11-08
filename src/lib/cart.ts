import { CartItem } from './supabase';

const CART_KEY = 'ayushyaa_cart';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (item: CartItem): void => {
  const cart = getCart();
  const existingIndex = cart.findIndex(
    (i) => i.product.id === item.product.id && i.variant.id === item.variant.id
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdate'));
};

export const updateCartItemQuantity = (
  productId: string,
  variantId: string,
  quantity: number
): void => {
  const cart = getCart();
  const index = cart.findIndex(
    (i) => i.product.id === productId && i.variant.id === variantId
  );

  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
    window.dispatchEvent(new Event('cartUpdate'));
  }
};

export const removeFromCart = (productId: string, variantId: string): void => {
  const cart = getCart();
  const filtered = cart.filter(
    (i) => !(i.product.id === productId && i.variant.id === variantId)
  );
  saveCart(filtered);
  window.dispatchEvent(new Event('cartUpdate'));
};

export const clearCart = (): void => {
  saveCart([]);
  window.dispatchEvent(new Event('cartUpdate'));
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};
