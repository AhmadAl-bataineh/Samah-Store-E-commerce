import { useEffect } from 'react';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import { updatePageMeta } from '../utils/seo';

const TermsPage = () => {
  // SEO
  useEffect(() => {
    updatePageMeta({
      title: 'الشروط والأحكام',
      description: 'الشروط والأحكام لاستخدام متجر سماح ستور - حقوقك وواجباتك كمتسوق.',
      url: '/terms',
    });
  }, []);

  return (
    <div className="py-8">
      <Container>
        <SectionTitle>الشروط والأحكام</SectionTitle>

        <div className="card p-8 max-w-4xl mx-auto prose prose-lg">
          <p className="text-gray-600 mb-6">آخر تحديث: ديسمبر 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
            <p className="text-gray-700 leading-relaxed">
              مرحباً بك في متجر سماح. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">استخدام الموقع</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>يجب أن تكون بعمر 18 عاماً على الأقل لإجراء عمليات شراء</li>
              <li>يجب تقديم معلومات دقيقة وصحيحة عند التسجيل</li>
              <li>أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور</li>
              <li>يحظر استخدام الموقع لأي أغراض غير قانونية</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">الطلبات والدفع</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              عند تقديم طلب، فإنك تقدم عرضاً لشراء المنتجات. نحتفظ بالحق في قبول أو رفض أي طلب لأي سبب.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>جميع الأسعار بالدينار الأردني وشاملة للضرائب</li>
              <li>يجب إتمام الدفع قبل شحن الطلب</li>
              <li>نحتفظ بالحق في تعديل الأسعار دون إشعار مسبق</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">الشحن والتوصيل</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>مدة التوصيل المتوقعة: 2-5 أيام عمل</li>
              <li>رسوم الشحن تحدد حسب الموقع ووزن الطلب</li>
              <li>شحن مجاني للطلبات فوق 50 دينار</li>
              <li>لسنا مسؤولين عن التأخير الناتج عن قوة قاهرة</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">الإرجاع والاستبدال</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>يمكن إرجاع المنتجات خلال 14 يوماً من الاستلام</li>
              <li>يجب أن تكون المنتجات في حالتها الأصلية مع العلامات</li>
              <li>المنتجات المخفضة لا يمكن إرجاعها إلا في حالة العيب</li>
              <li>تكلفة الشحن للإرجاع يتحملها العميل ما لم يكن المنتج معيباً</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">الملكية الفكرية</h2>
            <p className="text-gray-700 leading-relaxed">
              جميع المحتويات والتصاميم والشعارات في الموقع محمية بحقوق الملكية الفكرية. يحظر استخدامها دون إذن كتابي مسبق.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">المسؤولية المحدودة</h2>
            <p className="text-gray-700 leading-relaxed">
              نبذل قصارى جهدنا لضمان دقة المعلومات، لكننا لا نضمن أن الموقع خالٍ من الأخطاء. لسنا مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الموقع.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">التعديلات</h2>
            <p className="text-gray-700 leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر التغييرات على هذه الصفحة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">القانون الساري</h2>
            <p className="text-gray-700 leading-relaxed">
              تخضع هذه الشروط لقوانين المملكة الأردنية الهاشمية، وتختص محاكم عمان بالنظر في أي نزاعات.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default TermsPage;

