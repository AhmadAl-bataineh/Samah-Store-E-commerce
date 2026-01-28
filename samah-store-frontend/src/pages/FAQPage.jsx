import { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import { ChevronDown } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  // SEO
  useEffect(() => {
    updatePageMeta({
      title: 'الأسئلة الشائعة',
      description: 'إجابات على الأسئلة الشائعة حول التسوق في سماح ستور - الشحن، الدفع، الإرجاع والاستبدال.',
      url: '/faq',
    });
  }, []);

  const faqs = [
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'بعد إتمام الطلب، ستحصلين على رمز تتبع يمكنك استخدامه لمتابعة حالة شحنتك. يمكنك أيضاً متابعة طلباتك من خلال صفحة "طلباتي" في حسابك.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نوفر عدة طرق للدفع تشمل: الدفع عند الاستلام، بطاقات الائتمان، والتحويل البنكي. جميع المعاملات آمنة ومشفرة.'
    },
    {
      question: 'ما هي سياسة الإرجاع والاستبدال؟',
      answer: 'يمكنك إرجاع أو استبدال المنتجات خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية مع العلامات والأوسمة.'
    },
    {
      question: 'كم تستغرق مدة التوصيل؟',
      answer: 'عادةً يتم التوصيل خلال 2-5 أيام عمل داخل الأردن. قد تختلف المدة حسب الموقع الجغرافي.'
    },
    {
      question: 'هل الشحن مجاني؟',
      answer: 'نعم، نوفر شحن مجاني للطلبات التي تزيد عن 50 دينار أردني. للطلبات الأقل من ذلك، يتم احتساب رسوم شحن بسيطة.'
    },
    {
      question: 'كيف يمكنني تغيير أو إلغاء طلبي؟',
      answer: 'يمكنك تعديل أو إلغاء طلبك خلال 24 ساعة من تقديمه. بعد ذلك، يرجى التواصل مع خدمة العملاء للمساعدة.'
    },
    {
      question: 'هل المقاسات دقيقة؟',
      answer: 'نحرص على توفير جدول مقاسات دقيق لكل منتج. ننصح بمراجعة جدول المقاسات قبل الشراء. في حال عدم ملاءمة المقاس، يمكنك استبداله بسهولة.'
    },
    {
      question: 'كيف يمكنني التواصل مع خدمة العملاء؟',
      answer: 'يمكنك التواصل معنا عبر الهاتف أو البريد الإلكتروني أو من خلال نموذج الاتصال في الموقع. فريقنا متواجد للرد على استفساراتك.'
    }
  ];

  return (
    <div className="py-8">
      <Container>
        <SectionTitle subtitle="إجابات على أسئلتك الشائعة">الأسئلة الشائعة</SectionTitle>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex justify-between items-center text-right hover:bg-light transition-colors"
              >
                <h3 className="text-lg font-bold flex-1">{faq.question}</h3>
                <ChevronDown
                  className={`w-6 h-6 text-primary transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default FAQPage;

