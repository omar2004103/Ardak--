import React from 'react';
import { Listing } from '../../types/listing.ts';
import {
  X,
  Scale,
  MapPin,
  Maximize2,
  Phone,
  MessageSquare,
  Check,
  Eye,
  Trash2,
  Droplets,
  Zap,
  FileText,
  Layers,
  Calculator,
  Compass,
  Trees,
  ShieldCheck,
} from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onRemoveListing: (id: string) => void;
  onClearAll: () => void;
  onViewDetails: (listing: Listing) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  listings,
  onRemoveListing,
  onClearAll,
  onViewDetails,
}) => {
  if (!isOpen || listings.length === 0) return null;

  // Helper to calculate price per feddan if applicable
  const calculatePricePerFeddan = (listing: Listing): string => {
    if (listing.areaUnit === 'فدان' && listing.area > 0) {
      const perFeddan = Math.round(listing.rawPrice / listing.area);
      return `${perFeddan.toLocaleString('ar-EG')} ج.م / فدان`;
    }
    if (listing.areaUnit === 'قيراط' && listing.area > 0) {
      // 24 qirat in 1 feddan
      const feddanArea = listing.area / 24;
      const perFeddan = Math.round(listing.rawPrice / feddanArea);
      return `${perFeddan.toLocaleString('ar-EG')} ج.م / فدان`;
    }
    return 'حسب المساحة';
  };

  // 1. Calculate total combined area normalized to Feddan
  const totalCombinedAreaFeddan = listings.reduce((sum, item) => {
    let feddan = item.area;
    if (item.areaUnit === 'قيراط') {
      feddan = item.area / 24;
    } else if (item.areaUnit === 'متر') {
      feddan = item.area / 4200;
    }
    return sum + feddan;
  }, 0);

  // 2. Calculate total combined raw price
  const totalCombinedPrice = listings.reduce((sum, item) => sum + (item.rawPrice || 0), 0);

  // 3. Average price per feddan
  const avgPricePerFeddan =
    totalCombinedAreaFeddan > 0 ? Math.round(totalCombinedPrice / totalCombinedAreaFeddan) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-white px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center border border-[#bbf7d0]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#14281d]">
                  مقارنة مواصفات وهوية الأراضي الزراعية
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                  {listings.length} أراضي مختارة
                </span>
              </div>
              <p className="text-xs text-[#527963]">
                مقارنة تفصيلية للموقع، المياه، البنية التحتية، المحاصيل، والملكية القانونية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-bold text-[#dc2626] hover:bg-[#fee2e2]/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ المقارنة</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              aria-label="إغلاق المقارنة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Investment Portfolio Summary Cards Bar */}
        <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] px-6 py-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
            <div className="bg-white/90 p-2.5 rounded-xl border border-[#bbf7d0] flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#527963] block font-medium">مجموع المساحة الكلية المختارة</span>
                <span className="text-sm font-black text-[#166534] font-sans">
                  {totalCombinedAreaFeddan.toLocaleString('ar-EG', { maximumFractionDigits: 2 })} فدان
                </span>
              </div>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-[#bbf7d0] flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#527963] block font-medium">إجمالي القيمة الاستثمارية</span>
                <span className="text-sm font-black text-[#166534] font-sans">
                  {totalCombinedPrice.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-[#bbf7d0] flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#527963] block font-medium">متوسط سعر الفدان التقديري</span>
                <span className="text-sm font-black text-[#166534] font-sans">
                  {avgPricePerFeddan.toLocaleString('ar-EG')} ج.م / فدان
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Comparison Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <table className="w-full min-w-[750px] border-collapse text-right text-xs sm:text-sm">
            <thead>
              {/* Properties Cards Top Row */}
              <tr className="border-b border-[#e2eae5]">
                <th className="p-3 w-48 bg-[#f8faf8] font-bold text-[#14281d] rounded-tr-xl align-top">
                  العقار الزراعي
                </th>
                {listings.map((item) => (
                  <th
                    key={item.id}
                    className="p-3 w-64 bg-[#fbfdfb] border-r border-[#edf3ef] align-top text-right font-normal"
                  >
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                              item.listingType === 'إيجار'
                                ? 'bg-[#0284c7]'
                                : 'bg-[#166534]'
                            }`}
                          >
                            {item.listingType === 'بيع' ? 'للبيع' : 'للإيجار'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                            {item.propertyType}
                          </span>
                          {item.advertiserType && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e8f5e9] text-[#1b5e20]">
                              {item.advertiserType}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveListing(item.id)}
                          className="text-[#9ca3af] hover:text-[#dc2626] p-1 rounded-md transition-colors cursor-pointer"
                          title="حذف من المقارنة"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-[#14281d] leading-snug line-clamp-2">
                        {item.title}
                      </h4>

                      <div className="text-base font-extrabold text-[#166534] font-sans">
                        {item.price}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf3ef]">
              {/* Row 1: نوع العملية والصفة */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <span>نوع المعاملة</span>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] font-medium">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.listingType === 'إيجار'
                          ? 'bg-[#e0f2fe] text-[#0369a1]'
                          : 'bg-[#dcfce7] text-[#166534]'
                      }`}
                    >
                      {item.listingType === 'بيع' ? 'بيع ملك نهائي' : 'إيجار سنوي متجدد'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 2: المساحة الفردية */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>المساحة الفردية</span>
                  </div>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] font-bold text-[#14281d]">
                    <span className="font-sans text-base">{item.area}</span> {item.areaUnit}
                    {item.frontageMeters && (
                      <span className="text-[11px] text-[#527963] font-normal block">
                        (واجهة {item.frontageMeters}م)
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* NEW ROW: صف حساب مجموع المساحة الكلية للعقارات المختارة */}
              <tr className="bg-[#f0fdf4] border-y-2 border-[#86efac]">
                <td className="p-3.5 font-black text-[#166534] bg-[#dcfce7]">
                  <div className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-[#166534]" />
                    <span>مجموع المساحة الكلية</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#15803d] block mt-0.5">
                    إجمالي محفظة الخيارات المقارنة
                  </span>
                </td>
                <td
                  colSpan={listings.length}
                  className="p-3.5 text-center font-black text-[#166534] text-base font-sans bg-[#f0fdf4]"
                >
                  <div className="flex items-center justify-center flex-wrap gap-3">
                    <span className="px-3.5 py-1.5 bg-white rounded-xl border border-[#86efac] shadow-2xs font-extrabold text-[#166534]">
                      {totalCombinedAreaFeddan.toLocaleString('ar-EG', { maximumFractionDigits: 2 })} فدان
                    </span>
                    <span className="text-xs font-bold text-[#15803d] bg-[#dcfce7] px-3 py-1 rounded-lg">
                      إجمالي الاستثمار: {totalCombinedPrice.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="text-xs text-[#527963]">
                      (متوسط سعر الفدان: {avgPricePerFeddan.toLocaleString('ar-EG')} ج.م)
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 4: السعر الإجمالي */}
              <tr className="hover:bg-[#f9fbf9] transition-colors bg-[#fbfdfb]">
                <td className="p-3 font-bold text-[#166534] bg-[#f0fdf4]">
                  <span>السعر المطلوب</span>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] font-extrabold text-[#166534] font-sans text-base">
                    {item.price}
                  </td>
                ))}
              </tr>

              {/* Row 5: السعر التقديري للفدان */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <span>سعر الفدان التقديري</span>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] font-bold text-[#047857] font-sans">
                    {calculatePricePerFeddan(item)}
                  </td>
                ))}
              </tr>

              {/* 1. الموقع والوصول */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>الموقع والوصول</span>
                  </div>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] text-[#14281d] text-xs">
                    <div className="font-bold">{item.governorate} · {item.city}</div>
                    {item.village && <div className="text-[#527963]">{item.village}</div>}
                    {item.distanceFromMainRoad && (
                      <div className="text-[11px] text-[#0284c7] font-medium mt-0.5">
                        {item.distanceFromMainRoad} ({item.roadType || 'طريق ممهد'})
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* 3. المياه والملوحة */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>المياه والملوحة 💧</span>
                  </div>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] text-[#14281d] text-xs">
                    <div className="font-bold text-[#0369a1]">
                      {item.waterSourceType || item.waterSource || 'غير محدد'}
                    </div>
                    {item.waterSalinityTDS && (
                      <div className="text-[11px] text-[#166534] font-semibold mt-0.5">
                        الملوحة: {item.waterSalinityTDS}
                      </div>
                    )}
                    {item.wellsCount !== undefined && item.wellsCount > 0 && (
                      <div className="text-[11px] text-[#6b7280]">
                        الآبار: {item.wellsCount} (عمق {item.wellDepthMeters || 'متوسط'}م)
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* 4. البنية التحتية وشبكة الري */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#ca8a04]" />
                    <span>الكهرباء والبنية التحتية</span>
                  </div>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] text-[#14281d] text-xs">
                    <div className="font-semibold">
                      {item.electricityType || (item.electricity ? 'كهرباء متوفرة' : 'طاقة شمسية')}
                    </div>
                    <div className="text-[11px] text-[#527963] mt-0.5">
                      الري: {item.irrigationType || (item.irrigationNetwork ? 'شبكة ري حديثة' : 'غمر')}
                    </div>
                    {item.buildings && (
                      <div className="text-[11px] text-[#14281d] mt-0.5 truncate" title={item.buildings}>
                        🏠 {item.buildings}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* 5. الزراعة والمحاصيل */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <div className="flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>الزراعة والمحاصيل 🌾</span>
                  </div>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] text-[#14281d] text-xs">
                    <div className="font-bold text-[#166534]">
                      {item.cultivationStatus || 'مزروعة'}
                    </div>
                    {item.mainCrops && (
                      <div className="text-[11px] text-[#374151] mt-0.5">
                        {item.mainCrops}
                      </div>
                    )}
                    {item.treeAgeYears && (
                      <div className="text-[11px] text-[#527963]">
                        عمر الأشجار: {item.treeAgeYears} سنوات
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* 6. الملكية القانونية والمستندات */}
              <tr className="hover:bg-[#f9fbf9] transition-colors">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>الملكية والمستندات</span>
                  </div>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef] text-[#14281d] text-xs">
                    <div className="font-bold text-[#166534]">
                      {item.ownershipType || item.legalStatus || 'عقد مسجل'}
                    </div>
                    {item.documentsAvailable && item.documentsAvailable.length > 0 && (
                      <div className="text-[10px] text-[#527963] mt-0.5">
                        {item.documentsAvailable.join(' · ')}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: إجراءات التواصل والتفاصيل */}
              <tr className="bg-[#fcfdfc]">
                <td className="p-3 font-bold text-[#374151] bg-[#f8faf8] rounded-br-xl">
                  <span>إجراءات العقار</span>
                </td>
                {listings.map((item) => (
                  <td key={item.id} className="p-3 border-r border-[#edf3ef]">
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="w-full py-2 px-3 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#bbf7d0] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض هوية الأرض كاملة</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <a
                          href={`https://wa.me/${item.whatsappNumber}?text=${encodeURIComponent(
                            `مرحباً، أستفسر بخصوص مقارنة إعلان: ${item.title} على منصة أرضك`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2 rounded-lg bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#15803d] font-bold text-[11px] flex items-center justify-center gap-1 border border-[#86efac] transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>واتساب</span>
                        </a>

                        <a
                          href={`tel:${item.contactPhone}`}
                          className="py-1.5 px-2 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال</span>
                        </a>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
