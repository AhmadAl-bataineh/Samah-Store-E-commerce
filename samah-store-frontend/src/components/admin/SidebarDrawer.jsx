import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';

const SidebarDrawer = ({ open, onClose, children, fromRight = true }) => {
  const location = useLocation();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Close drawer when route changes (safety) and restore body scroll
  useEffect(() => {
    if (open) {
      // when route changes while drawer open, close it
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    // prevent body scroll when drawer is open
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => {
      document.body.style.overflow = original || '';
    };
  }, [open]);

  // Render but control visibility/interaction via classes so we get an actual slide animation
  return (
    <>
      {/* Backdrop: visible/clickable only when open */}
      <div
        className={`
          fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden 
          transition-opacity duration-300 
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Panel: translate on X axis. When closed, move fully out of view; when open translate-x-0 */}
      <aside
        className={`
          fixed inset-y-0 ${fromRight ? 'right-0' : 'left-0'} z-50 
          w-80 max-w-[85vw] 
          bg-white shadow-2xl
          lg:hidden 
          transform transition-transform duration-300 ease-out
          ${open 
            ? 'translate-x-0 pointer-events-auto' 
            : (fromRight ? 'translate-x-full pointer-events-none' : '-translate-x-full pointer-events-none')
          }
        `}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">سماح</div>
                <div className="text-xs text-slate-500">لوحة الإدارة</div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="
                p-2 -m-2 text-slate-400 hover:text-slate-600
                rounded-lg hover:bg-slate-100
                transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30
              "
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {children}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400 text-center">
              متجر سماح © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarDrawer;
