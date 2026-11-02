import { beforeEach, describe, expect, it } from "vitest";
import { addToCart, clearCart, getCart, setCartQuantity } from "./cart";

const rum = { id: "spiced-dark-rum", stock: 18 };
const vodka = { id: "premium-vodka", stock: 40 };
const soldOutGin = { id: "pink-citrus-gin", stock: 0 };

describe("cart", () => {
  beforeEach(() => {
    clearCart();
  });

  it("caps quantities at available stock", () => {
    addToCart(rum, 20);

    expect(getCart()).toEqual([{ productId: "spiced-dark-rum", quantity: 18 }]);
  });

  it("ignores products that are out of stock", () => {
    addToCart(soldOutGin);

    expect(getCart()).toEqual([]);
  });

  it("removes a line when its quantity is set to zero", () => {
    addToCart(vodka, 2);
    setCartQuantity(vodka, 0);

    expect(getCart()).toEqual([]);
  });

  it("adds to an existing line", () => {
    addToCart(vodka, 2);
    addToCart(vodka, 3);

    expect(getCart()).toEqual([{ productId: "premium-vodka", quantity: 5 }]);
  });
});
