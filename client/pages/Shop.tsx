import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { Input } from "@/components/ui/input";
import { type Product, useCatalog } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "name" | "price-asc" | "price-desc";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const comparators: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

function CategoryPill({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export default function Shop() {
  const { categories, products } = useCatalog();
  const [searchParams] = useSearchParams();
  const activeCategory = categories.find((category) => category.id === searchParams.get("category"));
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (!product.published) return false;
        if (activeCategory && product.categoryId !== activeCategory.id) return false;
        if (!term) return true;
        return [product.name, product.brand, product.description].some((field) =>
          field.toLowerCase().includes(term),
        );
      })
      .sort(comparators[sort]);
  }, [products, activeCategory, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {activeCategory ? "Category" : "Our range"}
      </p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{activeCategory?.name ?? "Shop everything"}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {activeCategory?.description ??
          "Browse the full range. Add what you like to your cart, then send the order to the shop."}
      </p>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <CategoryPill to="/shop" active={!activeCategory} label="All" />
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              to={`/shop?category=${category.id}`}
              active={activeCategory?.id === category.id}
              label={category.name}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search products"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-full bg-card pl-11 sm:w-72"
            />
          </div>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-11 rounded-full border border-input bg-card px-4 text-sm font-medium"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
      </p>

      {visibleProducts.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} category={categoryById.get(product.categoryId)} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center">
          <p className="font-serif text-2xl">No products match your search</p>
          <p className="mt-2 text-muted-foreground">Try a different word or view the full range.</p>
          <Link
            to="/shop"
            onClick={() => setQuery("")}
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Show all products
          </Link>
        </div>
      )}
    </div>
  );
}
