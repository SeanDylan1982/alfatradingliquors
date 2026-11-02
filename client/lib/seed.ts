import type { CatalogData, Product } from "./catalog";

function product(
  fields: Pick<
    Product,
    | "id"
    | "name"
    | "brand"
    | "categoryId"
    | "price"
    | "stock"
    | "lowStockThreshold"
    | "description"
    | "details"
  > &
    Partial<Pick<Product, "featured">>,
  createdAt: number,
): Product {
  return {
    featured: false,
    published: true,
    images: [],
    createdAt,
    ...fields,
  };
}

export function createSeedCatalog(): CatalogData {
  const now = Date.now();
  return {
    categories: [
      {
        id: "whisky",
        name: "Whisky",
        description: "Single malts, blends and bourbons",
      },
      {
        id: "gin",
        name: "Gin",
        description: "London dry, pink and botanical gins",
      },
      {
        id: "vodka",
        name: "Vodka",
        description: "Smooth, clean and ready to mix",
      },
      { id: "rum", name: "Rum", description: "Spiced, dark and white rums" },
      {
        id: "wine",
        name: "Wine",
        description: "Reds, whites, rosé and bubbles",
      },
      {
        id: "beer-cider",
        name: "Beer & Cider",
        description: "Lagers, craft beers and ciders",
      },
    ],
    products: [
      product(
        {
          id: "single-malt-12-year",
          name: "Single Malt 12 Year",
          brand: "Highland Cask",
          categoryId: "whisky",
          price: 589,
          stock: 14,
          lowStockThreshold: 4,
          description:
            "Honeyed and oaky with a long finish. A good gift bottle for whisky lovers.",
          details: [
            { label: "ABV", value: "40%" },
            { label: "Volume", value: "750ml" },
            { label: "Origin", value: "Scotland" },
          ],
          featured: true,
        },
        now,
      ),
      product(
        {
          id: "blended-scotch",
          name: "Blended Scotch",
          brand: "Glen Harbour",
          categoryId: "whisky",
          price: 349.99,
          stock: 22,
          lowStockThreshold: 6,
          description:
            "Smooth, easy-drinking blend with notes of vanilla and toasted oak.",
          details: [
            { label: "ABV", value: "40%" },
            { label: "Volume", value: "750ml" },
            { label: "Origin", value: "Scotland" },
          ],
          featured: true,
        },
        now - 1000,
      ),
      product(
        {
          id: "bourbon-barrel-select",
          name: "Bourbon Barrel Select",
          brand: "Oak & Ember",
          categoryId: "whisky",
          price: 429,
          stock: 3,
          lowStockThreshold: 4,
          description:
            "Caramel and vanilla sweetness with a warm spice finish.",
          details: [
            { label: "ABV", value: "43%" },
            { label: "Volume", value: "750ml" },
            { label: "Origin", value: "USA" },
          ],
        },
        now - 2000,
      ),
      product(
        {
          id: "london-dry-gin",
          name: "London Dry Gin",
          brand: "Juniper Row",
          categoryId: "gin",
          price: 279,
          stock: 30,
          lowStockThreshold: 6,
          description:
            "Crisp juniper and citrus peel. Built for a classic gin and tonic.",
          details: [
            { label: "ABV", value: "43%" },
            { label: "Volume", value: "750ml" },
            { label: "Origin", value: "England" },
          ],
          featured: true,
        },
        now - 3000,
      ),
      product(
        {
          id: "pink-citrus-gin",
          name: "Pink Citrus Gin",
          brand: "Juniper Row",
          categoryId: "gin",
          price: 259,
          stock: 0,
          lowStockThreshold: 5,
          description:
            "Bright grapefruit and rhubarb notes with a soft pink finish.",
          details: [
            { label: "ABV", value: "37.5%" },
            { label: "Volume", value: "750ml" },
          ],
        },
        now - 4000,
      ),
      product(
        {
          id: "premium-vodka",
          name: "Premium Vodka",
          brand: "Northern Frost",
          categoryId: "vodka",
          price: 219,
          stock: 40,
          lowStockThreshold: 8,
          description:
            "Triple-filtered and clean on the palate. Mixes well with everything.",
          details: [
            { label: "ABV", value: "40%" },
            { label: "Volume", value: "750ml" },
          ],
        },
        now - 5000,
      ),
      product(
        {
          id: "spiced-dark-rum",
          name: "Spiced Dark Rum",
          brand: "Harbour Rum Co.",
          categoryId: "rum",
          price: 239,
          stock: 18,
          lowStockThreshold: 5,
          description:
            "Vanilla, cinnamon and dried fruit. Excellent with cola or ginger beer.",
          details: [
            { label: "ABV", value: "35%" },
            { label: "Volume", value: "750ml" },
          ],
          featured: true,
        },
        now - 6000,
      ),
      product(
        {
          id: "cuban-style-white-rum",
          name: "Cuban Style White Rum",
          brand: "Harbour Rum Co.",
          categoryId: "rum",
          price: 199,
          stock: 12,
          lowStockThreshold: 4,
          description: "Light and crisp, made for mojitos and daiquiris.",
          details: [
            { label: "ABV", value: "37.5%" },
            { label: "Volume", value: "750ml" },
          ],
        },
        now - 7000,
      ),
      product(
        {
          id: "cabernet-sauvignon",
          name: "Cabernet Sauvignon",
          brand: "Vineyard Select",
          categoryId: "wine",
          price: 119,
          stock: 48,
          lowStockThreshold: 10,
          description: "Blackcurrant and cedar with firm, structured tannins.",
          details: [
            { label: "ABV", value: "13.5%" },
            { label: "Volume", value: "750ml" },
            { label: "Style", value: "Red, dry" },
          ],
        },
        now - 8000,
      ),
      product(
        {
          id: "sparkling-rose",
          name: "Sparkling Rosé",
          brand: "Vineyard Select",
          categoryId: "wine",
          price: 149,
          stock: 20,
          lowStockThreshold: 5,
          description:
            "Fresh strawberry and red berry aromas with a lively bubble.",
          details: [
            { label: "ABV", value: "11.5%" },
            { label: "Volume", value: "750ml" },
            { label: "Style", value: "Sparkling, rosé" },
          ],
          featured: true,
        },
        now - 9000,
      ),
      product(
        {
          id: "lager-6-pack",
          name: "Lager 6-Pack",
          brand: "Riverbank",
          categoryId: "beer-cider",
          price: 89,
          stock: 60,
          lowStockThreshold: 12,
          description: "Crisp and refreshing lager. Six cans to share.",
          details: [
            { label: "ABV", value: "5%" },
            { label: "Volume", value: "6 x 330ml" },
          ],
        },
        now - 10000,
      ),
      product(
        {
          id: "craft-apple-cider",
          name: "Craft Apple Cider",
          brand: "Orchard Lane",
          categoryId: "beer-cider",
          price: 39,
          stock: 2,
          lowStockThreshold: 6,
          description: "Dry, crisp cider made from pressed apples.",
          details: [
            { label: "ABV", value: "4.5%" },
            { label: "Volume", value: "500ml" },
          ],
        },
        now - 11000,
      ),
    ],
  };
}
