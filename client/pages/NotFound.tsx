import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="font-serif text-7xl text-primary/80">404</p>
      <h1 className="mt-4 font-serif text-3xl">We couldn't find that page</h1>
      <p className="mt-3 text-muted-foreground">It may have moved, or the link may be out of date.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/shop">Browse the shop</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
