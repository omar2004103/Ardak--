import React, { useState, useMemo } from 'react';
import { Listing, SearchFilters } from '../../types/listing.ts';
import { SearchFiltersSidebar } from './SearchFiltersSidebar.tsx';
import { MobileFiltersModal } from './MobileFiltersModal.tsx';
import { ListingCard } from '../listings/ListingCard.tsx';
import { LandsMap } from './LandsMap.tsx';
import {
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
  SearchX,
  RotateCcw,
  Sparkles,
  MapPin,
  X,
  LayoutGrid,
  Map as MapIcon,
  Columns2,
} from 'lucide-react';

interface SearchPageProps {
  initialFilters?: SearchFilters;
  allListings: Listing[];
  onNavigateHome: () => void;
  onViewDetails: (listing: Listing) => void;
  comparedIds?: string[];
  onToggleCompare?: (listing: Listing) => void;
}

type SortOption = 'latest' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc';
type ViewMode = 'grid' | 'map' | 'split';

const initialDefaultFilters: SearchFilters = {
  operationType: '',
  governorate: '',
  city: '',
  minArea: '',
  maxArea: '',
  maxPrice: '',
  propertyType: '',
};

export const SearchPage: React.FC<SearchPageProps> = ({
  initialFilters,
  allListings,
  onNavigateHome,
  onViewDetails,
  comparedIds = [],
  onToggleCompare,
}) => {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || initialDefaultFilters
  );

  // Sync when initialFilters changes (e.g. from Hero or Categories)
  React.useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMapListing, setSelectedMapListing] = useState<Listing | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.operationType) count++;
    if (filters.governorate && filters.governorate !== 'الكل') count++;
    if (filters.city.trim()) count++;
    if (filters.minArea) count++;
    if (filters.maxArea) count++;
    if (filters.maxPrice) count++;
    if (filters.propertyType && filters.propertyType !== 'الكل') count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialDefaultFilters);
  };

  // Client-side filtering
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      // Operation Type (بيع / إيجار)
      if (filters.operationType && item.listingType !== filters.operationType) {
        return false;
      }

      // Governorate
      if (
        filters.governorate &&
        filters.governorate !== 'الكل' &&
        item.governorate !== filters.governorate
      ) {
        return false;
      }

      // City / District text match
      if (filters.city && filters.city.trim()) {
        const query = filters.city.trim().toLowerCase();
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesTitle = item.title.toLowerCase().includes(query);
        if (!matchesCity && !matchesTitle) {
          return false;
        }
      }

      // Property Type
      if (
        filters.propertyType &&
        filters.propertyType !== 'الكل' &&
        item.propertyType !== filters.propertyType
      ) {
        return false;
      }

      // Min Area
      if (filters.minArea) {
        const minA = parseFloat(filters.minArea);
        if (!isNaN(minA) && item.area < minA) {
          return false;
        }
      }

      // Max Area
      if (filters.maxArea) {
        const maxA = parseFloat(filters.maxArea);
        if (!isNaN(maxA) && item.area > maxA) {
          return false;
        }
      }

      // Max Price
      if (filters.maxPrice) {
        const maxP = parseFloat(filters.maxPrice);
        if (!isNaN(maxP) && item.rawPrice > maxP) {
          return false;
        }
      }

      return true;
    });
  }, [allListings, filters]);

  // Client-side sorting
  const sortedListings = useMemo(() => {
    const list = [...filteredListings];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.rawPrice - b.rawPrice);
      case 'price-desc':
        return list.sort((a, b) => b.rawPrice - a.rawPrice);
      case 'area-asc':
        return list.sort((a, b) => a.area - b.area);
      case 'area-desc':
        return list.sort((a, b) => b.area - a.area);
      case 'latest':
      default:
        return list;
    }
  }, [filteredListings, sortBy]);

  return (
    <div className="bg-[#f7f9f8] min-h-[calc(100vh-140px)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
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
            <li className="text-[#14281d] font-bold" aria-current="page">
              البحث
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#166534] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
            <span>سوق الأراضي والمزارع في مصر</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14281d] tracking-tight">
            البحث عن الأراضي والمزارع
          </h1>
          <p className="text-sm sm:text-base text-[#527963] mt-1">
            أفضل فرص الأراضي والمزارع الزراعية المتاحة للبيع والإيجار في كافة محافظات مصر
          </p>
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden mb-5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#e2eae5] text-sm font-bold text-[#14281d] shadow-xs active:bg-[#f9fbf9] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#166534]" />
              <span>فلاتر البحث</span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#166534] text-white text-[11px] font-sans font-bold">
                  {activeCount} مفعّل
                </span>
              )}
            </div>
            <span className="text-xs text-[#166534] font-bold">
              تصفية النتائج ←
            </span>
          </button>
        </div>

        {/* Mobile Filters Modal */}
        <MobileFiltersModal
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          activeCount={activeCount}
          totalResultsCount={sortedListings.length}
        />

        {/* Two-Column Responsive Layout (RTL: Sidebar on Right, Results on Left) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar on Desktop (Order 1 in RTL = Right Side) */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28">
            <SearchFiltersSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              activeCount={activeCount}
            />
          </aside>

          {/* Results Area (Order 2 in RTL = Left Side) */}
          <main className="lg:col-span-3 space-y-6">
            {/* Results Control Bar: Count, Sort Dropdown & View Mode Switcher */}
            <div className="bg-white rounded-xl border border-[#e2eae5] px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-[#14281d] flex items-center gap-2">
                  <span>تم العثور على</span>
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#f0fdf4] text-[#166534] font-sans font-black text-sm border border-[#bbf7d0]">
                    {sortedListings.length}
                  </span>
                  <span>إعلانات</span>
                </div>

                {/* View Mode Toggle Buttons */}
                <div className="flex items-center gap-1 p-1 bg-[#f0f4f1] rounded-lg border border-[#e2eae5]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#166534] shadow-xs'
                        : 'text-[#527963] hover:text-[#166534]'
                    }`}
                    title="عرض الشبكة"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قائمة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'map'
                        ? 'bg-white text-[#166534] shadow-xs'
                        : 'text-[#527963] hover:text-[#166534]'
                    }`}
                    title="عرض الخريطة فقط"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>الخريطة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'split'
                        ? 'bg-white text-[#166534] shadow-xs'
                        : 'text-[#527963] hover:text-[#166534]'
                    }`}
                    title="عرض مشترك (خريطة وقائمة)"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>مشترك</span>
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-[#527963] font-medium flex items-center gap-1"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>الترتيب:</span>
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-1 focus:ring-[#166534] rounded-lg px-2.5 py-1.5 text-xs text-[#14281d] outline-hidden cursor-pointer"
                >
                  <option value="latest">الأحدث</option>
                  <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
                  <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
                  <option value="area-asc">المساحة: من الأقل إلى الأعلى</option>
                  <option value="area-desc">المساحة: من الأعلى إلى الأقل</option>
                </select>
              </div>
            </div>

            {/* Active Filters Badges Bar (Quiet and useful) */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#6b7280] font-medium">فلاتر مطبقة:</span>

                {filters.operationType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e2eae5] text-[#166534] font-semibold shadow-2xs">
                    <span>العملية: {filters.operationType}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, operationType: '' })}
                      className="hover:text-[#dc2626] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.governorate && filters.governorate !== 'الكل' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e2eae5] text-[#166534] font-semibold shadow-2xs">
                    <MapPin className="w-3 h-3 text-[#16a34a]" />
                    <span>المحافظة: {filters.governorate}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, governorate: '' })}
                      className="hover:text-[#dc2626] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.propertyType && filters.propertyType !== 'الكل' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e2eae5] text-[#166534] font-semibold shadow-2xs">
                    <span>النوع: {filters.propertyType}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, propertyType: '' })}
                      className="hover:text-[#dc2626] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.city.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e2eae5] text-[#166534] font-semibold shadow-2xs">
                    <span>المدينة: {filters.city}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, city: '' })}
                      className="hover:text-[#dc2626] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(filters.minArea || filters.maxArea) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e2eae5] text-[#166534] font-semibold shadow-2xs">
                    <span>
                      المساحة: {filters.minArea || '0'} - {filters.maxArea || '∞'} فدان
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, minArea: '', maxArea: '' })}
                      className="hover:text-[#dc2626] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.maxPrice && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e2eae5] text-[#166534] font-semibold shadow-2xs">
                    <span>أقصى سعر: {parseInt(filters.maxPrice, 10).toLocaleString()} ج.م</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, maxPrice: '' })}
                      className="hover:text-[#dc2626] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#dc2626] hover:underline font-semibold pr-1 cursor-pointer"
                >
                  مسح الكل
                </button>
              </div>
            )}

            {/* Results Grid / Map / Split or Empty State */}
            {sortedListings.length > 0 ? (
              <>
                {viewMode === 'map' && (
                  <div className="space-y-4">
                    <LandsMap
                      listings={sortedListings}
                      selectedListing={selectedMapListing}
                      onSelectListing={setSelectedMapListing}
                      onViewDetails={onViewDetails}
                      comparedIds={comparedIds}
                      onToggleCompare={onToggleCompare}
                    />
                    <div className="p-3 bg-white rounded-xl border border-[#e2eae5] text-xs text-[#527963] flex items-center justify-between">
                      <span>
                        💡 انقر على أي دبوس زراعي لعرض ملخص الأرض والاتصال بالمالك أو إضافتها للمقارنة.
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className="text-[#166534] font-bold hover:underline cursor-pointer"
                      >
                        العودة لعرض القائمة ←
                      </button>
                    </div>
                  </div>
                )}

                {viewMode === 'split' && (
                  <div className="space-y-6">
                    <LandsMap
                      listings={sortedListings}
                      selectedListing={selectedMapListing}
                      onSelectListing={setSelectedMapListing}
                      onViewDetails={onViewDetails}
                      comparedIds={comparedIds}
                      onToggleCompare={onToggleCompare}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sortedListings.map((listing) => (
                        <div
                          key={listing.id}
                          className={
                            selectedMapListing?.id === listing.id
                              ? 'ring-2 ring-[#166534] rounded-2xl'
                              : ''
                          }
                          onClick={() => setSelectedMapListing(listing)}
                        >
                          <ListingCard
                            listing={listing}
                            onViewDetails={onViewDetails}
                            isComparing={comparedIds.includes(listing.id)}
                            onToggleCompare={onToggleCompare}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onViewDetails={onViewDetails}
                        isComparing={comparedIds.includes(listing.id)}
                        onToggleCompare={onToggleCompare}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Clean Empty State as Required */
              <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center my-6 space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mx-auto">
                  <SearchX className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#14281d]">
                    لا توجد نتائج مطابقة
                  </h3>
                  <p className="text-sm text-[#527963] mt-1 max-w-sm mx-auto">
                    جرّب تغيير الفلاتر أو البحث في محافظة أخرى
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>مسح الفلاتر</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Mobile Filter Button */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#86efac]" />
            <span>تصفية النتائج</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#166534] font-sans font-black text-[11px] flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
