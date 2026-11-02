import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { addToCart, useCart } from "@/lib/cart";
import type { Product } from "@/lib/catalog";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  size?: ButtonProps["size"];
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  size,
  className,
}: AddToCartButtonProps) {
  const cart = useCart();
  const inCart =
    cart.find((line) => line.productId === product.id)?.quantity ?? 0;
  const canAdd = product.stock - inCart >= quantity;

  const handleClick = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={!canAdd}
      onClick={handleClick}
    >
      <ShoppingBag />
      Add to cart
    </Button>
  );
}
