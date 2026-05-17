import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from './services/auth';
import { 
  LogOut,
  Search, 
  User, 
  UserIcon, 
  ShoppingCart, 
  ChevronDown, 
  Menu,
  Settings,
  Store,
  Facebook,
  Twitter,
  Instagram,
  Loader2
} from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Companies from './pages/admin/Companies';
import ProductsAdmin from './pages/admin/Products';
import CategoriesAdmin from './pages/admin/Categories';
import OrdersAdmin from './pages/admin/Orders';
import BannerAdmin from './pages/admin/Banners';
import StoreAdminLayout from './components/admin/StoreAdminLayout';
import StoreDashboard from './pages/admin/StoreDashboard';
import StoreCustomers from './pages/admin/StoreCustomers';
import StoreReports from './pages/admin/StoreReports';
import AdminCustomers from './pages/admin/Customers';
import { CartProvider, useCart } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import SearchResults from './pages/SearchResults';
import { useDebounce } from './hooks/useDebounce';
import { searchService } from './services/search';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PublicLayout from './layouts/PublicLayout';
import Favorites from './pages/Favorites';
import AdminSettings from './pages/admin/Settings';
import StoreSettings from './pages/admin/StoreSettings';

// Páginas de Help e Footer
import Help from './pages/Help';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';
import HowItWorks from './pages/HowItWorks';
import Fees from './pages/Fees';
import HowToBuy from './pages/HowToBuy';
import PaymentMethods from './pages/PaymentMethods';
import ShippingPolicy from './pages/ShippingPolicy';
import TrackOrder from './pages/TrackOrder';
import Security from './pages/Security';

// Páginas de NotFound e outras
import NotFound from './pages/NotFound';
import CategoryProducts from './pages/CategoryProducts';
import CompanyRegister from './pages/CompanyRegister';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop /> 
        <div className="min-h-screen bg-white font-sans selection:bg-primary selection:text-white">
          <Routes>
            {/* Rotas Públicas */}
            <Route element={<PublicLayout />}>
              {/* Páginas principais */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/category/:categorySlug" element={<CategoryProducts />} />
              <Route path="/company/register" element={<CompanyRegister />} />
              
              {/* Páginas de Ajuda - Central de Ajuda */}
              <Route path="/help" element={<Help />} />
              <Route path="/help/como-comprar" element={<HowToBuy />} />
              <Route path="/help/pagamentos" element={<PaymentMethods />} />
              <Route path="/help/envio" element={<ShippingPolicy />} />
              <Route path="/help/rastrear" element={<TrackOrder />} />
              <Route path="/help/seguranca" element={<Security />} />
              <Route path="/help/protecao" element={<Security />} />
              
              {/* Páginas de Ajuda - Para Vendedores */}
              <Route path="/help/vender" element={<HowItWorks />} />
              <Route path="/help/taxas" element={<Fees />} />
              <Route path="/help/devolucoes" element={<Returns />} />
              <Route path="/help/faq" element={<Help />} />
              <Route path="/help/suporte" element={<Contact />} />
              
              {/* Páginas Legais */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            
            {/* Admin Routes - Apenas Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="companies" element={<Companies />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="banners" element={<BannerAdmin/>} />
              <Route path="admins" element={<div className="p-4 sm:p-8">Gestão de Administradores (Em breve)</div>} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Store Admin Routes - Apenas Empresas */}
            <Route 
              path="/store-admin" 
              element={
                <ProtectedRoute requireCompany={true}>
                  <StoreAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StoreDashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="customers" element={<StoreCustomers />} />
              <Route path="reports" element={<StoreReports />} />
              <Route path="settings" element={<StoreSettings />} />
            </Route>

            {/* Rotas para Clientes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />

            {/* 404 - Página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}