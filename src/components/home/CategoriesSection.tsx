import React from 'react';
import { Shovel, TreePine, Droplet, SunMedium } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategory?: (propertyType: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      title: 'أراضي زراعية دلتاوية',
      type: 'أرض زراعية',
      desc: 'ري نيلي دائم وتربة خصبة للمحاصيل الحقلية والخضر',
      count: '65+ معروض',
      icon: Shovel,
      color: 'from-[#166534] to-[#15803d]',
    },
    {
      title: 'مزارع نموذجية جاهزة',
      type: 'مزرعة',
      desc: 'عنابر إنتاج حيواني واستراحات وسكن للعمال وأسوار',
      count: '38+ معروض',
      icon: TreePine,
      color: 'from-[#14532d] to-[#166534]',
    },
    {
      title: 'أراضي استصلاح وطاقة شمسية',
      type: 'أرض استصلاح',
      desc: 'آبار ارتوازية ومساحات واسعة للاستثمار المستدام',
      count: '44+ معروض',
      icon: SunMedium,
      color: 'from-[#855e2d] to-[#166534]',
    },
    {
      title: 'مزارع نخيل وفواكه مثمرة',
      type: 'مزرعة',
      desc: 'نخيل بارحي ومجدول وزيتون وموالح ذات عائد تصديري',
      count: '29+ معروض',
      icon: Droplet,
      color: 'from-[#1b4332] to-[#2d6a4f]',
    },
  ];

  return (
    <section id="categories" className="py-16 bg-white border-y border-[#e2eae5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#166534] uppercase tracking-wider block mb-1">
            التصنيفات الزراعية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#14281d] tracking-tight">
            تصفح حسب نوع النشاط الزراعي
          </h2>
          <p className="text-sm sm:text-base text-[#527963] mt-2">
            اختر نوع الاستثمار أو النشاط الزراعي الذي تبحث عنه في جمهورية مصر العربية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat.type)}
                className="group text-right relative bg-[#f9fbf9] hover:bg-white rounded-2xl p-6 border border-[#e2eae5] hover:border-[#16a34a]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#14281d] group-hover:text-[#166534] transition-colors mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#527963] leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#edf3ef] flex items-center justify-between text-xs font-bold text-[#166534] w-full">
                  <span>تصفح الإعلانات</span>
                  <span className="text-[11px] text-[#6b7280] font-normal">{cat.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
