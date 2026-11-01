const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

export function formatPrice(amount: number) {
  return currencyFormatter.format(amount);
}
