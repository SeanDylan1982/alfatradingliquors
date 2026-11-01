import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { StockStatus } from "@/components/store/StockStatus";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { productId } = useParams();
  const { categories, products, cart } = useCatalog();
  const [imageIndex, setImageIndex] = useState(0);
  const [requestedQuantity, setRequestedQuantity] = useState(1);

  const product = products.find((current) => current.id === productId && current.published);

  if (!product) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
        <p className="font-serif text-3xl">This product isn't available</p>
        <p className="mt-3 text-muted-foreground">It may have been removed or is no longer listed.</p>
        <Button asChild className="mt-8">
          <Link to="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  const category = categories.find((current) => current.id === product.categoryId);
  const inCart = cart.find((line) => line.productId === product.id)?.quantity ?? 0;
  const maxQuantity = Math.max(product.stock - inCart, 1);
  const quantity = Math.min(requestedQuantity, maxQuantity);
  const related = products
    .filter((current) => current.published && current.categoryId === product.categoryId && current.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-12">
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border/70 bg-muted">
            <ProductImage product={product} imageIndex={imageIndex} className="h-full w-full" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.map((src, index) => (
                <button
                  key={`${index}-${product.id}`}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === imageIndex}
                  onClick={() => setImageIndex(index)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-xl border-2 bg-muted transition",
                    index === imageIndex ? "border-primary" : "border-transparent hover:border-primary/40",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/shop" className="hover:text-foreground">
              Shop
            </Link>
            {category && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/shop?category=${category.id}`} className="hover:text-foreground">
                  {category.name}
                </Link>
              </>
            )}
          </nav>

          {product.brand && (
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-5 text-3xl font-semibold">{formatPrice(product.price)}</p>
          <div className="mt-3">
            <StockStatus product={product} />
          </div>

          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <QuantityStepper value={quantity} max={maxQuantity} onChange={setRequestedQuantity} />
            <AddToCartButton product={product} quantity={quantity} size="lg" className="h-12 flex-1 rounded-full px-8 sm:flex-none" />
          </div>

          {product.details.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl">Product details</h2>
              <dl className="mt-5 divide-y divide-border rounded-2xl border border-border/80 bg-card">
                {product.details.map((detail) => (
                  <div key={`${detail.label}-${detail.value}`} className="flex justify-between gap-6 px-5 py-4">
                    <dt className="text-muted-foreground">{detail.label}</dt>
                    <dd className="text-right font-medium">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-secondary/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl sm:text-4xl">You may also like</h2>
              <Link
                to={`/shop?category=${product.categoryId}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                More {category?.name}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
