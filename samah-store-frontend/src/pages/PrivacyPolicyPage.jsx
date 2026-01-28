import { useEffect } from 'react';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import { updatePageMeta } from '../utils/seo';

const PrivacyPolicyPage = () => {
  // SEO
  useEffect(() => {
    updatePageMeta({
      title: 'سياسة الخصوصية',
      description: 'سياسة الخصوصية لمتجر سماح ستور - كيف نحمي بياناتك الشخصية ونستخدمها.',
      url: '/privacy',
    });
  }, []);

  return (
    <div className="py-8">
      <Container>
        <SectionTitle>سياسة الخصوصية</SectionTitle>

        <div className="card p-8 max-w-4xl mx-auto prose prose-lg">
          <p className="text-gray-600 mb-6">آخر تحديث: ديسمبر 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
            <p className="text-gray-700 leading-relaxed">
              نحن في متجر سماح نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقعنا.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">المعلومات التي نجمعها</h2>
            <p className="text-gray-700 leading-relaxed mb-4">نقوم بجمع المعلومات التالية:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، العنوان</li>
              <li>معلومات الطلبات: تفاصيل المشتريات وسجل الطلبات</li>
              <li>المعلومات التقنية: عنوان IP، نوع المتصفح، وقت الزيارة</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>معالجة وإتمام طلباتك</li>
              <li>التواصل معك بخصوص طلباتك والعروض</li>
              <li>تحسين خدماتنا وتجربة المستخدم</li>
              <li>حماية الموقع من الاحتيال والأنشطة غير القانونية</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">حماية البيانات</h2>
            <p className="text-gray-700 leading-relaxed">
              نستخدم تقنيات التشفير المتقدمة والإجراءات الأمنية لحماية معلوماتك الشخصية. لا نشارك بياناتك مع أطراف ثالثة إلا لإتمام الطلبات أو وفقاً للقانون.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-gray-700 leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">حقوقك</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>الوصول إلى بياناتك الشخصية ومراجعتها</li>
              <li>طلب تصحيح أو حذف بياناتك</li>
              <li>إلغاء الاشتراك في النشرات البريدية</li>
              <li>تقديم شكوى لدى السلطات المختصة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-gray-700 leading-relaxed">
              إذا كان لديك أي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا على: info@samahstore.com
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicyPage;

