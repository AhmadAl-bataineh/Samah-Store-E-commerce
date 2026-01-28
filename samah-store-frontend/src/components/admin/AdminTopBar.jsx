import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

// Page title mapping for breadcrumb
const pageTitles = {
  '/admin/dashboard': 'لوحة التحكم',
  '/admin/orders': 'الطلبات',
  '/admin/categories': 'الفئات',
  '/admin/products': 'المنتجات',
  '/admin/shipping-zones': 'مناطق الشحن',
  '/admin/coupons': 'الكوبونات',
  '/admin/users': 'المستخدمين',
  '/admin/hero': 'إعدادات الهيرو',
};

const AdminTopBar = ({ title = 'لوحة الإدارة', onOpenDrawer }) => {
  const location = useLocation();
  const currentPageTitle = pageTitles[location.pathname] || title;
  const isSubPage = location.pathname !== '/admin/dashboard';

  return (
    <header className="
      w-full bg-white/95 backdrop-blur-sm
      border-b border-slate-200/60
      sticky top-0 z-50
      lg:hidden
      safe-area-top
    ">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            aria-label="Open navigation"
            onClick={onOpenDrawer}
            className="
              flex-shrink-0 p-2 -m-2
              text-slate-600 hover:text-slate-900
              rounded-lg hover:bg-slate-100/80
              transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30
            "
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {isSubPage && (
              <Link
                to="/admin/dashboard"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {currentPageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Could add notifications/quick actions here */}
        <div className="flex items-center gap-2">
          {/* Placeholder for future features like notifications */}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
