import { Link } from "react-router-dom";
import type { Category, Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";
import { StockStatus } from "./StockStatus";

interface ProductCardProps {
  product: Product;
  category?: Category;
}

export function ProductCard({ product, category }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <ProductImage
          product={product}
          className="h-full w-full transition duration-700 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {category && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {category.name}
          </p>
        )}
        <h3 className="font-serif text-xl leading-snug">
          <Link to={`/products/${product.id}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
          <StockStatus product={product} className="text-xs" />
        </div>
        <AddToCartButton product={product} className="relative z-10 mt-3 w-full" />
      </div>
    </article>
  );
}
