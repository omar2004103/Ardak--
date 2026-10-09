import React from 'react';
import { Search, PhoneCall, ShieldCheck, MapPin } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  const points = [
    {
      title: 'بحث دقيق ومتخصص',
      desc: 'فلترة حسب نوع المحصول، مصادر الري، المساحة بالفدان أو القيراط، وتحديد المحافظة والمركز.',
      icon: Search,
    },
    {
      title: 'تواصل مباشر وفوري',
      desc: 'اتصل بصاحب الأرض مباشرة أو تواصل عبر واتساب بدون وسطاء متعددين أو رسوم مبهمة.',
      icon: PhoneCall,
    },
    {
      title: 'بيانات موثوقة وواضحة',
      desc: 'توضيح تفاصيل الآبار، ونسبة ملوحة المياه، ومحولات الكهرباء، والحالة القانونية للعقد.',
      icon: ShieldCheck,
    },
    {
      title: 'تغطية لكافة محافظات مصر',
      desc: 'من أراضي الدلتا القديمة إلى وادي النطرون، وطريق مصر إسكندرية الصحراوي، والوادي الجديد.',
      icon: MapPin,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#edf7f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#166534] uppercase tracking-wider block mb-1">
            مميزات المنصة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#14281d] tracking-tight">
            لماذا أرضك؟
          </h2>
          <p className="text-sm sm:text-base text-[#527963] mt-2">
            نجعل الوصول إلى الفرصة الزراعية المناسبة أسهل وأسرع وأكثر موثوقية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#d8e6dc] shadow-xs text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#e8f5ed] text-[#166534] flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#14281d] mb-2">{pt.title}</h3>
                <p className="text-xs text-[#527963] leading-relaxed">{pt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
