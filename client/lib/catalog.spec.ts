import { beforeEach, describe, expect, it } from "vitest";
import {
  addToCart,
  clearCart,
  deleteCategory,
  deleteProduct,
  getCatalog,
  getStockStatus,
  saveCategory,
  setCartQuantity,
  slugify,
  updateProduct,
} from "./catalog";

describe("cart", () => {
  beforeEach(() => {
    clearCart();
  });

  it("caps quantities at available stock", () => {
    addToCart("spiced-dark-rum", 20);

    expect(getCatalog().cart).toEqual([{ productId: "spiced-dark-rum", quantity: 18 }]);
  });

  it("ignores products that are out of stock", () => {
    addToCart("pink-citrus-gin");

    expect(getCatalog().cart).toEqual([]);
  });

  it("removes a line when its quantity is set to zero", () => {
    addToCart("premium-vodka", 2);
    setCartQuantity("premium-vodka", 0);

    expect(getCatalog().cart).toEqual([]);
  });

  it("removes cart lines when their product is deleted", () => {
    addToCart("craft-apple-cider", 1);
    deleteProduct("craft-apple-cider");

    expect(getCatalog().cart).toEqual([]);
  });
});

describe("categories", () => {
  it("refuses to delete a category that still has products", () => {
    expect(() => deleteCategory("whisky")).toThrow(/Move or delete/);
  });

  it("creates unique ids from names", () => {
    saveCategory({ name: "Gin Test Category", description: "" });
    saveCategory({ name: "Gin Test Category", description: "" });

    const ids = getCatalog().categories.map((category) => category.id);
    expect(ids).toContain("gin-test-category");
    expect(ids).toContain("gin-test-category-2");
  });
});

describe("products", () => {
  it("rejects negative or fractional stock counts", () => {
    expect(() => updateProduct("premium-vodka", { stock: -1 })).toThrow();
    expect(() => updateProduct("premium-vodka", { stock: 2.5 })).toThrow();
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
});
