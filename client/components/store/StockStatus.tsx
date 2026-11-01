import type { Product } from "@/lib/catalog";
import { getStockStatus } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function StockStatus({ product, className }: { product: Product; className?: string }) {
  const status = getStockStatus(product);

  const label =
    status === "out" ? "Out of stock" : status === "low" ? `Only ${product.stock} left` : "In stock";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium",
        status === "out" && "text-destructive",
        status === "low" && "text-amber-800",
        status === "ok" && "text-emerald-800",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          status === "out" && "bg-destructive",
          status === "low" && "bg-gold",
          status === "ok" && "bg-emerald-600",
        )}
      />
      {label}
    </span>
  );
}
