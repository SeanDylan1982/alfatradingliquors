import { useMemo, useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductImage } from "@/components/store/ProductImage";
import { StockStatus } from "@/components/store/StockStatus";
import { StockControl } from "@/components/admin/StockControl";
import { ProductFormDialog } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteProduct, updateProduct, useCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AdminProducts() {
  const { categories, products } = useCatalog();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (categoryFilter !== "all" && product.categoryId !== categoryFilter) return false;
        if (!term) return true;
        return [product.name, product.brand].some((field) => field.toLowerCase().includes(term));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query, categoryFilter]);

  const visibleCount = products.filter((product) => product.published).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl">Products</h1>
          <p className="mt-2 text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"} · {visibleCount} visible in the shop
          </p>
        </div>
        <ProductFormDialog
          trigger={
            <Button size="lg">
              <Plus />
              Add product
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          aria-label="Search products"
          placeholder="Search by name or brand"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="bg-card sm:w-72"
        />
        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className={selectClassName}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <ProductImage product={product} className="h-full w-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand || "No brand"} · {product.images.length}{" "}
                          {product.images.length === 1 ? "image" : "images"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categoryById.get(product.categoryId)?.name ?? "Uncategorised"}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <StockControl product={product} />
                      <StockStatus product={product} className="text-xs" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant={product.featured ? "secondary" : "ghost"}
                      size="sm"
                      aria-pressed={product.featured}
                      onClick={() => updateProduct(product.id, { featured: !product.featured })}
                    >
                      <Star className={cn("size-4", product.featured && "fill-gold text-gold")} />
                      {product.featured ? "Featured" : "Feature"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.published}
                      aria-label={`Visible in shop: ${product.name}`}
                      onCheckedChange={(checked) => updateProduct(product.id, { published: checked })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ProductFormDialog
                        product={product}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`}>
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${product.name}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        }
                        title={`Delete ${product.name}?`}
                        description="This product will be removed from the shop and any carts. This can't be undone."
                        confirmLabel="Delete product"
                        onConfirm={() => deleteProduct(product.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          {products.length === 0 ? "No products yet. Add your first bottle to get started." : "No products match your filters."}
        </div>
      )}
    </div>
  );
}
