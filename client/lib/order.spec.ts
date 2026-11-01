import { describe, expect, it } from "vitest";
import type { Product } from "./catalog";
import { formatPrice } from "./format";
import {
  buildEmailOrderUrl,
  buildOrderLines,
  buildOrderText,
  buildWhatsAppOrderUrl,
  getOrderTotal,
} from "./order";

const product = (overrides: Partial<Product>): Product => ({
  id: "single-malt",
  name: "Single Malt",
  brand: "Test",
  categoryId: "whisky",
  price: 100,
  stock: 10,
  lowStockThreshold: 2,
  description: "",
  details: [],
  images: [],
  featured: false,
  published: true,
  createdAt: 0,
  ...overrides,
});

describe("buildOrderLines", () => {
  it("skips cart lines whose product no longer exists", () => {
    const products = [product({ id: "a", price: 49.99 })];
    const lines = buildOrderLines(
      [
        { productId: "a", quantity: 3 },
        { productId: "missing", quantity: 1 },
      ],
      products,
    );

    expect(lines).toHaveLength(1);
    expect(lines[0].lineTotal).toBe(149.97);
  });
});

describe("getOrderTotal", () => {
  it("sums line totals and rounds to cents", () => {
    const products = [product({ id: "a", price: 0.1 }), product({ id: "b", price: 0.2 })];
    const lines = buildOrderLines(
      [
        { productId: "a", quantity: 1 },
        { productId: "b", quantity: 1 },
      ],
      products,
    );

    expect(getOrderTotal(lines)).toBe(0.3);
  });
});

describe("buildOrderText", () => {
  it("lists each line and the total", () => {
    const lines = buildOrderLines([{ productId: "single-malt", quantity: 2 }], [product({ price: 100 })]);
    const text = buildOrderText(lines);

    expect(text).toContain("2 x Single Malt - ");
    expect(text).toContain(`Total: ${formatPrice(200)}`);
  });
});

describe("order links", () => {
  it("builds a WhatsApp link with digits only and an encoded message", () => {
    const url = buildWhatsAppOrderUrl("Line 1\nLine 2");

    expect(url).toBe("https://wa.me/27612856951?text=Line%201%0ALine%202");
  });

  it("builds an encoded mailto link", () => {
    const url = buildEmailOrderUrl("1 x Gin\nTotal");

    expect(url).toContain("subject=Order%20from%20Alfa%20Trading%20Liquors");
    expect(url).toContain("body=1%20x%20Gin%0ATotal");
  });
});
