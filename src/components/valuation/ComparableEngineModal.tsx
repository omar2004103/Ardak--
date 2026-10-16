import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Sliders,
  DollarSign,
  Maximize2,
  Check,
} from 'lucide-react';
import {
  Listing,
  ValuationReport,
} from '../../types/listing.ts';
import { egyptianGovernorates } from '../../data/listings.ts';
import {
  runComparableEngine,
  listingToTargetInput,
  TargetPropertyInput,
} from '../../utils/comparableEngine.ts';

interface ComparableEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialListing?: Listing | null;
  allListings: Listing[];
}

export const ComparableEngineModal: React.FC<ComparableEngineModalProps> = ({
  isOpen,
  onClose,
  initialListing,
  allListings,
}) => {
  // Input form state
  const [selectedListingId, setSelectedListingId] = useState<string>(
    initialListing?.id || ''
  );

  // Custom parameters state (defaults to user's test case: 2 فدان — حوش عيسى — الشعراوية — طريق رئيسي — ارتوازي — كهرباء)
  const [areaFeddan, setAreaFeddan] = useState<number>(
    initialListing?.area || 2
  );
  const [governorate, setGovernorate] = useState<string>(
    initialListing?.governorate || 'البحيرة'
  );
  const [city, setCity] = useState<string>(
    initialListing?.city || 'حوش عيسى'
  );
  const [village, setVillage] = useState<string>(
    initialListing?.village || 'الشعراوية'
  );
  const [roadType, setRoadType] = useState<string>(
    initialListing?.roadType || 'أسفلت مباشر'
  );
  const [waterSource, setWaterSource] = useState<string>(
    initialListing?.waterSource || 'ارتوازي (بئر جوفي)'
  );
  const [salinityPPM, setSalinityPPM] = useState<number>(480);
  const [electricity, setElectricity] = useState<boolean>(true);
  const [cultivationStatus, setCultivationStatus] = useState<string>('مزروعة ومنتجة');
  const [crops, setCrops] = useState<string>(initialListing?.mainCrops || 'خضار وبطاطس');

  // When picking an existing listing, auto populate
  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
    const found = allListings.find((l) => l.id === id);
    if (found) {
      const parsed = listingToTargetInput(found);
      setAreaFeddan(parsed.areaFeddan);
      setGovernorate(parsed.governorate);
      setCity(parsed.city);
      setVillage(parsed.village || '');
      setRoadType(parsed.roadType || 'أسفلت مباشر');
      setWaterSource(parsed.waterSource || 'ارتوازي (بئر جوفي)');
      if (parsed.salinityPPM) setSalinityPPM(parsed.salinityPPM);
      setElectricity(parsed.electricity ?? true);
      setCrops(parsed.crops || '');
    }
  };

  // Run calculation memoized
  const report: ValuationReport = useMemo(() => {
    const targetInput: TargetPropertyInput = {
      areaFeddan,
      governorate,
      city,
      village,
      roadType,
      waterSource,
      salinityPPM,
      electricity,
      cultivationStatus,
      crops,
    };
    return runComparableEngine(targetInput);
  }, [
    areaFeddan,
    governorate,
    city,
    village,
    roadType,
    waterSource,
    salinityPPM,
    electricity,
    cultivationStatus,
    crops,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center border border-[#bbf7d0]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#14281d]">
                  محرك تقييم الأراضي بالصفقات الفعلية (Comparable Engine)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#86efac]">
                  نسخة حسابية دقيقة 100%
                </span>
              </div>
              <p className="text-xs text-[#527963]">
                تحليل الصفقات المنفذة وحساب أوزان التشابه الـ 7 لاحتساب النطاق السعري العادل.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick preset selector: Choose listing or test case */}
          <div className="bg-[#f7faf8] p-4 rounded-2xl border border-[#e2eae5] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#14281d] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#16a34a]" />
                <span>اختر إعلاناً للتقييم، أو حدد مواصفات مخصصة:</span>
              </span>

              {/* Quick load user prompt example */}
              <button
                type="button"
                onClick={() => {
                  setSelectedListingId('');
                  setAreaFeddan(2);
                  setGovernorate('البحيرة');
                  setCity('حوش عيسى');
                  setVillage('الشعراوية');
                  setRoadType('أسفلت مباشر');
                  setWaterSource('ارتوازي (بئر جوفي)');
                  setSalinityPPM(480);
                  setElectricity(true);
                  setCrops('بطاطس وخضار');
                }}
                className="text-xs font-bold text-[#166534] bg-white hover:bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>نموذج استرشادي: 2 فدان - حوش عيسى (الشعراوية)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#374151] mb-1">
                  أو اختر من إعلانات المنصة المتاحة:
                </label>
                <select
                  value={selectedListingId}
                  onChange={(e) => handleSelectListing(e.target.value)}
                  className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                >
                  <option value="">-- إدخال مخصص يدوياً --</option>
                  {allListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.area} {l.areaUnit} - {l.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">
                  المساحة المستهدفة (فدان)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={areaFeddan}
                  onChange={(e) => setAreaFeddan(parseFloat(e.target.value) || 1)}
                  className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden font-sans font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">
                  المحافظة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                >
                  {egyptianGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2 Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">المركز</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">القرية / الحوض</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-white border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">نوع الطريق</label>
                <select
                  value={roadType}
                  onChange={(e) => setRoadType(e.target.value)}
                  className="w-full bg-white border border-[#d1d5db] rounded-lg px-2 py-1.5 text-xs outline-hidden"
                >
                  <option value="أسفلت مباشر">أسفلت مباشر</option>
                  <option value="مدق ممهد">مدق ممهد</option>
                  <option value="طريق ترابي">طريق ترابي</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-1">مصدر المياه</label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full bg-white border border-[#d1d5db] rounded-lg px-2 py-1.5 text-xs outline-hidden"
                >
                  <option value="ارتوازي (بئر جوفي)">ارتوازي (بئر جوفي)</option>
                  <option value="ترعة (ري بحاري نيلي)">ترعة (ري بحاري نيلي)</option>
                  <option value="مختلط (ترعة + بئر)">مختلط (ترعة + بئر)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Indicative Price Range Banner */}
          <div className="bg-[#f0fdf4] rounded-2xl p-5 border border-[#86efac] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#bbf7d0] pb-3">
              <div>
                <span className="text-xs font-bold text-[#15803d] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span>النطاق السعري الاسترشادي العادل لمساحة ({report.targetAreaFeddan} فدان)</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#14281d] mt-1">
                  {report.estimatedTotalValue.toLocaleString('ar-EG')} ج.م
                  <span className="text-xs text-[#527963] font-normal mr-2">
                    (نطاق: {report.minTotalEstimatedValue.toLocaleString('ar-EG')} - {report.maxTotalEstimatedValue.toLocaleString('ar-EG')} ج.م)
                  </span>
                </h3>
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-[#bbf7d0] text-center shrink-0">
                <span className="text-[10px] text-[#527963] block font-medium">سعر الفدان الاسترشادي المرجّح</span>
                <span className="text-base font-black text-[#166534] font-sans">
                  {report.weightedAvgPricePerFeddan.toLocaleString('ar-EG')} ج.م / فدان
                </span>
              </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
              <div className="bg-white p-3 rounded-xl border border-[#bbf7d0]">
                <span className="text-[11px] text-[#6b7280] block">أدنى سعر فدان مسجل:</span>
                <span className="font-bold text-[#14281d] font-sans text-sm">
                  {report.minPricePerFeddan.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#bbf7d0]">
                <span className="text-[11px] text-[#6b7280] block">أعلى سعر فدان مسجل:</span>
                <span className="font-bold text-[#14281d] font-sans text-sm">
                  {report.maxPricePerFeddan.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#bbf7d0]">
                <span className="text-[11px] text-[#6b7280] block">متوسط نسبة التفاوض:</span>
                <span className="font-bold text-[#dc2626] font-sans text-sm flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{report.avgNegotiationDiscount}% خصم عن السعر المطلوب</span>
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#bbf7d0]">
                <span className="text-[11px] text-[#6b7280] block">عدد الصفقات المشابهة:</span>
                <span className="font-bold text-[#0284c7] font-sans text-sm">
                  {report.comparables.length} صفقات منفذة
                </span>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="bg-white/80 p-3 rounded-xl border border-[#bbf7d0] text-xs text-[#527963] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <span>
                <strong>أوزان المقارنة المعتمدة:</strong> الموقع (30%)، المساحة (15%)، المياه (15%)، الطريق (10%)، الكهرباء (10%)، الزراعة (10%)، البنية التحتية والملكية (10%). هذه الأوزان مبدئية استرشادية، ويتم تدقيقها وتحديثها مع جمع صفقات سوقية إضافية.
              </span>
            </div>
          </div>

          {/* Top 10 Comparables Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#14281d]">
                أقرب {report.comparables.length} صفقات مشابهة منفذة في السوق
              </h3>
              <span className="text-xs text-[#527963]">
                مرتبة حسب درجة التطابق والتشابه
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.comparables.map((item, idx) => {
                const tx = item.transaction;
                const sim = item.similarity;
                return (
                  <div
                    key={tx.id}
                    className="bg-[#fcfdfc] rounded-2xl border border-[#e2eae5] p-4 shadow-2xs hover:border-[#86efac] transition-all space-y-3"
                  >
                    {/* Top Row: Rank & Match Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#166534] text-white text-xs font-bold flex items-center justify-center font-sans">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-xs text-[#14281d] leading-snug line-clamp-1">
                          {tx.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#dcfce7] text-[#15803d] border border-[#86efac]">
                        تشابه: {sim.totalScore}%
                      </span>
                    </div>

                    {/* Asking vs Sold Price (Crucial distinction!) */}
                    <div className="bg-white p-3 rounded-xl border border-[#edf3ef] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#6b7280] block">السعر المطلوب (asking_price):</span>
                        <span className="line-through text-[#6b7280] font-sans font-medium text-xs">
                          {tx.askingPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#15803d] font-bold block">
                          السعر المنفذ فعلياً (sold_price):
                        </span>
                        <span className="font-extrabold text-[#166534] font-sans text-sm">
                          {tx.soldPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-[#f3f4f6] flex items-center justify-between text-[11px]">
                        <span className="text-[#374151]">
                          سعر الفدان المنفذ: <strong>{tx.soldPricePerFeddan.toLocaleString('ar-EG')} ج.م</strong>
                        </span>
                        <span className="text-[#dc2626] font-bold">
                          خصم تفاوض {item.discountPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Similarity Breakdown Weights (7 weights) */}
                    <div className="bg-[#f9fbf9] p-2.5 rounded-xl border border-[#edf3ef] space-y-1.5 text-[11px]">
                      <span className="text-[10px] font-bold text-[#374151] block">
                        تفكيك درجات التشابه:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] text-[#527963]">
                        <div>الموقع (30%): <strong className="text-[#14281d]">{sim.location}%</strong></div>
                        <div>المساحة (15%): <strong className="text-[#14281d]">{sim.area}%</strong></div>
                        <div>المياه (15%): <strong className="text-[#14281d]">{sim.water}%</strong></div>
                        <div>الطريق (10%): <strong className="text-[#14281d]">{sim.road}%</strong></div>
                        <div>الكهرباء (10%): <strong className="text-[#14281d]">{sim.electricity}%</strong></div>
                        <div>الزراعة (10%): <strong className="text-[#14281d]">{sim.cultivation}%</strong></div>
                        <div>البنية والملكية (10%): <strong className="text-[#14281d]">{sim.infrastructure}%</strong></div>
                      </div>
                    </div>

                    {/* Metadata specs */}
                    <div className="flex items-center justify-between text-[11px] text-[#527963] pt-1 border-t border-[#edf3ef]">
                      <span>{tx.governorate} · {tx.city} ({tx.village || ''})</span>
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar className="w-3 h-3" />
                        <span>{tx.saleDate}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f7faf8] px-6 py-3.5 border-t border-[#edf3ef] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#527963]">
            نموذج تقييم حسابي يعتمد فقط على الصفقات المبرمة في السوق المصري.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            إغلاق المحرك
          </button>
        </div>
      </div>
    </div>
  );
};
