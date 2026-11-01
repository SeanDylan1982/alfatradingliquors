import { useSyncExternalStore } from "react";
import { z } from "zod";
import { createSeedCatalog } from "./seed";

const productDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  categoryId: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  description: z.string(),
  details: z.array(productDetailSchema),
  images: z.array(z.string()),
  featured: z.boolean(),
  published: z.boolean(),
  createdAt: z.number(),
});

const cartLineSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const catalogSchema = z.object({
  categories: z.array(categorySchema),
  products: z.array(productSchema),
  cart: z.array(cartLineSchema),
});

export type ProductDetail = z.infer<typeof productDetailSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

export type ProductInput = Omit<Product, "id" | "createdAt"> & { id?: string };
export type CategoryInput = Omit<Category, "id"> & { id?: string };

export type StockStatus = "ok" | "low" | "out";

export function getStockStatus(product: Pick<Product, "stock" | "lowStockThreshold">): StockStatus {
  if (product.stock === 0) return "out";
  if (product.stock <= product.lowStockThreshold) return "low";
  return "ok";
}

const STORAGE_KEY = "alfa-trading-liquors:catalog:v1";

function readStoredCatalog(): Catalog {
  const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = catalogSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      return createSeedCatalog();
    }
  }
  return createSeedCatalog();
}

let catalog: Catalog = readStoredCatalog();
const listeners = new Set<() => void>();

function persist(next: Catalog) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error("Browser storage is full. Remove some product images and try again.");
  }
}

function commit(next: Catalog) {
  persist(next);
  catalog = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCatalog() {
  return catalog;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    catalog = readStoredCatalog();
    listeners.forEach((listener) => listener());
  });
}

export function useCatalog() {
  return useSyncExternalStore(subscribe, getCatalog, getCatalog);
}

export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function createUniqueId(name: string, takenIds: string[]) {
  const base = slugify(name);
  let id = base;
  let suffix = 2;
  while (takenIds.includes(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

export function saveCategory(input: CategoryInput) {
  const name = input.name.trim();
  const description = input.description.trim();
  const existing = catalog.categories.find((category) => category.id === input.id);

  if (existing) {
    commit({
      ...catalog,
      categories: catalog.categories.map((category) =>
        category.id === existing.id ? { ...category, name, description } : category,
      ),
    });
    return;
  }

  const id = createUniqueId(name, catalog.categories.map((category) => category.id));
  commit({
    ...catalog,
    categories: [...catalog.categories, { id, name, description }],
  });
}

export function deleteCategory(id: string) {
  if (catalog.products.some((product) => product.categoryId === id)) {
    throw new Error("Move or delete the products in this category first.");
  }
  commit({
    ...catalog,
    categories: catalog.categories.filter((category) => category.id !== id),
  });
}

export function saveProduct(input: ProductInput) {
  const existing = catalog.products.find((product) => product.id === input.id);
  const id = existing?.id ?? createUniqueId(input.name, catalog.products.map((product) => product.id));
  const product: Product = {
    ...input,
    id,
    createdAt: existing?.createdAt ?? Date.now(),
  };

  commit({
    ...catalog,
    products: existing
      ? catalog.products.map((current) => (current.id === id ? product : current))
      : [...catalog.products, product],
  });
}

export function updateProduct(id: string, patch: Partial<Pick<Product, "stock" | "featured" | "published">>) {
  if (patch.stock !== undefined && (!Number.isInteger(patch.stock) || patch.stock < 0)) {
    throw new Error("Stock must be a whole number, 0 or more.");
  }
  commit({
    ...catalog,
    products: catalog.products.map((product) => (product.id === id ? { ...product, ...patch } : product)),
  });
}

export function deleteProduct(id: string) {
  commit({
    ...catalog,
    products: catalog.products.filter((product) => product.id !== id),
    cart: catalog.cart.filter((line) => line.productId !== id),
  });
}

export function setCartQuantity(productId: string, quantity: number) {
  const product = catalog.products.find((current) => current.id === productId);
  const next = Math.min(Math.floor(quantity), product?.stock ?? 0);
  const exists = catalog.cart.some((line) => line.productId === productId);

  let cart: CartLine[];
  if (next <= 0) {
    cart = catalog.cart.filter((line) => line.productId !== productId);
  } else if (exists) {
    cart = catalog.cart.map((line) => (line.productId === productId ? { ...line, quantity: next } : line));
  } else {
    cart = [...catalog.cart, { productId, quantity: next }];
  }
  commit({ ...catalog, cart });
}

export function addToCart(productId: string, quantity = 1) {
  const current = catalog.cart.find((line) => line.productId === productId)?.quantity ?? 0;
  setCartQuantity(productId, current + quantity);
}

export function clearCart() {
  commit({ ...catalog, cart: [] });
}
