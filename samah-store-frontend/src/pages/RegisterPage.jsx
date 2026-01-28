import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import Container from '../components/layout/Container';
import { normalizeRole, ROLES } from '../utils/roleUtils';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    // ✅ Phone validation (no country UI, accept local digits OR +international)
    const phone = (formData.phone || '').trim();

    if (!phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else {
      // Accept:
      // 1) digits only: 6-15
      // 2) international: + then 7-16 digits
      const digitsOnlyOk = /^[0-9]{6,15}$/.test(phone);
      const intlOk = /^\+[0-9]{7,16}$/.test(phone);

      if (!digitsOnlyOk && !intlOk) {
        newErrors.phone = 'رقم الهاتف غير صالح';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await register(
          formData.username,
          formData.email,
          formData.password,
          formData.phone
      );

      success('تم إنشاء الحساب بنجاح');

      const role = normalizeRole(response.user?.role);

      // Both ADMIN and EMPLOYEE go to admin dashboard
      let targetRoute = '/';
      if (role === ROLES.ADMIN || role === ROLES.EMPLOYEE) {
        targetRoute = '/admin/dashboard';
      }

      navigate(targetRoute, { replace: true });
    } catch (err) {
      error('فشل في إنشاء الحساب. جرب مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Container className="py-16">
        <div className="max-w-md mx-auto card p-8">
          <h1 className="text-3xl font-bold text-center mb-8">إنشاء حساب جديد</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="اسم المستخدم"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
                required

            />

            <Input
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
            />

            {/* ✅ Phone field - Native input (no flags, no +962, no dropdown) */}
            <div className="w-full">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                رقم الهاتف
              </label>

              <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="رقم الهاتف"
                  required
                  className={`
                w-full px-4 py-3
                bg-white
                border transition-all duration-200
                text-sm text-charcoal-800
                placeholder:text-charcoal-400
                focus:outline-none focus:ring-2 focus:ring-rose-100
                disabled:opacity-50 disabled:cursor-not-allowed
                rounded-lg
                ${errors.phone ? 'border-berry-300 focus:border-berry-400' : 'border-charcoal-200 focus:border-rose-300'}
              `}
                  dir="ltr"
                  inputMode="tel"
              />

              {errors.phone && (
                  <p className="text-berry-500 text-xs mt-1.5">{errors.phone}</p>
              )}
            </div>

            <Input
                label="كلمة المرور"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
            />

            <Input
                label="تأكيد كلمة المرور"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'جاري الإنشاء...' : 'تسجيل'}
            </Button>
          </form>

          <p className="text-center mt-6">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-brand-primary font-semibold hover:underline">
              سجل دخول
            </Link>
          </p>
        </div>
      </Container>
  );
};

export default RegisterPage;
