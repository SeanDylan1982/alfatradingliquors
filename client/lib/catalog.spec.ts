import { describe, expect, it } from "vitest";
import {
  createUniqueId,
  getStockStatus,
  slugify,
  updateProduct,
} from "./catalog";

describe("products", () => {
  it("rejects negative or fractional stock counts before saving", async () => {
    await expect(
      updateProduct("premium-vodka", { stock: -1 }),
    ).rejects.toThrow();
    await expect(
      updateProduct("premium-vodka", { stock: 2.5 }),
    ).rejects.toThrow();
  });
});

describe("helpers", () => {
  it("derives stock status from count and threshold", () => {
    expect(getStockStatus({ stock: 0, lowStockThreshold: 3 })).toBe("out");
    expect(getStockStatus({ stock: 3, lowStockThreshold: 3 })).toBe("low");
    expect(getStockStatus({ stock: 4, lowStockThreshold: 3 })).toBe("ok");
  });

  it("slugifies accented names", () => {
    expect(slugify("Sparkling Rosé")).toBe("sparkling-rose");
    expect(slugify("Beer & Cider")).toBe("beer-cider");
  });

  it("creates unique ids from names", () => {
    expect(createUniqueId("Gin Test Category", [])).toBe("gin-test-category");
    expect(createUniqueId("Gin Test Category", ["gin-test-category"])).toBe(
      "gin-test-category-2",
    );
    expect(
      createUniqueId("Gin Test Category", [
        "gin-test-category",
        "gin-test-category-2",
      ]),
    ).toBe("gin-test-category-3");
  });
});
