import React from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';

interface CtaBannerProps {
  onAddListingClick?: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onAddListingClick }) => {
  return (
    <section className="bg-[#14532d] text-white py-14 sm:py-16 relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#16a34a]/10 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-right">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#a7f3d0] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" />
              <span>أصحاب الأراضي والمزارع في مصر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
              لديك أرض أو مزرعة ترغب في بيعها أو تأجيرها؟
            </h2>
            <p className="text-sm sm:text-base text-[#cde3d4] leading-relaxed">
              أضف إعلانك مجاناً عبر منصة أرضك، وتواصل مباشرة مع آلاف المستثمرين والمزارعين الجادين والمهتمين بالاستثمار الزراعي في مصر.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onAddListingClick}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white hover:bg-[#f0fdf4] text-[#166534] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-[#166534]" />
              <span>أضف أرضك الآن مجاناً</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
