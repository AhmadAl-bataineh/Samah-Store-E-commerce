import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForbiddenPage = () => {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/';
    // Both ADMIN and EMPLOYEE go to admin dashboard
    if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-primary mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">غير مصرح بالوصول</h2>
        <p className="text-gray-600 mb-8">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        <Link
          to={getHomeLink()}
          className="px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover transition inline-block"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;

