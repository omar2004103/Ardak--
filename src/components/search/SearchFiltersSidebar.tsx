import React from 'react';
import { Filter, RotateCcw, MapPin, Layers, Coins, Maximize2 } from 'lucide-react';
import { SearchFilters } from '../../types/listing.ts';

interface SearchFiltersSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  activeCount: number;
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

export const SearchFiltersSidebar: React.FC<SearchFiltersSidebarProps> = ({
  filters,
  onChange,
  onReset,
  activeCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 shadow-xs divide-y divide-[#edf3ef]">
      {/* Sidebar Header */}
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#14281d]">تصفية النتائج</h3>
            {activeCount > 0 && (
              <span className="text-[11px] text-[#16a34a] font-medium">
                {activeCount} فلتر مفعّل
              </span>
            )}
          </div>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-[#dc2626] hover:text-[#b91c1c] font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح الكل</span>
          </button>
        )}
      </div>

      {/* Filter 1: نوع العملية */}
      <div className="py-4 space-y-2">
        <label className="text-xs font-bold text-[#374151] block">
          نوع العملية
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f4f7f5] rounded-xl">
          <button
            type="button"
            onClick={() => onChange({ ...filters, operationType: '' })}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filters.operationType === ''
                ? 'bg-white text-[#166534] shadow-xs'
                : 'text-[#527963] hover:text-[#166534]'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, operationType: 'بيع' })}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filters.operationType === 'بيع'
                ? 'bg-white text-[#166534] shadow-xs'
                : 'text-[#527963] hover:text-[#166534]'
            }`}
          >
            بيع
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, operationType: 'إيجار' })}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filters.operationType === 'إيجار'
                ? 'bg-white text-[#166534] shadow-xs'
                : 'text-[#527963] hover:text-[#166534]'
            }`}
          >
            إيجار
          </button>
        </div>
      </div>

      {/* Filter 2: نوع العقار */}
      <div className="py-4 space-y-2">
        <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#16a34a]" />
          <span>نوع العقار</span>
        </label>
        <div className="space-y-1.5">
          {propertyTypeOptions.map((opt) => {
            const isSelected =
              opt === 'الكل'
                ? !filters.propertyType || filters.propertyType === 'الكل'
                : filters.propertyType === opt;

            return (
              <label
                key={opt}
                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#f0fdf4] text-[#166534] font-bold border border-[#bbf7d0]'
                    : 'text-[#4b6354] hover:bg-[#f9fbf9] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="propertyType"
                    checked={isSelected}
                    onChange={() =>
                      onChange({
                        ...filters,
                        propertyType: opt === 'الكل' ? '' : opt,
                      })
                    }
                    className="accent-[#166534] w-3.5 h-3.5"
                  />
                  <span>{opt}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Filter 3: المحافظة */}
      <div className="py-4 space-y-2">
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
          className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2 text-xs text-[#14281d] outline-hidden"
        >
          {governorateOptions.map((gov) => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 4: المركز / المدينة */}
      <div className="py-4 space-y-2">
        <label className="text-xs font-bold text-[#374151] block">
          المركز / المدينة
        </label>
        <input
          type="text"
          placeholder="مثال: وادي النطرون، العامرية، بلبيس..."
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
        />
      </div>

      {/* Filter 5: المساحة من / إلى */}
      <div className="py-4 space-y-2">
        <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-[#16a34a]" />
          <span>المساحة (فدان)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[#6b7280] block mb-1">من</span>
            <input
              type="number"
              min="0"
              placeholder="الحد الأدنى"
              value={filters.minArea}
              onChange={(e) => onChange({ ...filters, minArea: e.target.value })}
              className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-lg px-2.5 py-1.5 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#6b7280] block mb-1">إلى</span>
            <input
              type="number"
              min="0"
              placeholder="الحد الأقصى"
              value={filters.maxArea}
              onChange={(e) => onChange({ ...filters, maxArea: e.target.value })}
              className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-lg px-2.5 py-1.5 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
            />
          </div>
        </div>
      </div>

      {/* Filter 6: السعر الأقصى */}
      <div className="pt-4 space-y-2">
        <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-[#16a34a]" />
          <span>السعر الأقصى (ج.م)</span>
        </label>
        <input
          type="number"
          min="0"
          step="50000"
          placeholder="مثال: 5,000,000"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2 text-xs text-[#14281d] outline-hidden placeholder:text-[#9ca3af]"
        />
      </div>
    </div>
  );
};
