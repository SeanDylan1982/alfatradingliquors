import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { StockStatus } from "@/components/store/StockStatus";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { type Product, useCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { formatMinutes, getOpenStatus, openingHours, storeInfo } from "@/lib/store-info";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 6000;
const MAX_SLIDES = 8;

function pickCarouselProducts(published: Product[]) {
  const featured = published.filter((product) => product.featured);
  if (featured.length > 0) return featured.slice(0, MAX_SLIDES);

  const seenCategories = new Set<string>();
  return published
    .filter((product) => {
      if (seenCategories.has(product.categoryId)) return false;
      seenCategories.add(product.categoryId);
      return true;
    })
    .slice(0, MAX_SLIDES);
}

function SectionHeading({
  eyebrow,
  title,
  actionTo,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  actionTo?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl">{title}</h2>
      </div>
      {actionTo && actionLabel && (
        <Link to={actionTo} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export default function Index() {
  const { categories, products } = useCatalog();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const published = useMemo(() => products.filter((product) => product.published), [products]);
  const slides = useMemo(() => pickCarouselProducts(published), [published]);
  const newArrivals = useMemo(
    () => [...published].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4),
    [published],
  );
  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const openStatus = getOpenStatus();

  useEffect(() => {
    if (!api) return;
    const handleSelect = () => setCurrent(api.selectedScrollSnap());
    handleSelect();
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused || slides.length < 2) return;
    const intervalId = window.setInterval(() => api.scrollNext(), AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [api, paused, slides.length]);

  return (
    <>
      <section className="bg-gradient-to-b from-accent/70 via-background to-background pb-20 pt-6 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {slides.length > 0 ? (
            <>
              <Carousel
                key={slides.map((product) => product.id).join("|")}
                opts={{ loop: true }}
                setApi={setApi}
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
              >
                <CarouselContent>
                  {slides.map((product) => (
                    <CarouselItem key={product.id}>
                      <div className="grid items-center gap-8 rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-6 md:grid-cols-2 md:gap-12 md:p-12">
                        <Link to={`/products/${product.id}`} className="group block overflow-hidden rounded-2xl bg-muted">
                          <ProductImage
                            product={product}
                            className="aspect-[4/5] w-full transition duration-700 group-hover:scale-105 md:aspect-[5/4]"
                          />
                        </Link>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {categoryById.get(product.categoryId)?.name}
                          </p>
                          <h3 className="mt-4 font-serif text-4xl leading-[1.05] sm:text-5xl">{product.name}</h3>
                          {product.brand && <p className="mt-3 text-sm text-muted-foreground">{product.brand}</p>}
                          <p className="mt-5 line-clamp-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {product.description}
                          </p>
                          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                            <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
                            <StockStatus product={product} />
                          </div>
                          <div className="mt-8 flex flex-wrap gap-3">
                            <AddToCartButton product={product} size="lg" />
                            <Button asChild variant="outline" size="lg">
                              <Link to={`/products/${product.id}`}>View details</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-card"
                  aria-label="Previous product"
                  onClick={() => api?.scrollPrev()}
                >
                  <ChevronLeft />
                </Button>
                <div className="flex items-center gap-2">
                  {slides.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      aria-label={`Show ${product.name}`}
                      aria-current={index === current}
                      onClick={() => api?.scrollTo(index)}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        index === current ? "w-8 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/50",
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-card"
                  aria-label="Next product"
                  onClick={() => api?.scrollNext()}
                >
                  <ChevronRight />
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <h2 className="font-serif text-3xl">Our shelves are being stocked</h2>
              <p className="mt-3 text-muted-foreground">Check back soon for featured bottles.</p>
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Browse the range" title="Shop by category" actionTo="/shop" actionLabel="All products" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = published.filter((product) => product.categoryId === category.id).length;
              return (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  className="group flex items-center justify-between gap-6 rounded-2xl border border-border/80 bg-card p-6 transition hover:border-primary/30 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-serif text-2xl">{category.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {count} {count === 1 ? "product" : "products"}
                    </p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="size-5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="bg-secondary/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Just in" title="New arrivals" actionTo="/shop" actionLabel="View all" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} category={categoryById.get(product.categoryId)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl bg-accent/60 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Visit us</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Pop in, or order ahead.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              Find us in Northmead, Benoni. Build your order online, then send it to the shop to confirm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={storeInfo.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin />
                  Get directions
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card">
                <a href={`tel:${storeInfo.phoneHref}`}>
                  <Phone />
                  Call the shop
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card">
                <a
                  href={`https://wa.me/${storeInfo.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-serif text-2xl">Opening hours</p>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  openStatus.isOpen ? "bg-emerald-100 text-emerald-900" : "bg-muted text-muted-foreground",
                )}
              >
                {openStatus.label}
              </span>
            </div>
            <dl className="mt-6 divide-y divide-border">
              {openingHours.map((entry) => (
                <div key={entry.label} className="flex justify-between gap-6 py-4">
                  <dt className="text-muted-foreground">{entry.label}</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMinutes(entry.opens)} – {formatMinutes(entry.closes)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-border pt-6 text-sm text-muted-foreground">
              {storeInfo.addressLines.join(", ")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
