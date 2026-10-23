import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Maximize2,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Briefcase,
  HelpCircle,
  FileCheck2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { RequestCard } from './RequestCard.tsx';
import { LandPurchaseRequest, PurchaseRequestCategory } from '../../types/purchaseRequest.ts';
import { egyptianGovernorates } from '../../data/listings.ts';

interface PurchaseRequestsPageProps {
  onOpenCreateRequest: () => void;
  onOpenRequestDetails: (request: LandPurchaseRequest) => void;
  onSubmitOffer: (request: LandPurchaseRequest) => void;
  onNavigateToMyRequests: () => void;
}

const CATEGORIES: PurchaseRequestCategory[] = [
  'أرض زراعية',
  'مزرعة',
  'أرض استصلاح',
  'أرض سكنية',
  'أرض تجارية',
  'استثمارية',
];

export const PurchaseRequestsPage: React.FC<PurchaseRequestsPageProps> = ({
  onOpenCreateRequest,
  onOpenRequestDetails,
  onSubmitOffer,
  onNavigateToMyRequests,
}) => {
  const { purchaseRequests, isLoadingRequests, currentUser } = useApp();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'offers' | 'area_asc' | 'area_desc'>('newest');

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    return purchaseRequests
      .filter((req) => {
        // Only visible and open or unhidden
        if (req.moderationStatus !== 'visible') return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchTitle = req.title.toLowerCase().includes(q);
          const matchCity = req.city.toLowerCase().includes(q);
          const matchGov = req.governorate.toLowerCase().includes(q);
          const matchDesc = req.description ? req.description.toLowerCase().includes(q) : false;
          const matchPurpose = req.purpose.toLowerCase().includes(q);
          if (!matchTitle && !matchCity && !matchGov && !matchDesc && !matchPurpose) {
            return false;
          }
        }

        // Governorate
        if (selectedGovernorate && req.governorate !== selectedGovernorate) {
          return false;
        }

        // Category
        if (selectedCategory && req.category !== selectedCategory) {
          return false;
        }

        // Min Area
        if (minArea && req.areaMax < parseFloat(minArea)) {
          return false;
        }

        // Max Area
        if (maxArea && req.areaMin > parseFloat(maxArea)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'offers') {
          return (b.offerCount || 0) - (a.offerCount || 0);
        }
        if (sortBy === 'area_asc') {
          return a.areaMin - b.areaMin;
        }
        if (sortBy === 'area_desc') {
          return b.areaMax - a.areaMax;
        }
        return 0;
      });
  }, [
    purchaseRequests,
    searchQuery,
    selectedGovernorate,
    selectedCategory,
    minArea,
    maxArea,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGovernorate('');
    setSelectedCategory('');
    setMinArea('');
    setMaxArea('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedGovernorate) ||
    Boolean(selectedCategory) ||
    Boolean(minArea) ||
    Boolean(maxArea);

  return (
    <div className="min-h-screen bg-[#f8faf8] pb-16" dir="rtl">
      {/* Hero Banner */}
      <section className="bg-gradient-to-l from-[#14532d] via-[#166534] to-[#1e7840] text-white py-10 sm:py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              سوق طلبات الأراضي الأول في مصر
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              طلبات شراء الأراضي والمزارع
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              أصحاب الأراضي والمزارع يبحثون عنك! اطرح طلبك وحدد المساحة والمحافظة والمواصفات وسيتواصل معك الملاك وأصحاب العروض المناسبة مباشرة دون وسطاء.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenCreateRequest}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 text-stone-950" />
              <span>أضف طلب شراء أرض</span>
            </button>

            {currentUser && (
              <button
                onClick={onNavigateToMyRequests}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2 transition-all"
              >
                <Briefcase className="w-4 h-4 text-emerald-200" />
                <span>طلباتي وعروضي</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl font-black text-white block">
              {purchaseRequests.filter((r) => r.status === 'open').length}
            </span>
            <span className="text-xs text-emerald-200">طلب شراء نشط</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl font-black text-white block">
              {new Set(purchaseRequests.map((r) => r.governorate)).size || 16}
            </span>
            <span className="text-xs text-emerald-200">محافظة مغطاة</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl font-black text-white block">
              {purchaseRequests.reduce((acc, r) => acc + (r.offerCount || 0), 0)}
            </span>
            <span className="text-xs text-emerald-200">عرض أرض مقدم</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl font-black text-white block">0%</span>
            <span className="text-xs text-emerald-200">عمولة سمسرة</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        {/* Search & Filters Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالكلمات، المركز، المحافظة، الغرض..."
                className="w-full pr-11 pl-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all text-right"
              />
            </div>

            {/* Governorate Filter */}
            <div className="w-full lg:w-52">
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-xs font-semibold text-gray-700"
              >
                <option value="">جميع المحافظات</option>
                {egyptianGovernorates.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-xs font-semibold text-gray-700"
              >
                <option value="">جميع الأنواع</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-xs font-semibold text-gray-700"
              >
                <option value="newest">الأحدث نشرًا</option>
                <option value="offers">الأكثر عروضاً</option>
                <option value="area_asc">المساحة: من الأصغر</option>
                <option value="area_desc">المساحة: من الأكبر</option>
              </select>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>

          {/* Secondary Filter Row (Area range) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              تصفية بالمساحة:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="الحد الأدنى"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-24 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-right"
              />
              <span>إلى</span>
              <input
                type="number"
                placeholder="الحد الأقصى"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="w-24 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-right"
              />
              <span className="text-gray-400 font-medium">فدان</span>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-gray-600 px-1">
          <p className="font-bold text-gray-800">
            تم العثور على{' '}
            <span className="text-[#166534] font-extrabold text-sm">
              {filteredRequests.length}
            </span>{' '}
            طلب شراء متاح
          </p>

          <span className="text-gray-500">
            يتم تحديث الطلبات والعروض تلقائياً
          </span>
        </div>

        {/* Requests Grid */}
        {isLoadingRequests ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-gray-200 animate-pulse space-y-4"
              >
                <div className="h-5 bg-gray-200 rounded-lg w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="h-14 bg-gray-100 rounded-2xl"></div>
                  <div className="h-14 bg-gray-100 rounded-2xl"></div>
                </div>
                <div className="h-9 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-200 shadow-sm max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">
                {hasActiveFilters ? 'لا توجد طلبات تطابق الفلاتر الحالية' : 'لا توجد طلبات شراء منشورة حالياً'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                {hasActiveFilters
                  ? 'جرب تقليل شروط البحث أو توسيع نطاق المساحة والمحافظة لعرض المزيد من الطلبات.'
                  : 'كن أول من ينشر طلب شراء أرض أو مزرعة بمواصفاتك وسيتواصل معك الملاك وأصحاب الأراضي.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {hasActiveFilters ? (
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all"
                >
                  إعادة ضبط الفلاتر
                </button>
              ) : null}
              <button
                onClick={onOpenCreateRequest}
                className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>أضف طلب شراء جديد</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onViewDetails={onOpenRequestDetails}
                onSubmitOffer={onSubmitOffer}
                isOwner={currentUser?.id === request.buyerId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
