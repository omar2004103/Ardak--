import React, { useState, useMemo } from 'react';
import { Listing } from '../../types/listing.ts';
import {
  Scale,
  TrendingUp,
  MapPin,
  Check,
  X,
  ChevronLeft,
  Zap,
  Droplets,
  Trees,
  Sliders,
  DollarSign,
  Maximize2,
  Sparkles,
  Phone,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface ComparePageProps {
  allListings: Listing[];
  initialLandA?: Listing | null;
  initialLandB?: Listing | null;
  onNavigateHome?: () => void;
  onNavigateToSearch?: () => void;
  onViewDetails?: (listing: Listing) => void;
}

interface CustomLandComparison {
  title: string;
  pricePerFeddan: number;
  totalPrice: number;
  areaFeddan: number;
  roadType: string;
  waterSource: string;
  electricity: boolean;
  salinityLevel: 'منخفضة' | 'متوسطة' | 'مرتفعة';
  salinityPPM?: number;
  cultivationStatus: string;
  crops: string;
  irrigationType: string;
  ownershipType: string;
  governorate: string;
  city: string;
  isCustom?: boolean;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  allListings,
  initialLandA,
  initialLandB,
  onNavigateHome,
  onNavigateToSearch,
  onViewDetails,
}) => {
  // Preset example matching the user prompt:
  // الأرض A: 1.20M/فدان - 2 فدان - رئيسي - ارتوازي - كهرباء ✅ - ملوحة منخفضة - برتقال
  // الأرض B: 1.10M/فدان - 2 فدان - فرعي - ترعة - كهرباء ❌ - ملوحة مرتفعة - بور
  const presetA: CustomLandComparison = {
    title: 'الأرض A (طريق رئيسي - بئر ارتوازي - برتقال مثمر)',
    pricePerFeddan: 1200000,
    totalPrice: 2400000,
    areaFeddan: 2,
    roadType: 'رئيسي (أسفلت مباشر)',
    waterSource: 'ارتوازي (بئر جوفي مستقل)',
    electricity: true,
    salinityLevel: 'منخفضة',
    salinityPPM: 450,
    cultivationStatus: 'مزروعة ومنتجة',
    crops: 'برتقال صيفي مثمر (عمر 5 سنوات)',
    irrigationType: 'شبكة تنقيط حديثة',
    ownershipType: 'عقد مسجل شهر عقاري',
    governorate: 'البحيرة',
    city: 'وادي النطرون',
    isCustom: true,
  };

  const presetB: CustomLandComparison = {
    title: 'الأرض B (طريق فرعي - مياه ترعة - أرض بور)',
    pricePerFeddan: 1100000,
    totalPrice: 2200000,
    areaFeddan: 2,
    roadType: 'فرعي (طريق ترابي/مدق)',
    waterSource: 'ترعة (نوبة ري بحاري دورية)',
    electricity: false,
    salinityLevel: 'مرتفعة',
    salinityPPM: 1250,
    cultivationStatus: 'بور مستصلحة',
    crops: 'بور (بدون زراعة حالية)',
    irrigationType: 'ري غمر تقليدي',
    ownershipType: 'حيازة زراعية وتقنين',
    governorate: 'البحيرة',
    city: 'حوش عيسى',
    isCustom: true,
  };

  const [usePreset, setUsePreset] = useState<boolean>(true);
  const [selectedIdA, setSelectedIdA] = useState<string>(
    initialLandA?.id || (allListings[0]?.id || '')
  );
  const [selectedIdB, setSelectedIdB] = useState<string>(
    initialLandB?.id || (allListings[1]?.id || '')
  );

  // Helper to convert Listing to CustomLandComparison
  const listingToComp = (l: Listing): CustomLandComparison => {
    let feddan = l.area;
    if (l.areaUnit === 'قيراط') feddan = l.area / 24;
    else if (l.areaUnit === 'متر') feddan = l.area / 4200;
    feddan = Math.max(0.1, feddan);

    const pricePerFeddan = Math.round(l.rawPrice / feddan);
    let salinityLevel: 'منخفضة' | 'متوسطة' | 'مرتفعة' = 'منخفضة';
    if (l.waterSalinityTDS) {
      const match = l.waterSalinityTDS.match(/(\d+)/);
      if (match) {
        const ppm = parseInt(match[1], 10);
        if (ppm > 900) salinityLevel = 'مرتفعة';
        else if (ppm > 550) salinityLevel = 'متوسطة';
      }
    }

    return {
      title: l.title,
      pricePerFeddan,
      totalPrice: l.rawPrice,
      areaFeddan: Math.round(feddan * 10) / 10,
      roadType: l.roadType ? `${l.roadType}` : 'طريق ممهد',
      waterSource: l.waterSourceType || l.waterSource || 'بئر ارتوازي',
      electricity: l.electricity ?? true,
      salinityLevel,
      salinityPPM: l.waterSalinityTDS ? parseInt(l.waterSalinityTDS.replace(/\D/g, ''), 10) || undefined : undefined,
      cultivationStatus: l.cultivationStatus || 'مزروعة ومنتجة',
      crops: l.mainCrops || (l.cultivationStatus === 'بور مستصلحة' ? 'بور' : 'محاصيل مشكلة'),
      irrigationType: l.irrigationType || 'تنقيط حديث',
      ownershipType: l.ownershipType || l.legalStatus || 'عقد مسجل شهر عقاري',
      governorate: l.governorate,
      city: l.city,
      isCustom: false,
    };
  };

  const landA: CustomLandComparison = useMemo(() => {
    if (usePreset) return presetA;
    const found = allListings.find((l) => l.id === selectedIdA) || allListings[0];
    return found ? listingToComp(found) : presetA;
  }, [usePreset, selectedIdA, allListings]);

  const landB: CustomLandComparison = useMemo(() => {
    if (usePreset) return presetB;
    const found = allListings.find((l) => l.id === selectedIdB) || allListings[1];
    return found ? listingToComp(found) : presetB;
  }, [usePreset, selectedIdB, allListings]);

  // Price calculations
  const priceDiffPerFeddan = landA.pricePerFeddan - landB.pricePerFeddan;
  const pctDiff =
    landB.pricePerFeddan > 0
      ? Math.round((Math.abs(priceDiffPerFeddan) / landB.pricePerFeddan) * 100 * 10) / 10
      : 0;

  // Format price helper (e.g. 1.20M or 1,200,000)
  const formatM = (num: number): string => {
    if (num >= 1000000) {
      const m = num / 1000000;
      return `${m.toFixed(2)}M ج.م`;
    }
    return `${num.toLocaleString('ar-EG')} ج.م`;
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] py-8 sm:py-12 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        {onNavigateHome && (
          <nav aria-label="مسار التنقل">
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
              <li className="text-[#14281d] font-bold">قارن الأراضي ⚖️</li>
            </ol>
          </nav>
        )}

        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e2eae5] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#166534] mb-1">
              <span className="w-6 h-6 rounded-lg bg-[#dcfce7] flex items-center justify-center border border-[#86efac]">
                ⚖️
              </span>
              <span>المرحلة 4 — أداة المقارنة الاستثمارية وتحليل الفروق</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#14281d]">
              قارن الأراضي الزراعية وتحليل الاختلاف
            </h1>
            <p className="text-xs sm:text-sm text-[#527963] mt-1">
              مقارنة مباشرة بين خيارين لمواصفات (السعر للفدان، الطريق، المياه، الكهرباء، الملوحة، الزراعة) وفهم أسباب اختلاف السعر.
            </p>
          </div>

          {/* Quick Preset vs Platform Switch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUsePreset(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                usePreset
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'bg-white border border-[#e2eae5] text-[#374151] hover:bg-[#f0fdf4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#86efac]" />
              <span>مثال المقارنة المعياري (A vs B)</span>
            </button>

            <button
              type="button"
              onClick={() => setUsePreset(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                !usePreset
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'bg-white border border-[#e2eae5] text-[#374151] hover:bg-[#f0fdf4]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>مقارنة من إعلانات المنصة</span>
            </button>
          </div>
        </div>

        {/* Land Pickers (if browsing Platform listings) */}
        {!usePreset && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-4 sm:p-5 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#166534] mb-1.5">
                اختر العقار الأول (الأرض A):
              </label>
              <select
                value={selectedIdA}
                onChange={(e) => setSelectedIdA(e.target.value)}
                className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
              >
                {allListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} — ({l.price} · {l.area} {l.areaUnit} · {l.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0284c7] mb-1.5">
                اختر العقار الثاني (الأرض B):
              </label>
              <select
                value={selectedIdB}
                onChange={(e) => setSelectedIdB(e.target.value)}
                className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#0284c7] rounded-xl px-3 py-2 text-xs outline-hidden"
              >
                {allListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} — ({l.price} · {l.area} {l.areaUnit} · {l.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* COMPARISON MATRIX TABLE (Requested Table Format) */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#e2eae5] bg-[#f8faf8]">
                  <th className="p-4 w-1/4 font-black text-[#14281d] text-sm">
                    المعيار والمواصفة
                  </th>
                  <th className="p-4 w-[37.5%] border-r border-[#edf3ef] bg-[#f0fdf4]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#166534] text-white flex items-center justify-center font-bold text-xs">
                          A
                        </span>
                        <span className="font-black text-[#166534] text-sm sm:text-base">
                          {landA.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#166534] bg-[#dcfce7] px-2.5 py-0.5 rounded-full border border-[#86efac]">
                        الخيار الأول
                      </span>
                    </div>
                  </th>
                  <th className="p-4 w-[37.5%] border-r border-[#edf3ef] bg-[#f0f9ff]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs">
                          B
                        </span>
                        <span className="font-black text-[#0284c7] text-sm sm:text-base">
                          {landB.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2.5 py-0.5 rounded-full border border-[#bae6fd]">
                        الخيار الثاني
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf3ef]">
                {/* 1. السعر / فدان */}
                <tr className="bg-[#fcfdfc] font-bold hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-black text-[#14281d] bg-[#f8faf8]">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#16a34a]" />
                      <span>السعر / فدان</span>
                    </div>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-extrabold text-[#166534] font-sans text-base sm:text-lg">
                    {formatM(landA.pricePerFeddan)}
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-extrabold text-[#0284c7] font-sans text-base sm:text-lg">
                    {formatM(landB.pricePerFeddan)}
                  </td>
                </tr>

                {/* 2. المساحة */}
                <tr className="hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-bold text-[#374151] bg-[#f8faf8]">
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-[#16a34a]" />
                      <span>المساحة</span>
                    </div>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-bold text-[#14281d] font-sans text-sm">
                    {landA.areaFeddan} فدان
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-bold text-[#14281d] font-sans text-sm">
                    {landB.areaFeddan} فدان
                  </td>
                </tr>

                {/* 3. الطريق */}
                <tr className="hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-bold text-[#374151] bg-[#f8faf8]">
                    <span>الطريق</span>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#dcfce7] px-2.5 py-1 rounded-lg">
                      <span>{landA.roadType}</span>
                    </span>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    <span className="inline-flex items-center gap-1 font-bold text-[#854d0e] bg-[#fefce8] px-2.5 py-1 rounded-lg">
                      <span>{landB.roadType}</span>
                    </span>
                  </td>
                </tr>

                {/* 4. المياه */}
                <tr className="hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-bold text-[#374151] bg-[#f8faf8]">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-[#0284c7]" />
                      <span>المياه</span>
                    </div>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-bold text-[#0369a1]">
                    {landA.waterSource}
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-bold text-[#0284c7]">
                    {landB.waterSource}
                  </td>
                </tr>

                {/* 5. الكهرباء */}
                <tr className="hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-bold text-[#374151] bg-[#f8faf8]">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#ca8a04]" />
                      <span>الكهرباء</span>
                    </div>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    {landA.electricity ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#dcfce7] text-[#166534]">
                        <Check className="w-4 h-4" />
                        <span>✅ متوفرة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#fee2e2] text-[#dc2626]">
                        <X className="w-4 h-4" />
                        <span>❌ غير متوفرة</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    {landB.electricity ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#dcfce7] text-[#166534]">
                        <Check className="w-4 h-4" />
                        <span>✅ متوفرة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#fee2e2] text-[#dc2626]">
                        <X className="w-4 h-4" />
                        <span>❌ غير متوفرة (تحتاج طاقة/محول)</span>
                      </span>
                    )}
                  </td>
                </tr>

                {/* 6. الملوحة */}
                <tr className="hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-bold text-[#374151] bg-[#f8faf8]">
                    <span>الملوحة</span>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        landA.salinityLevel === 'منخفضة'
                          ? 'bg-[#dcfce7] text-[#166534]'
                          : landA.salinityLevel === 'متوسطة'
                          ? 'bg-[#fefce8] text-[#854d0e]'
                          : 'bg-[#fee2e2] text-[#dc2626]'
                      }`}
                    >
                      <span>{landA.salinityLevel}</span>
                      {landA.salinityPPM ? <span className="font-sans text-[11px]">({landA.salinityPPM} PPM)</span> : null}
                    </span>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        landB.salinityLevel === 'منخفضة'
                          ? 'bg-[#dcfce7] text-[#166534]'
                          : landB.salinityLevel === 'متوسطة'
                          ? 'bg-[#fefce8] text-[#854d0e]'
                          : 'bg-[#fee2e2] text-[#dc2626]'
                      }`}
                    >
                      <span>{landB.salinityLevel}</span>
                      {landB.salinityPPM ? <span className="font-sans text-[11px]">({landB.salinityPPM} PPM)</span> : null}
                    </span>
                  </td>
                </tr>

                {/* 7. الزراعة */}
                <tr className="hover:bg-[#f9fbf9] transition-colors">
                  <td className="p-3.5 font-bold text-[#374151] bg-[#f8faf8]">
                    <div className="flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-[#16a34a]" />
                      <span>الزراعة</span>
                    </div>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    <div className="font-bold text-[#166534]">{landA.crops}</div>
                    <div className="text-[11px] text-[#527963]">{landA.cultivationStatus}</div>
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef]">
                    <div className="font-bold text-[#6b7280]">{landB.crops}</div>
                    <div className="text-[11px] text-[#9ca3af]">{landB.cultivationStatus}</div>
                  </td>
                </tr>

                {/* Row: السعر الإجمالي المطلوب */}
                <tr className="bg-[#f8faf8] font-bold">
                  <td className="p-3.5 font-black text-[#14281d]">السعر الإجمالي المطلوب</td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-black text-[#166534] font-sans text-base">
                    {landA.totalPrice.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3.5 border-r border-[#edf3ef] font-black text-[#0284c7] font-sans text-base">
                    {landB.totalPrice.toLocaleString('ar-EG')} ج.م
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION: تحليل الاختلاف (Requested Analysis Section) */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf3ef] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center border border-[#bbf7d0]">
                  <Scale className="w-4 h-4 text-[#16a34a]" />
                </span>
                <h2 className="text-xl font-black text-[#14281d]">
                  تحليل الاختلاف وعوامل تباين السعر المحتملة
                </h2>
              </div>
              <p className="text-xs text-[#527963] mt-1">
                تفسير اقتصادي دقيق: لماذا يوجد فرق ({formatM(Math.abs(priceDiffPerFeddan))} للفدان) بين الأرض A والأرض B؟
              </p>
            </div>

            {/* Price gap badge */}
            <div className="bg-[#f0fdf4] p-3 rounded-xl border border-[#86efac] text-left shrink-0">
              <span className="text-[10px] text-[#527963] block font-medium">فارق السعر لكل فدان</span>
              <span className="text-base font-black text-[#166534] font-sans">
                {priceDiffPerFeddan > 0 ? '+' : ''}{priceDiffPerFeddan.toLocaleString('ar-EG')} ج.م
                <span className="text-xs font-normal text-[#527963] mr-1">({pctDiff}%)</span>
              </span>
            </div>
          </div>

          {/* 5 Core Factors Breakdown Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#14281d] flex items-center gap-1.5">
              <span>عوامل اختلاف السعر المحتملة:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. الطريق */}
              <div className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#14281d] flex items-center gap-1.5">
                    <span className="text-base">🛣️</span>
                    <span>1. الطريق وسهولة الوصول</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded">
                    ميزة للأرض A
                  </span>
                </div>
                <p className="text-xs text-[#527963] leading-relaxed">
                  <strong>الأرض A</strong> تقع على طريق رئيسي مباشر، مما يتيح دخول سيارات النقل الثقيل واللواري لتسويق المحصول دون تكاليف نقل وسيطة، بينما <strong>الأرض B</strong> على طريق فرعي/ترابي يرفع كلفة النقل ويقلل من القيمة التجارية للواجهة.
                </p>
              </div>

              {/* 2. مصدر المياه */}
              <div className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#14281d] flex items-center gap-1.5">
                    <span className="text-base">💧</span>
                    <span>2. مصدر المياه واستقلالية الري</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded">
                    استقلالية للـ A
                  </span>
                </div>
                <p className="text-xs text-[#527963] leading-relaxed">
                  <strong>الأرض A</strong> تعتمد على بئر ارتوازي مستقل يضمن الري طوال أيام الأسبوع حسب احتياج الشجر، بينما <strong>الأرض B</strong> تعتمد على مياه ترعة بنظام المناوبات الدورية (نوبة كل أسبوعين) مما قد يسبب إجهاداً مائياً في أشهر الصيف.
                </p>
              </div>

              {/* 3. الكهرباء */}
              <div className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#14281d] flex items-center gap-1.5">
                    <span className="text-base">⚡</span>
                    <span>3. الكهرباء والبنية التحتية</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded">
                    وفر 250,000+ ج.م
                  </span>
                </div>
                <p className="text-xs text-[#527963] leading-relaxed">
                  توفر الكهرباء في <strong>الأرض A</strong> يوفر على المشتري تكلفة شراء محول خاص أو تركيب محطة طاقة شمسية تتراوح تكلفتها الفعلية في السوق بين 200,000 إلى 350,000 ج.م، وهو ما يبرر فارق السعر مباشرة.
                </p>
              </div>

              {/* 4. حالة الأرض الزراعية */}
              <div className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#14281d] flex items-center gap-1.5">
                    <span className="text-base">🌾</span>
                    <span>4. حالة الأرض والمحصول (برتقال vs بور)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded">
                    إنتاجية فورية
                  </span>
                </div>
                <p className="text-xs text-[#527963] leading-relaxed">
                  <strong>الأرض A</strong> مزروعة بأشجار برتقال صيفي عمر 5 سنوات وتنتج عائداً سنوياً فورياً يوفر 5 سنوات من الانتظار ومصاريف الشتلات والخدمة (أكثر من 80,000 ج.م للفدان)، بينما <strong>الأرض B</strong> أرض بور تحتاج تجهيزاً واستصلاحاً من الصفر.
                </p>
              </div>

              {/* 5. الملوحة */}
              <div className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#14281d] flex items-center gap-1.5">
                    <span className="text-base">🧪</span>
                    <span>5. نسبة الملوحة ونوعية التربة</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded">
                    تنوع زراعي أعلى
                  </span>
                </div>
                <p className="text-xs text-[#527963] leading-relaxed">
                  ملوحة مياه <strong>الأرض A</strong> منخفضة (450 PPM) مما يسمح بزراعة جميع أصناف الخضار الحساسة والموالح، بينما ملوحة <strong>الأرض B</strong> مرتفعة (1250 PPM) مما يحصر الخيارات الزراعية في محاصيل محددة مقاومة للملوحة كالشعير والزيتون.
                </p>
              </div>

              {/* 6. تقييم القرار الاستثماري النهائي */}
              <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#86efac] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#166534] flex items-center gap-1.5">
                    <span>💡</span>
                    <span>الرأي الاستثماري العادل</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white text-[#166534] px-2 py-0.5 rounded border border-[#86efac]">
                    قرار مدروس
                  </span>
                </div>
                <p className="text-xs text-[#166534] leading-relaxed font-medium">
                  على الرغم من أن <strong>الأرض A</strong> أغلى ظاهرياً بـ 100,000 ج.م للفدان، إلا أن توفر الكهرباء + الطريق الرئيسي + الملوحة المنخفضة + إنتاجية البرتقال يمنحها قيمة مضافة تتجاوز 350,000 ج.م للفدان، مما يجعلها <strong>الصفقة الأفضل اقتصادياً على المدى القريب والبعيد</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
