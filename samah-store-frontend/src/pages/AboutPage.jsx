import { useEffect } from 'react';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import { Heart, Target, Award } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

const AboutPage = () => {
  // SEO
  useEffect(() => {
    updatePageMeta({
      title: 'من نحن',
      description: 'تعرفي على سماح ستور - متجر أزياء نسائية عصرية في الأردن. نقدم أفضل المنتجات بجودة عالية وأسعار مناسبة مع توصيل سريع.',
      url: '/about',
    });
  }, []);

  return (
    <div className="py-8">
      <Container>
        <SectionTitle subtitle="تعرفي علينا أكثر">من نحن</SectionTitle>

        <div className="prose prose-lg max-w-none">
          <div className="card p-8 mb-8">
            <p className="text-xl leading-relaxed text-gray-700 mb-6">
              متجر سماح هو وجهتك المثالية للأزياء العصرية والأنيقة. نحن نؤمن بأن كل امرأة تستحق أن تشعر بالجمال والثقة،
              ولذلك نقدم لك مجموعة مختارة بعناية من أفضل المنتجات بجودة عالية وأسعار مناسبة.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              منذ انطلاقنا، كان هدفنا تقديم تجربة تسوق استثنائية تجمع بين الجودة والأناقة والراحة.
              نحن نعمل باستمرار على تحديث مجموعتنا لنواكب أحدث صيحات الموضة ونلبي جميع أذواقكم.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">شغف الموضة</h3>
              <p className="text-gray-600">
                نحن متحمسون لتقديم أفضل قطع الأزياء التي تعكس شخصيتك وأسلوبك الفريد
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">الجودة أولاً</h3>
              <p className="text-gray-600">
                نختار منتجاتنا بعناية فائقة لنضمن حصولك على أفضل جودة وأعلى معايير التصنيع
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">رضاك هدفنا</h3>
              <p className="text-gray-600">
                سعادتك ورضاك هما أولويتنا، ونسعى دائماً لتقديم تجربة تسوق مميزة
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;

