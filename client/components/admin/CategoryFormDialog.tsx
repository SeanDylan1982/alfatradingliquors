import { useState, type FormEvent, type ReactNode } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { type Category, saveCategory } from "@/lib/catalog";

function CategoryForm({ category, onSaved }: { category?: Category; onSaved: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    saveCategory({ id: category?.id, name, description });
    toast.success(category ? "Category updated" : "Category added");
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          value={name}
          placeholder="e.g. Whisky"
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-description">Description</Label>
        <Textarea
          id="category-description"
          rows={3}
          value={description}
          placeholder="A short line shown on the home page"
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">{category ? "Save changes" : "Add category"}</Button>
      </div>
    </form>
  );
}

export function CategoryFormDialog({ category, trigger }: { category?: Category; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? `Edit ${category.name}` : "Add a category"}</DialogTitle>
        </DialogHeader>
        <CategoryForm category={category} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
