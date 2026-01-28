import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';

// Public pages
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import FAQPage from '../pages/FAQPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsPage from '../pages/TermsPage';

// Customer pages
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';

// Admin pages (now used by both ADMIN and EMPLOYEE roles)
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminShippingZones from '../pages/admin/AdminShippingZones';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminHeroSettings from '../pages/admin/AdminHeroSettings';

// 403 Page
import ForbiddenPage from '../pages/ForbiddenPage';

import ProtectedRoute from './ProtectedRoute';

// Allowed roles for admin dashboard (EMPLOYEE now has same access as ADMIN)
const ADMIN_ROLES = ['ADMIN', 'EMPLOYEE'];

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  // Redirect authenticated users from home/login based on role
  // Both ADMIN and EMPLOYEE now go to admin dashboard
  const getDefaultRoute = () => {
    if (!user) return null;
    if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') return '/admin/dashboard';
    return '/';
  };

  const defaultRoute = getDefaultRoute();

  return (
    <Routes>
      {/* Public routes with Header/Footer */}
      <Route element={<PublicLayout />}>
        {/* Redirect authenticated admin/employee from public pages */}
        <Route
          path="/"
          element={defaultRoute && (user.role === 'ADMIN' || user.role === 'EMPLOYEE') ? <Navigate to={defaultRoute} replace /> : <HomePage />}
        />
        <Route
          path="/login"
          element={defaultRoute ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public pages */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />

        {/* Static pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Customer routes (protected but still show header/footer) */}
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />

        {/* Error pages */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin routes - now accessible by both ADMIN and EMPLOYEE roles */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/shipping-zones" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminShippingZones /></ProtectedRoute>} />
      <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminCoupons /></ProtectedRoute>} />
      <Route path="/admin/hero" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminHeroSettings /></ProtectedRoute>} />

      {/* Legacy employee routes - redirect to admin dashboard for backward compatibility */}
      <Route path="/employee/*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

