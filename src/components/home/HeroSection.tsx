import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, CheckCircle2, Trees, Sprout } from 'lucide-react';
import { egyptianGovernorates } from '../../data/listings.ts';
import { SearchFilters } from '../../types/listing.ts';

interface HeroSectionProps {
  onSearchSubmit?: (filters: SearchFilters) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearchSubmit }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    operationType: '',
    governorate: '',
    city: '',
    minArea: '',
    maxArea: '',
    maxPrice: '',
  });

  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ardak Search Submitted:', filters);
    setSearchSubmitted(true);
    setTimeout(() => setSearchSubmitted(false), 4000);

    if (onSearchSubmit) {
      onSearchSubmit(filters);
    }

    const listingsEl = document.getElementById('listings');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#166534] via-[#14532d] to-[#0f3d21] text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
      {/* Subtle organic background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="farm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#farm-grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#bbf7d0] text-xs font-semibold mb-4 border border-white/15">
            <Sprout className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>سوق الأراضي والمزارع الزراعية الأول في مصر</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            ابحث عن أرضك القادمة في مصر
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#d1fae5] max-w-2xl mx-auto font-medium">
            منصة مصرية للأراضي الزراعية والمزارع للبيع والإيجار
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm text-[#a7f3d0]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
              عقود مسجلة وحيازات موثقة
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
              مياه نيلي وآبار ارتوازية
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
              تواصل مباشر مع أصحاب الأراضي
            </span>
          </div>
        </div>

        {/* Search Box Card */}
        <div
          id="search-section"
          className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 text-[#14281d] border border-[#e2eae5] relative z-10"
        >
          <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-[#edf3ef]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#14281d]">
                محرك البحث عن الأراضي الزراعية
              </h2>
            </div>
            <span className="text-xs text-[#527963] hidden sm:inline-block">
              حدد المواصفات للوصول للفرصة المناسبة
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {/* Field 1: نوع العملية */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#374151] mb-1.5">
                  نوع العملية
                </label>
                <select
                  value={filters.operationType}
                  onChange={(e) => setFilters({ ...filters, operationType: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#14281d] outline-hidden transition-all"
                >
                  <option value="">كل العمليات (بيع وإيجار)</option>
                  <option value="بيع">بيع</option>
                  <option value="إيجار">إيجار</option>
                </select>
              </div>

              {/* Field 2: المحافظة */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#374151] mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#16a34a]" />
                  <span>المحافظة</span>
                </label>
                <select
                  value={filters.governorate}
                  onChange={(e) => setFilters({ ...filters, governorate: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#14281d] outline-hidden transition-all"
                >
                  <option value="">جميع المحافظات</option>
                  {egyptianGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: المركز / المدينة */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#374151] mb-1.5">
                  المركز / المدينة
                </label>
                <input
                  type="text"
                  placeholder="مثال: وادي النطرون، العامرية..."
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#14281d] outline-hidden transition-all placeholder:text-[#9ca3af]"
                />
              </div>

              {/* Field 4: المساحة من */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#374151] mb-1.5">
                  المساحة من (فدان)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="الحد الأدنى"
                  value={filters.minArea}
                  onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#14281d] outline-hidden transition-all placeholder:text-[#9ca3af]"
                />
              </div>

              {/* Field 5: المساحة إلى */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#374151] mb-1.5">
                  المساحة إلى (فدان)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="الحد الأقصى"
                  value={filters.maxArea}
                  onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#14281d] outline-hidden transition-all placeholder:text-[#9ca3af]"
                />
              </div>

              {/* Field 6: السعر الأقصى */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#374151] mb-1.5">
                  السعر الأقصى (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  placeholder="مثال: 5,000,000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#14281d] outline-hidden transition-all placeholder:text-[#9ca3af]"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-4 border-t border-[#edf3ef] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#527963]">
                <Trees className="w-4 h-4 text-[#16a34a]" />
                <span>أكثر من 1500+ فدان مسجلة في مختلف محافظات مصر</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      operationType: '',
                      governorate: '',
                      city: '',
                      minArea: '',
                      maxArea: '',
                      maxPrice: '',
                    })
                  }
                  className="text-xs text-[#6b7280] hover:text-[#166534] px-3 py-2.5 cursor-pointer font-medium"
                >
                  إعادة تعيين
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>ابحث الآن</span>
                </button>
              </div>
            </div>
          </form>

          {/* Feedback notice on search */}
          {searchSubmitted && (
            <div className="mt-4 p-3 bg-[#f0fdf4] border border-[#86efac] text-[#166534] text-xs font-semibold rounded-lg text-center animate-in fade-in duration-200">
              ✓ تم استلام معايير البحث وجاري استعراض الأراضي الزراعية المطابقة أدناه.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
