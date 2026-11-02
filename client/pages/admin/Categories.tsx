import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory, useCatalog } from "@/lib/catalog";
import { showError } from "@/lib/errors";

export default function AdminCategories() {
  const { categories, products } = useCatalog();

  const productCount = (categoryId: string) =>
    products.filter((product) => product.categoryId === categoryId).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Catalogue
          </p>
          <h1 className="mt-2 font-serif text-4xl">Categories</h1>
          <p className="mt-2 text-muted-foreground">
            Group products into sections of the shop.
          </p>
        </div>
        <CategoryFormDialog
          trigger={
            <Button size="lg">
              <Plus />
              Add category
            </Button>
          }
        />
      </div>

      {categories.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const count = productCount(category.id);
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="max-w-md text-muted-foreground">
                      {category.description}
                    </TableCell>
                    <TableCell className="tabular-nums">{count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <CategoryFormDialog
                          category={category}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${category.name}`}
                            >
                              <Pencil />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={count > 0}
                              title={
                                count > 0
                                  ? "Move or delete its products first"
                                  : undefined
                              }
                              aria-label={`Delete ${category.name}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 />
                            </Button>
                          }
                          title={`Delete ${category.name}?`}
                          description="This category will be removed. This can't be undone."
                          confirmLabel="Delete category"
                          onConfirm={() =>
                            deleteCategory(category.id).catch(showError)
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          No categories yet. Add one to start organising products.
        </div>
      )}
    </div>
  );
}
