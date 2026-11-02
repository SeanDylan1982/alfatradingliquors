import { useSyncExternalStore } from "react";
import { z } from "zod";
import { describeError } from "./errors";
import { createSeedCatalog } from "./seed";
import { supabase } from "./supabase";

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

const productRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  category_id: z.string(),
  price: z.coerce.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  low_stock_threshold: z.number().int().nonnegative(),
  description: z.string(),
  details: z.array(productDetailSchema),
  images: z.array(z.string()),
  featured: z.boolean(),
  published: z.boolean(),
  created_at: z.string(),
});

export type ProductDetail = z.infer<typeof productDetailSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductInput = Omit<Product, "id" | "createdAt"> & { id?: string };
export type CategoryInput = Omit<Category, "id"> & { id?: string };

export interface CatalogData {
  categories: Category[];
  products: Product[];
}

interface CatalogState extends CatalogData {
  status: "loading" | "ready" | "error";
  error: string | null;
}

export type StockStatus = "ok" | "low" | "out";

export function getStockStatus(
  product: Pick<Product, "stock" | "lowStockThreshold">,
): StockStatus {
  if (product.stock === 0) return "out";
  if (product.stock <= product.lowStockThreshold) return "low";
  return "ok";
}

let state: CatalogState = {
  categories: [],
  products: [],
  status: "loading",
  error: null,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<CatalogState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getState() {
  return state;
}

export function useCatalog() {
  return useSyncExternalStore(subscribe, getState, getState);
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

export function createUniqueId(name: string, takenIds: string[]) {
  const base = slugify(name);
  let id = base;
  let suffix = 2;
  while (takenIds.includes(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function throwOnError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function fromProductRow(row: z.infer<typeof productRowSchema>): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    categoryId: row.category_id,
    price: row.price,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    description: row.description,
    details: row.details,
    images: row.images,
    featured: row.featured,
    published: row.published,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function toProductRow(input: ProductInput) {
  return {
    name: input.name,
    brand: input.brand,
    category_id: input.categoryId,
    price: input.price,
    stock: input.stock,
    low_stock_threshold: input.lowStockThreshold,
    description: input.description,
    details: input.details,
    images: input.images,
    featured: input.featured,
    published: input.published,
  };
}

async function fetchCatalog(): Promise<CatalogData> {
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("id, name, description").order("name"),
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);
  throwOnError(categoriesResult.error);
  throwOnError(productsResult.error);

  return {
    categories: z.array(categorySchema).parse(categoriesResult.data),
    products: z
      .array(productRowSchema)
      .parse(productsResult.data)
      .map(fromProductRow),
  };
}

export async function refreshCatalog() {
  setState({ ...(await fetchCatalog()), status: "ready", error: null });
}

export async function loadCatalog() {
  try {
    await refreshCatalog();
  } catch (error) {
    setState({ status: "error", error: describeError(error) });
  }
}

export async function seedCatalog() {
  const seed = createSeedCatalog();
  throwOnError(
    (await supabase.from("categories").upsert(seed.categories)).error,
  );
  throwOnError(
    (
      await supabase
        .from("products")
        .upsert(
          seed.products.map((product) => ({
            id: product.id,
            ...toProductRow(product),
          })),
        )
    ).error,
  );
  await refreshCatalog();
}

export async function saveCategory(input: CategoryInput) {
  const name = input.name.trim();
  const description = input.description.trim();
  const result = input.id
    ? await supabase
        .from("categories")
        .update({ name, description })
        .eq("id", input.id)
    : await supabase.from("categories").insert({
        id: createUniqueId(
          name,
          state.categories.map((category) => category.id),
        ),
        name,
        description,
      });
  throwOnError(result.error);
  await refreshCatalog();
}

export async function deleteCategory(id: string) {
  if (state.products.some((product) => product.categoryId === id)) {
    throw new Error("Move or delete the products in this category first.");
  }
  throwOnError((await supabase.from("categories").delete().eq("id", id)).error);
  await refreshCatalog();
}

export async function saveProduct(input: ProductInput) {
  const existing = state.products.find((product) => product.id === input.id);
  const row = toProductRow(input);
  const result = existing
    ? await supabase.from("products").update(row).eq("id", existing.id)
    : await supabase.from("products").insert({
        ...row,
        id: createUniqueId(
          input.name,
          state.products.map((product) => product.id),
        ),
      });
  throwOnError(result.error);
  await refreshCatalog();
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "stock" | "featured" | "published">>,
) {
  if (
    patch.stock !== undefined &&
    (!Number.isInteger(patch.stock) || patch.stock < 0)
  ) {
    throw new Error("Stock must be a whole number, 0 or more.");
  }
  throwOnError(
    (await supabase.from("products").update(patch).eq("id", id)).error,
  );
  await refreshCatalog();
}

export async function deleteProduct(id: string) {
  throwOnError((await supabase.from("products").delete().eq("id", id)).error);
  await refreshCatalog();
}
