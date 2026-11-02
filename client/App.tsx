import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { CatalogGate } from "@/components/CatalogGate";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";

const App = () => (
  <BrowserRouter>
    <Toaster />
    <CatalogGate>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Index />} />
          <Route path="shop" element={<Shop />} />
          <Route path="products/:productId" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CatalogGate>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
