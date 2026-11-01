import { Wine } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  product: Pick<Product, "name" | "images">;
  imageIndex?: number;
  className?: string;
}

export function ProductImage({ product, imageIndex = 0, className }: ProductImageProps) {
  const src = product.images[imageIndex];

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-secondary via-accent/60 to-muted",
          className,
        )}
      >
        <Wine className="h-1/3 w-auto text-primary/25" strokeWidth={1.25} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={product.name}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}
