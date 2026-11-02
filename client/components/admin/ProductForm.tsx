import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type Product,
  type ProductDetail,
  saveProduct,
  useCatalog,
} from "@/lib/catalog";
import { fileToDataUrl } from "@/lib/image";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

interface FormState {
  name: string;
  brand: string;
  categoryId: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  description: string;
  details: ProductDetail[];
  images: string[];
  featured: boolean;
  published: boolean;
}

function createInitialState(
  product: Product | undefined,
  defaultCategoryId: string,
): FormState {
  if (!product) {
    return {
      name: "",
      brand: "",
      categoryId: defaultCategoryId,
      price: "",
      stock: "0",
      lowStockThreshold: "5",
      description: "",
      details: [],
      images: [],
      featured: false,
      published: true,
    };
  }
  return {
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId,
    price: String(product.price),
    stock: String(product.stock),
    lowStockThreshold: String(product.lowStockThreshold),
    description: product.description,
    details: product.details.map((detail) => ({ ...detail })),
    images: [...product.images],
    featured: product.featured,
    published: product.published,
  };
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function ProductForm({
  product,
  onSaved,
}: {
  product?: Product;
  onSaved: () => void;
}) {
  const { categories } = useCatalog();
  const [form, setForm] = useState<FormState>(() =>
    createInitialState(product, categories[0]?.id ?? ""),
  );
  const [imageUrl, setImageUrl] = useState("");
  const [isReadingImages, setIsReadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addImages = (urls: string[]) => {
    setForm((current) => ({
      ...current,
      images: [...current.images, ...urls],
    }));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return current;
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setIsReadingImages(true);
    try {
      addImages(await Promise.all(files.map(fileToDataUrl)));
    } catch {
      setError(
        "One of those files could not be read. Use JPG, PNG, or WebP images.",
      );
    } finally {
      setIsReadingImages(false);
    }
  };

  const addImageLink = () => {
    const url = imageUrl.trim();
    if (!isHttpsUrl(url)) {
      setError("Image links must start with https://");
      return;
    }
    addImages([url]);
    setImageUrl("");
    setError(null);
  };

  const updateDetail = (
    index: number,
    field: keyof ProductDetail,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      details: current.details.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: value } : detail,
      ),
    }));
  };

  const addDetail = () => {
    setForm((current) => ({
      ...current,
      details: [...current.details, { label: "", value: "" }],
    }));
  };

  const removeDetail = (index: number) => {
    setForm((current) => ({
      ...current,
      details: current.details.filter(
        (_, detailIndex) => detailIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const lowStockThreshold = Number(form.lowStockThreshold);

    if (!form.name.trim()) {
      setError("Enter a product name.");
      return;
    }
    if (!form.categoryId) {
      setError(
        "Choose a category. Add one under Categories first if you need to.",
      );
      return;
    }
    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number, 0 or more.");
      return;
    }
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
      setError("The low stock alert must be a whole number, 0 or more.");
      return;
    }

    setIsSaving(true);
    try {
      await saveProduct({
        id: product?.id,
        name: form.name.trim(),
        brand: form.brand.trim(),
        categoryId: form.categoryId,
        price: Math.round(price * 100) / 100,
        stock,
        lowStockThreshold,
        description: form.description.trim(),
        details: form.details
          .map((detail) => ({
            label: detail.label.trim(),
            value: detail.value.trim(),
          }))
          .filter((detail) => detail.label && detail.value),
        images: form.images,
        featured: form.featured,
        published: form.published,
      });
      toast.success(product ? "Product updated" : "Product added");
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the product.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product-name">Product name</Label>
          <Input
            id="product-name"
            value={form.name}
            placeholder="e.g. Single Malt 12 Year"
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-brand">Brand</Label>
          <Input
            id="product-brand"
            value={form.brand}
            onChange={(event) => updateField("brand", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          <select
            id="product-category"
            className={selectClassName}
            value={form.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
          >
            {categories.length === 0 && (
              <option value="">No categories yet</option>
            )}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price">Price (ZAR)</Label>
          <Input
            id="product-price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-stock">Units in stock</Label>
            <Input
              id="product-stock"
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) => updateField("stock", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-threshold">Low stock at</Label>
            <Input
              id="product-threshold"
              type="number"
              min={0}
              step={1}
              value={form.lowStockThreshold}
              onChange={(event) =>
                updateField("lowStockThreshold", event.target.value)
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 sm:col-span-1">
          <Label htmlFor="product-featured" className="cursor-pointer">
            Featured on home page
          </Label>
          <Switch
            id="product-featured"
            checked={form.featured}
            onCheckedChange={(checked) => updateField("featured", checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 sm:col-span-1">
          <Label htmlFor="product-published" className="cursor-pointer">
            Visible in shop
          </Label>
          <Switch
            id="product-published"
            checked={form.published}
            onCheckedChange={(checked) => updateField("published", checked)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea
            id="product-description"
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-semibold">Product details</h3>
            <p className="text-xs text-muted-foreground">
              Shown on the product page, for example ABV, volume, or origin.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addDetail}>
            <Plus />
            Add detail
          </Button>
        </div>
        {form.details.map((detail, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              aria-label="Detail label"
              placeholder="Label, e.g. ABV"
              value={detail.label}
              onChange={(event) =>
                updateDetail(index, "label", event.target.value)
              }
            />
            <Input
              aria-label="Detail value"
              placeholder="Value, e.g. 40%"
              value={detail.value}
              onChange={(event) =>
                updateDetail(index, "value", event.target.value)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove detail"
              onClick={() => removeDetail(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-semibold">Images</h3>
            <p className="text-xs text-muted-foreground">
              The first image is the main photo. Add as many as you need.
            </p>
          </div>
        </div>

        {form.images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.images.map((src, index) => (
              <li
                key={index}
                className="relative overflow-hidden rounded-lg border border-border bg-muted"
              >
                <img
                  src={src}
                  alt={`Product image ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Main
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/90 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Move image ${index + 1} earlier`}
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => removeImage(index)}
                  >
                    <X />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Move image ${index + 1} later`}
                    disabled={index === form.images.length - 1}
                    onClick={() => moveImage(index, 1)}
                  >
                    <ArrowRight />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-6 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <ImagePlus className="size-4" />
            {isReadingImages ? "Processing images…" : "Upload images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={isReadingImages}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                void handleFiles(files);
              }}
            />
          </label>
          <div className="flex gap-2">
            <Input
              aria-label="Image link"
              placeholder="https://… image link"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <Button type="button" variant="outline" onClick={addImageLink}>
              Add link
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isReadingImages || isSaving}>
          {product ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}

export function ProductFormDialog({
  product,
  trigger,
}: {
  product?: Product;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {product ? `Edit ${product.name}` : "Add a product"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm product={product} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
