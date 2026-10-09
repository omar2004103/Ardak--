import React from 'react';
import { Listing } from '../../types/listing.ts';
import { useApp } from '../../context/AppContext.tsx';
import { ListingCard } from '../listings/ListingCard.tsx';
import { Heart, Search, ChevronLeft } from 'lucide-react';

interface FavoritesPageProps {
  onViewDetails: (listing: Listing) => void;
  onNavigateToSearch: () => void;
  onNavigateHome: () => void;
  comparedIds?: string[];
  onToggleCompare?: (listing: Listing) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onViewDetails,
  onNavigateToSearch,
  onNavigateHome,
  comparedIds = [],
  onToggleCompare,
}) => {
  const { listings, favorites } = useApp();

  const favoriteListings = listings.filter((item) => favorites.includes(item.id));

  return (
    <div className="py-8 sm:py-12 bg-[#f7f9f8] min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
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
            <li className="text-[#14281d] font-bold">المفضلة</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e11d48] mb-1">
            <Heart className="w-4 h-4 fill-[#e11d48]" />
            <span>الأراضي المحفوظة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14281d]">
            قائمة المفضلة ({favoriteListings.length})
          </h1>
          <p className="text-sm text-[#527963] mt-1">
            العقارات والأراضي الزراعية التي قمت بحفظها للرجوع إليها ومقارنتها لاحقاً.
          </p>
        </div>

        {/* Listings Grid */}
        {favoriteListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {favoriteListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={onViewDetails}
                isComparing={comparedIds.includes(listing.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center my-6 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#fee2e2] text-[#e11d48] flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#14281d]">قائمة المفضلة فارغة حالياً</h3>
              <p className="text-xs text-[#527963] mt-1 max-w-sm mx-auto">
                تصفح آلاف الأراضي والمزارع واضغط على رمز القلب لحفظ الأراضي المفضلة لديك هنا.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToSearch}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>استكشاف الأراضي والمزارع</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
