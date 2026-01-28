import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Tag,
  Package,
  MapPin,
  Ticket,
  Users,
  Image,
  LogOut,
  ChevronLeft
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
  { to: '/admin/categories', icon: Tag, label: 'الفئات' },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/shipping-zones', icon: MapPin, label: 'مناطق الشحن' },
  { to: '/admin/coupons', icon: Ticket, label: 'الكوبونات' },
  { to: '/admin/users', icon: Users, label: 'المستخدمين' },
  { to: '/admin/hero', icon: Image, label: 'إعدادات الهيرو' },
];

const NavItem = ({ to, icon: Icon, label, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
      transition-all duration-200 outline-none
      focus-visible:ring-2 focus-visible:ring-brand-primary/30
      ${isActive 
        ? 'bg-gradient-to-l from-brand-primary/10 to-brand-primary/5 text-brand-accent border-r-2 border-brand-accent' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }
    `}
  >
    <span className={`
      flex items-center justify-center w-8 h-8 rounded-lg transition-colors
      ${isActive 
        ? 'bg-brand-primary/10 text-brand-accent' 
        : 'bg-slate-100/50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700'
      }
    `}>
      <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
    </span>
    <span className="flex-1">{label}</span>
    {isActive && (
      <ChevronLeft className="w-4 h-4 text-brand-accent/60" />
    )}
  </Link>
);

const AdminSidebar = ({ onNavigate, collapsed = false }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={!collapsed ? item.label : ''}
            isActive={isActive(item.to)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-slate-500 hover:bg-rose-50 hover:text-rose-600
            transition-all duration-200 outline-none
            focus-visible:ring-2 focus-visible:ring-rose-200
          "
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/50">
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </span>
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
