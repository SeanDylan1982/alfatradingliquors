import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, Tags } from "lucide-react";
import { StockStatus } from "@/components/store/StockStatus";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStockStatus, useCatalog } from "@/lib/catalog";

function StatCard({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-4xl tabular-nums">{value}</p>
      {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { categories, products } = useCatalog();

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const stats = useMemo(() => {
    const visible = products.filter((product) => product.published).length;
    const unitsInStock = products.reduce((total, product) => total + product.stock, 0);
    const lowStock = products.filter((product) => getStockStatus(product) === "low").length;
    const outOfStock = products.filter((product) => getStockStatus(product) === "out").length;
    return { visible, unitsInStock, lowStock, outOfStock };
  }, [products]);

  const needsAttention = useMemo(
    () =>
      products
        .filter((product) => getStockStatus(product) !== "ok")
        .sort((a, b) => a.stock - b.stock),
    [products],
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <h1 className="mt-2 font-serif text-4xl">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/admin/products">
              <Package />
              Manage products
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-card">
            <Link to="/admin/categories">
              <Tags />
              Manage categories
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products.length} detail={`${stats.visible} visible in the shop`} />
        <StatCard label="Categories" value={categories.length} />
        <StatCard label="Units in stock" value={stats.unitsInStock} />
        <StatCard
          label="Needs attention"
          value={needsAttention.length}
          detail={`${stats.lowStock} low stock · ${stats.outOfStock} out of stock`}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">Inventory alerts</h2>
            <p className="text-sm text-muted-foreground">Products that are low or out of stock.</p>
          </div>
          <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            All products
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {needsAttention.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsAttention.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {categoryById.get(product.categoryId)?.name ?? "Uncategorised"}
                    </TableCell>
                    <TableCell>
                      <StockStatus product={product} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/products">Restock</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Every product is comfortably stocked.
          </div>
        )}
      </section>
    </div>
  );
}
