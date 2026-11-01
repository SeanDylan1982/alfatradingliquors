import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Eraser, Mail, Printer, Send, ShoppingBag, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductImage } from "@/components/store/ProductImage";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { Button } from "@/components/ui/button";
import { clearCart, setCartQuantity, useCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import {
  buildEmailOrderUrl,
  buildOrderLines,
  buildOrderText,
  buildWhatsAppOrderUrl,
  getOrderTotal,
} from "@/lib/order";
import { storeInfo } from "@/lib/store-info";

export default function Cart() {
  const { cart, products } = useCatalog();
  const lines = useMemo(() => buildOrderLines(cart, products), [cart, products]);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-32 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="mt-6 font-serif text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Browse the range and add bottles you'd like to order.</p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const total = getOrderTotal(lines);
  const orderText = buildOrderText(lines);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="hidden print:block">
        <p className="font-serif text-2xl font-semibold">{storeInfo.name}</p>
        <p className="text-sm">
          {storeInfo.addressLines.join(", ")} · {storeInfo.phoneDisplay}
        </p>
        <p className="mt-6 font-serif text-xl">Order summary</p>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl print:hidden">Your cart</h1>
      <p className="mt-3 text-muted-foreground print:hidden">
        {itemCount} {itemCount === 1 ? "item" : "items"} ready to send to the shop.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] print:block">
        <ul className="divide-y divide-border rounded-2xl border border-border/80 bg-card print:border-0">
          {lines.map(({ product, quantity, lineTotal }) => (
            <li key={product.id} className="flex gap-4 p-4 sm:gap-6 sm:p-6">
              <Link
                to={`/products/${product.id}`}
                className="size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28 print:hidden"
              >
                <ProductImage product={product} className="h-full w-full" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <Link to={`/products/${product.id}`} className="font-serif text-xl leading-snug hover:underline">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{formatPrice(product.price)} each</p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatPrice(lineTotal)}</p>
                </div>

                {quantity > product.stock && (
                  <p className="mt-2 text-sm text-destructive">
                    Only {product.stock} left in stock. Please lower the quantity.
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="print:hidden">
                    <QuantityStepper
                      value={quantity}
                      max={product.stock}
                      onChange={(value) => setCartQuantity(product.id, value)}
                    />
                  </div>
                  <span className="hidden text-sm print:inline">Qty: {quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive print:hidden"
                    onClick={() => setCartQuantity(product.id, 0)}
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:sticky lg:top-24 print:mt-6 print:border-0 print:p-0 print:shadow-none">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{itemCount}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <div className="mt-8 grid gap-3 print:hidden">
            <Button asChild size="lg">
              <a href={buildWhatsAppOrderUrl(orderText)} target="_blank" rel="noopener noreferrer">
                <Send />
                Send order
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={buildEmailOrderUrl(orderText)}>
                <Mail />
                Email order
              </a>
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => window.print()}>
              <Printer />
              Print order
            </Button>
            <ConfirmDialog
              trigger={
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive">
                  <Eraser />
                  Clear cart
                </Button>
              }
              title="Clear your cart?"
              description="All items will be removed from your cart. This can't be undone."
              confirmLabel="Clear cart"
              onConfirm={clearCart}
            />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground print:hidden">
            Send opens WhatsApp with your order filled in. Email opens your mail app. The shop will confirm
            availability and payment with you. Strictly 18 or older.
          </p>
        </aside>
      </div>
    </div>
  );
}
