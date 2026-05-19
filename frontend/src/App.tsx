import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import SellerLayout from "@/layouts/SellerLayout";
import UserLayout from "@/layouts/UserLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import UserLoginPage from "@/pages/auth/UserLoginPage";
import UserRegisterPage from "@/pages/auth/UserRegisterPage";
import SellerDashboardPage from "@/pages/seller/SellerDashboardPage";
import SellerOrderDetailPage from "@/pages/seller/SellerOrderDetailPage";
import SellerOrdersPage from "@/pages/seller/SellerOrdersPage";
import SellerProductCreatePage from "@/pages/seller/SellerProductCreatePage";
import SellerProductDetailPage from "@/pages/seller/SellerProductDetailPage";
import SellerProductEditPage from "@/pages/seller/SellerProductEditPage";
import SellerProductsPage from "@/pages/seller/SellerProductsPage";
import SellerShopPage from "@/pages/seller/SellerShopPage";
import AccountPage from "@/pages/store/AccountPage";
import CartPage from "@/pages/store/CartPage";
import CatalogPage from "@/pages/store/CatalogPage";
import HomePage from "@/pages/store/HomePage";
import OrderDetailPage from "@/pages/store/OrderDetailPage";
import OrdersPage from "@/pages/store/OrdersPage";
import ProductDetailPage from "@/pages/store/ProductDetailPage";
import PublicShopPage from "@/pages/store/PublicShopPage";
import GuestOnlyRoute from "@/routes/GuestOnlyRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<CatalogPage />} path="catalog" />
          <Route element={<ProductDetailPage />} path="products/:id" />
          <Route element={<PublicShopPage />} path="shops/:shopId" />
          <Route element={<GuestOnlyRoute />}>
            <Route element={<UserLoginPage />} path="login" />
            <Route element={<UserRegisterPage />} path="register" />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={["USER"]} redirectTo="/" />}>
              <Route element={<AccountPage />} path="account" />
              <Route element={<CartPage />} path="cart" />
              <Route element={<OrdersPage />} path="orders" />
              <Route element={<OrderDetailPage />} path="orders/:orderId" />
            </Route>
          </Route>
        </Route>

        <Route element={<GuestOnlyRoute allowedRole="ADMIN" fallbackTo="/" />}>
          <Route element={<AdminLoginPage />} path="/admin/login" />
        </Route>

        <Route element={<ProtectedRoute redirectTo="/admin/login" />}>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} redirectTo="/" />}>
            <Route element={<AdminLayout />} path="/admin">
              <Route element={<AdminDashboardPage />} index />
              <Route element={<AdminProductsPage />} path="products" />
              <Route element={<AdminOrdersPage />} path="orders" />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute redirectTo="/login" />}>
          <Route element={<RoleRoute allowedRoles={["SELLER"]} redirectTo="/" />}>
            <Route element={<SellerLayout />} path="/seller">
              <Route element={<SellerDashboardPage />} index />
              <Route element={<SellerProductsPage />} path="products" />
              <Route element={<SellerProductCreatePage />} path="products/new" />
              <Route element={<SellerProductEditPage />} path="products/:productId/edit" />
              <Route element={<SellerProductDetailPage />} path="products/:productId" />
              <Route element={<SellerOrdersPage />} path="orders" />
              <Route element={<SellerOrderDetailPage />} path="orders/:orderId" />
              <Route element={<SellerShopPage />} path="shop" />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
