import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, Wine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { type Category, useCatalog } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "transition-colors hover:text-primary",
    isActive ? "text-primary" : "text-muted-foreground",
  );

export function SiteHeader() {
  const cart = useCart();
  const { categories } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-gold">
            <Wine className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl font-semibold tracking-tight">
              Alfa
            </span>
            <span className="mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Trading Liquors
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="relative h-10 rounded-full px-4"
          >
            <Link to="/cart" aria-label={`Cart, ${itemCount} items`}>
              <ShoppingBag />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-bold leading-5 text-gold-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border/70 bg-background md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6">
            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 font-medium hover:bg-accent"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 font-medium hover:bg-accent"
            >
              All products
            </Link>
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
