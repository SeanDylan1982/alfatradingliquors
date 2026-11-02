import { useSyncExternalStore } from "react";
import { z } from "zod";

const cartLineSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export type CartLine = z.infer<typeof cartLineSchema>;

interface StockedProduct {
  id: string;
  stock: number;
}

const STORAGE_KEY = "alfa-trading-liquors:cart:v1";

function readStoredCart(): CartLine[] {
  const raw =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = z.array(cartLineSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

let cart: CartLine[] = readStoredCart();
const listeners = new Set<() => void>();

function commit(next: CartLine[]) {
  cart = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCart() {
  return cart;
}

export function useCart() {
  return useSyncExternalStore(subscribe, getCart, getCart);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    cart = readStoredCart();
    listeners.forEach((listener) => listener());
  });
}

export function setCartQuantity(product: StockedProduct, quantity: number) {
  const next = Math.min(Math.floor(quantity), product.stock);
  const exists = cart.some((line) => line.productId === product.id);

  let lines: CartLine[];
  if (next <= 0) {
    lines = cart.filter((line) => line.productId !== product.id);
  } else if (exists) {
    lines = cart.map((line) =>
      line.productId === product.id ? { ...line, quantity: next } : line,
    );
  } else {
    lines = [...cart, { productId: product.id, quantity: next }];
  }
  commit(lines);
}

export function addToCart(product: StockedProduct, quantity = 1) {
  const current =
    cart.find((line) => line.productId === product.id)?.quantity ?? 0;
  setCartQuantity(product, current + quantity);
}

export function clearCart() {
  commit([]);
}
