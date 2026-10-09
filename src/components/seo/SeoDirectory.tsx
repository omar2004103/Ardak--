import React from 'react';
import { SearchFilters } from '../../types/listing.ts';
import { MapPin, Globe, Sparkles } from 'lucide-react';

interface SeoLinkItem {
  title: string;
  path: string;
  subtitle: string;
  filters: Partial<SearchFilters>;
  tag: string;
}

const seoDestinations: SeoLinkItem[] = [
  {
    title: 'أراضي زراعية للبيع في البحيرة',
    path: 'lands/beheira',
    subtitle: 'طريق مصر إسكندرية الصحراوي، حوش عيسى، والدلنجات',
    filters: { governorate: 'البحيرة' },
    tag: 'الأكثر طلباً',
  },
  {
    title: 'مزارع للبيع في وادي النطرون',
    path: 'lands/beheira/wadi-el-natrun',
    subtitle: 'آبار عذبة، كهرباء محولات خاصة، ومزارع زيتون ونخيل منتجة',
    filters: { governorate: 'البحيرة', city: 'وادي النطرون' },
    tag: 'فرص استثمارية',
  },
  {
    title: 'أراضي ومزارع في الإسكندرية والعامرية',
    path: 'lands/alexandria',
    subtitle: 'قريبة من موانئ الإسكندرية، صالحة للمزارع وعنابر الإنتاج الحيواني',
    filters: { governorate: 'الإسكندرية' },
    tag: 'موقع استراتيجي',
  },
  {
    title: 'مزارع للبيع والإيجار في مصر',
    path: 'farms',
    subtitle: 'مزارع موالح، نخيل مجدول وبارحي، وعنابر دواجن جاهزة للتشغيل',
    filters: { propertyType: 'مزرعة' },
    tag: 'جاهزة للإنتاج',
  },
  {
    title: 'أراضي زراعية للإيجار السنوي',
    path: 'rent',
    subtitle: 'أراضي ري نيلي وآبار للإيجار السنوي متجدد بمحافظات مصر',
    filters: { operationType: 'إيجار' },
    tag: 'إيجار سنوي',
  },
  {
    title: 'أراضي زراعية في الجيزة وطريق الواحات',
    path: 'lands/giza',
    subtitle: 'أراضي استصلاح ومزارع نموذجية قريبة من القاهرة الكبرى',
    filters: { governorate: 'الجيزة' },
    tag: 'قريبة من القاهرة',
  },
];

interface SeoDirectoryProps {
  onSelectDestination: (path: string, filters: SearchFilters) => void;
}

export const SeoDirectory: React.FC<SeoDirectoryProps> = ({ onSelectDestination }) => {
  return (
    <section className="py-12 bg-white border-t border-[#e2eae5]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>دليل المناطق الزراعية الأكثر رواجاً في مصر (SEO)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14281d]">
              استكشف الأراضي والمزارع حسب الموقع الجغرافي
            </h2>
            <p className="text-xs sm:text-sm text-[#527963] mt-0.5">
              صفحات متخصصة تتيح لك الوصول المباشر لأفضل عروض الاستثمار الزراعي
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#527963]">
            <Globe className="w-4 h-4 text-[#16a34a]" />
            <span>روابط سريعة ومفهرسة لمحركات البحث</span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seoDestinations.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const completeFilters: SearchFilters = {
                  operationType: item.filters.operationType || '',
                  governorate: item.filters.governorate || '',
                  city: item.filters.city || '',
                  minArea: '',
                  maxArea: '',
                  maxPrice: '',
                  propertyType: item.filters.propertyType || '',
                };
                onSelectDestination(item.path, completeFilters);
              }}
              className="bg-[#fcfdfc] hover:bg-[#f0fdf4] border border-[#e2eae5] hover:border-[#86efac] p-4 rounded-2xl text-right transition-all group shadow-2xs hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534]">
                  <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>{item.title}</span>
                </span>
                <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#86efac]">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-[#527963] leading-relaxed line-clamp-2">
                {item.subtitle}
              </p>
              <span className="inline-block mt-2.5 text-[11px] font-bold text-[#166534] group-hover:underline">
                تصفح العروض المتاحة ←
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
