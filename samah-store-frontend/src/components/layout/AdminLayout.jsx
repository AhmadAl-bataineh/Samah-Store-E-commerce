import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminTopBar from '../../components/admin/AdminTopBar';
import SidebarDrawer from '../../components/admin/SidebarDrawer';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useState, useEffect } from 'react';
import { PanelRightClose, PanelRightOpen, LogOut, User } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth <= 1280) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth > 1280) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50" dir="rtl">
      {/* Mobile TopBar - Only visible on mobile/tablet */}
      <AdminTopBar title="لوحة الإدارة" onOpenDrawer={openDrawer} />

      {/* Desktop Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 hidden lg:block sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title & Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelRightOpen className="w-5 h-5" />
                ) : (
                  <PanelRightClose className="w-5 h-5" />
                )}
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">لوحة الإدارة</h1>
                <p className="text-xs text-slate-500">إدارة متجر سماح</p>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{user?.username || 'المدير'}</span>
              </div>
              <button
                onClick={logout}
                className="
                  flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-slate-500 hover:text-rose-600 hover:bg-rose-50
                  rounded-lg transition-all duration-200
                "
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <SidebarDrawer open={drawerOpen} onClose={closeDrawer} fromRight={true}>
        <AdminSidebar onNavigate={closeDrawer} />
      </SidebarDrawer>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Desktop Sidebar */}
          <aside
            className={`
              hidden lg:flex flex-col flex-shrink-0
              sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto
              bg-white/60 backdrop-blur-sm border-l border-slate-200/60
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? 'w-20 px-3 py-6' : 'w-64 px-4 py-6'}
            `}
          >
            <AdminSidebar collapsed={sidebarCollapsed} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Content wrapper with max-width for ultrawide + consistent padding */}
            <div className="
              w-full max-w-[1400px] mx-auto
              px-4 py-6
              sm:px-6 sm:py-8
              lg:px-8 lg:py-8
              pb-24 sm:pb-8
            ">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
