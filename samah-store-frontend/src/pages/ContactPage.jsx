import { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  // SEO
  useEffect(() => {
    updatePageMeta({
      title: 'تواصل معنا',
      description: 'تواصلي مع فريق سماح ستور - نحن هنا للمساعدة. راسلينا عبر البريد الإلكتروني أو الهاتف أو نموذج التواصل.',
      url: '/contact',
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Frontend-only form
    setTimeout(() => {
      success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="py-8">
      <Container>
        <SectionTitle subtitle="نحن هنا للمساعدة">تواصل معنا</SectionTitle>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card p-8">
            <h3 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="الاسم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="الموضوع"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <div>
                <label className="block text-dark font-semibold mb-2">الرسالة</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="6"
                  className="input-field"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <div className="card p-8 mb-6">
              <h3 className="text-2xl font-bold mb-6">معلومات الاتصال</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">الهاتف</h4>
                    <p className="text-gray-700">
                      <a
                        href="tel:+962785524816"
                        style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}
                        className="tabular-nums tracking-[0.06em] inline-block"
                      >
                        +962 785 524 816
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">البريد الإلكتروني</h4>
                    <p className="text-gray-700">info@samah-store.tech</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">العنوان</h4>
                    <p className="text-gray-700">عمان، الأردن</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              <h3 className="text-2xl font-bold mb-4">ساعات العمل</h3>
              <div className="space-y-2">
                <p>السبت - الخميس: 9:00 صباحاً - 9:00 مساءً</p>
                <p>الجمعة: 2:00 ظهراً - 9:00 مساءً</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;

