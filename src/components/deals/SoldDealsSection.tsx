import React, { useState } from 'react';
import { initialSoldDeals, initialSoldTransactions } from '../../data/soldDeals.ts';
import { GovernoratePriceChart } from './GovernoratePriceChart.tsx';
import { CheckCircle2, TrendingUp, MapPin, Calendar, Scale, Droplets, ShieldCheck, ChevronLeft } from 'lucide-react';

interface SoldDealsSectionProps {
  onNavigateHome?: () => void;
  onExploreLands?: () => void;
  onOpenValuationEngine?: () => void;
}

export const SoldDealsSection: React.FC<SoldDealsSectionProps> = ({
  onNavigateHome,
  onExploreLands,
  onOpenValuationEngine,
}) => {
  const [selectedGov, setSelectedGov] = useState<string>('الكل');

  const filteredDeals =
    selectedGov === 'الكل'
      ? initialSoldDeals
      : initialSoldDeals.filter((deal) => deal.governorate === selectedGov);

  // Overall statistics
  const totalVolume = initialSoldDeals.reduce((sum, d) => sum + d.soldPrice, 0);
  const totalFeddan = initialSoldDeals.reduce((sum, d) => sum + d.areaFeddan, 0);
  const marketAvgPerFeddan = totalFeddan > 0 ? Math.round(totalVolume / totalFeddan) : 0;

  const governorates = ['الكل', 'البحيرة', 'الإسكندرية', 'الشرقية', 'الوادي الجديد', 'المنوفية'];

  return (
    <section className="py-10 sm:py-14 bg-[#f8faf8] border-t border-[#e2eae5] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {onNavigateHome && (
          <nav aria-label="مسار التنقل" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-[#527963]">
              <li>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="hover:text-[#166534] font-medium transition-colors cursor-pointer"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <ChevronLeft className="w-3.5 h-3.5 text-[#9ca3af]" />
              </li>
              <li className="text-[#14281d] font-bold">مؤشر الصفقات المنفذة</li>
            </ol>
          </nav>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534] mb-1">
              <TrendingUp className="w-4 h-4 text-[#16a34a]" />
              <span>مؤشر سوق الأراضي الزراعية في مصر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14281d]">
              سجل الصفقات المنفذة والمحققة فعلياً
            </h2>
            <p className="text-xs sm:text-sm text-[#527963] mt-1">
              بيانات حقيقية لصفقات أراضٍ ومزارع تم بيعها وتوثيقها لتسترشد بها في تسعير وتثمين أرضك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {onOpenValuationEngine && (
              <button
                type="button"
                onClick={onOpenValuationEngine}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#f0fdf4] text-[#166534] border border-[#86efac] text-xs font-bold shadow-2xs hover:shadow-xs transition-colors cursor-pointer"
              >
                <Scale className="w-4 h-4 text-[#16a34a]" />
                <span>محرك تقييم الأراضي (Comparable Engine)</span>
              </button>
            )}

            {onExploreLands && (
              <button
                type="button"
                onClick={onExploreLands}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>تصفح الأراضي المتاحة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Benchmark Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-[#e2eae5] shadow-2xs">
            <span className="text-xs text-[#6b7280] block mb-1">حجم الصفقات الموثقة</span>
            <span className="text-2xl font-black text-[#14281d] font-sans">
              {totalVolume.toLocaleString('ar-EG')} ج.م
            </span>
            <span className="text-[11px] text-[#16a34a] font-medium block mt-0.5">
              عبر {initialSoldDeals.length} صفقات زراعية كبرى
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e2eae5] shadow-2xs">
            <span className="text-xs text-[#6b7280] block mb-1">المساحة المباعة الإجمالية</span>
            <span className="text-2xl font-black text-[#166534] font-sans">
              {totalFeddan} فدان
            </span>
            <span className="text-[11px] text-[#527963] block mt-0.5">
              أراضٍ زراعية ومزارع منتجة
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e2eae5] shadow-2xs">
            <span className="text-xs text-[#6b7280] block mb-1">متوسط سعر الفدان العام</span>
            <span className="text-2xl font-black text-[#0284c7] font-sans">
              {marketAvgPerFeddan.toLocaleString('ar-EG')} ج.م
            </span>
            <span className="text-[11px] text-[#527963] block mt-0.5">
              يختلف حسب مصدر المياه ونوع الملكية
            </span>
          </div>
        </div>

        {/* Visual Recharts Component: Average Land Prices by Governorate */}
        <div className="mb-10">
          <GovernoratePriceChart deals={initialSoldTransactions} />
        </div>

        {/* Governorate Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {governorates.map((gov) => (
            <button
              key={gov}
              type="button"
              onClick={() => setSelectedGov(gov)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedGov === gov
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'bg-white border border-[#e2eae5] text-[#4b6354] hover:bg-[#f0fdf4]'
              }`}
            >
              {gov}
            </button>
          ))}
        </div>

        {/* Deals Cards / Table Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl border border-[#e2eae5] p-5 shadow-2xs hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-md border border-[#bbf7d0] mb-1">
                    <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
                    <span>صفقة منفذة رسمياً ✓</span>
                  </span>
                  <h3 className="font-bold text-sm text-[#14281d] leading-snug">
                    {deal.title}
                  </h3>
                </div>
                <span className="text-[10px] text-[#6b7280] font-sans shrink-0 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{deal.saleDate}</span>
                </span>
              </div>

              {/* Price & Area Highlight: Asking Price vs Sold Price */}
              <div className="bg-[#fcfdfc] p-3 rounded-xl border border-[#edf3ef] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#6b7280] block">المساحة المحققة:</span>
                  <span className="font-black text-[#14281d] font-sans text-sm">{deal.areaFeddan} فدان</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#15803d] font-bold block">سعر الفدان المنفذ:</span>
                  <span className="font-extrabold text-[#166534] font-sans text-sm">
                    {deal.soldPricePerFeddan.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#f3f4f6] flex items-center justify-between text-[11px]">
                  <span className="text-[#6b7280]">
                    السعر المطلوب: <span className="line-through">{deal.askingPrice.toLocaleString('ar-EG')} ج.م</span>
                  </span>
                  <span className="text-[#166534] font-bold">
                    تم البيع بـ: {deal.soldPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>

              {/* Land Identity Specs */}
              <div className="space-y-1.5 text-xs text-[#374151]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>{deal.governorate} · {deal.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                  <span>{deal.waterSource}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>{deal.ownershipType}</span>
                </div>
              </div>

              {deal.notes && (
                <p className="text-[11px] text-[#527963] bg-[#f9fbf9] p-2 rounded-lg border border-[#edf3ef]">
                  {deal.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
