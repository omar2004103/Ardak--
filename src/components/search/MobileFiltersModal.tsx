import React, { useEffect } from 'react';
import {
  X,
  Filter,
  RotateCcw,
  MapPin,
  Layers,
  Coins,
  Maximize2,
  Check,
} from 'lucide-react';
import { SearchFilters } from '../../types/listing.ts';

interface MobileFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  activeCount: number;
  totalResultsCount: number;
}

const governorateOptions = [
  'الكل',
  'البحيرة',
  'الإسكندرية',
  'الشرقية',
  'المنوفية',
  'الجيزة',
  'الوادي الجديد',
];

const propertyTypeOptions = [
  'الكل',
  'أرض زراعية',
  'مزرعة',
  'أرض استصلاح',
  'أرض مباني زراعية',
];

export const MobileFiltersModal: React.FC<MobileFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  activeCount,
  totalResultsCount,
}) => {
  // Lock body scroll when modal is active on mobile
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border-t sm:border border-[#e2eae5] relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Handle for mobile touch */}
        <div className="w-12 h-1.5 bg-[#d1d5db] rounded-full mx-auto mt-3 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#edf3ef] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14281d]">
                تصفية نتائج البحث
              </h3>
              <p className="text-[11px] text-[#527963]">
                {activeCount > 0
                  ? `${activeCount} فلتر مفعّل حالياً`
                  : 'حدد مواصفات الأرض الزراعية المطلوبة'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق الفلاتر"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-right">
          {/* Filter 1: نوع العملية */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#374151] block">
              نوع العملية
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f4f7f5] rounded-xl">
              <button
                type="button"
                onClick={() => onChange({ ...filters, operationType: '' })}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filters.operationType === ''
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-[#527963]'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, operationType: 'بيع' })}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filters.operationType === 'بيع'
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-[#527963]'
                }`}
              >
                للبيع
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, operationType: 'إيجار' })}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filters.operationType === 'إيجار'
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-[#527963]'
                }`}
              >
                للإيجار
              </button>
            </div>
          </div>

          {/* Filter 2: نوع العقار */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>نوع العقار الزراعي</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypeOptions.map((opt) => {
                const isSelected =
                  opt === 'الكل'
                    ? !filters.propertyType || filters.propertyType === 'الكل'
                    : filters.propertyType === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        propertyType: opt === 'الكل' ? '' : opt,
                      })
                    }
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all text-right cursor-pointer ${
                      isSelected
                        ? 'bg-[#f0fdf4] text-[#166534] font-bold border border-[#bbf7d0] ring-1 ring-[#166534]/20'
                        : 'bg-[#fbfdfb] text-[#4b6354] border border-[#e2eae5] hover:bg-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#166534]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 3: المحافظة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>المحافظة</span>
            </label>
            <select
              value={filters.governorate || 'الكل'}
              onChange={(e) =>
                onChange({
                  ...filters,
                  governorate: e.target.value === 'الكل' ? '' : e.target.value,
                })
              }
              className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#14281d] outline-hidden font-sans"
            >
              {governorateOptions.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: المركز / المدينة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#374151] block">
              المركز / المدينة / القرية
            </label>
            <input
              type="text"
              placeholder="مثال: وادي النطرون، العامرية، بلبيس..."
              value={filters.city}
              onChange={(e) => onChange({ ...filters, city: e.target.value })}
              className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
            />
          </div>

          {/* Filter 5: المساحة من / إلى */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>المساحة (بالفدان)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-[#6b7280] block mb-1">من:</span>
                <input
                  type="number"
                  min="0"
                  placeholder="الحد الأدنى"
                  value={filters.minArea}
                  onChange={(e) => onChange({ ...filters, minArea: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#6b7280] block mb-1">إلى:</span>
                <input
                  type="number"
                  min="0"
                  placeholder="الحد الأقصى"
                  value={filters.maxArea}
                  onChange={(e) => onChange({ ...filters, maxArea: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
                />
              </div>
            </div>
          </div>

          {/* Filter 6: السعر الأقصى */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>الحد الأقصى للسعر (ج.م)</span>
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              placeholder="مثال: 5,000,000"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
            />
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="px-5 py-4 border-t border-[#edf3ef] bg-[#fafcfb] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activeCount > 0
                ? 'text-[#dc2626] hover:bg-[#fee2e2]/40 cursor-pointer'
                : 'text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح الفلاتر</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <span>عرض النتائج</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-white/20 text-white font-sans text-xs">
              {totalResultsCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
