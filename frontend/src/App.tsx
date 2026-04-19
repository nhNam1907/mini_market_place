import { Spin } from "antd";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import SellerLayout from "@/layouts/SellerLayout";
import UserLayout from "@/layouts/UserLayout";
import GuestOnlyRoute from "@/routes/GuestOnlyRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";

const HomePage = lazy(() => import("@/pages/store/HomePage"));
const CatalogPage = lazy(() => import("@/pages/store/CatalogPage"));
const ProductDetailPage = lazy(() => import("@/pages/store/ProductDetailPage"));
const PublicShopPage = lazy(() => import("@/pages/store/PublicShopPage"));
const AccountPage = lazy(() => import("@/pages/store/AccountPage"));
const CartPage = lazy(() => import("@/pages/store/CartPage"));
const OrdersPage = lazy(() => import("@/pages/store/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/pages/store/OrderDetailPage"));
const UserLoginPage = lazy(() => import("@/pages/auth/UserLoginPage"));
const UserRegisterPage = lazy(() => import("@/pages/auth/UserRegisterPage"));
const AdminLoginPage = lazy(() => import("@/pages/auth/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const SellerDashboardPage = lazy(() => import("@/pages/seller/SellerDashboardPage"));
const SellerProductsPage = lazy(() => import("@/pages/seller/SellerProductsPage"));
const SellerShopPage = lazy(() => import("@/pages/seller/SellerShopPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spin fullscreen size="large" />}>
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
                <Route element={<SellerShopPage />} path="shop" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
