import type { CartLine, Product } from "./catalog";
import { formatPrice } from "./format";
import { storeInfo } from "./store-info";

export interface OrderLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function buildOrderLines(cart: CartLine[], products: Product[]): OrderLine[] {
  return cart.flatMap((line) => {
    const product = products.find((current) => current.id === line.productId);
    if (!product) return [];
    return [
      {
        product,
        quantity: line.quantity,
        lineTotal: roundCurrency(product.price * line.quantity),
      },
    ];
  });
}

export function getOrderTotal(lines: OrderLine[]) {
  return roundCurrency(lines.reduce((sum, line) => sum + line.lineTotal, 0));
}

export function buildOrderText(lines: OrderLine[]) {
  const itemLines = lines.map(
    (line) => `${line.quantity} x ${line.product.name} - ${formatPrice(line.lineTotal)}`,
  );
  return [
    "Hi Alfa Trading Liquors, I'd like to place this order:",
    "",
    ...itemLines,
    "",
    `Total: ${formatPrice(getOrderTotal(lines))}`,
  ].join("\n");
}

export function buildWhatsAppOrderUrl(text: string) {
  return `https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildEmailOrderUrl(text: string) {
  const subject = `Order from ${storeInfo.name}`;
  return `mailto:${storeInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
