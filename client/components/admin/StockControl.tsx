import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Product, updateProduct } from "@/lib/catalog";

export function StockControl({ product }: { product: Product }) {
  const setStock = (stock: number) => {
    if (stock === product.stock) return;
    updateProduct(product.id, { stock });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        aria-label={`Decrease stock for ${product.name}`}
        disabled={product.stock === 0}
        onClick={() => setStock(product.stock - 1)}
      >
        <Minus />
      </Button>
      <Input
        key={product.stock}
        type="number"
        min={0}
        step={1}
        aria-label={`Stock count for ${product.name}`}
        defaultValue={product.stock}
        className="h-8 w-20 text-center tabular-nums"
        onBlur={(event) => {
          const next = Number(event.currentTarget.value);
          if (Number.isInteger(next) && next >= 0) {
            setStock(next);
          } else {
            event.currentTarget.value = String(product.stock);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        aria-label={`Increase stock for ${product.name}`}
        onClick={() => setStock(product.stock + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
