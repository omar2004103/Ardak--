import React, { useState } from 'react';
import { Listing } from '../../types/listing.ts';
import { ListingCard } from './ListingCard.tsx';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface LatestListingsSectionProps {
  listings: Listing[];
  onViewDetails?: (listing: Listing) => void;
  onNavigateToSearch?: () => void;
  comparedIds?: string[];
  onToggleCompare?: (listing: Listing) => void;
}

export const LatestListingsSection: React.FC<LatestListingsSectionProps> = ({
  listings,
  onViewDetails,
  onNavigateToSearch,
  comparedIds = [],
  onToggleCompare,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'بيع' | 'إيجار'>('all');

  const filteredListings = listings.filter((item) => {
    if (filterType === 'all') return true;
    return item.listingType === filterType;
  });

  return (
    <section id="listings" className="py-16 sm:py-20 bg-[#f7f9f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>فرص زراعية مميزة ومحدثة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14281d] tracking-tight">
              أحدث الأراضي المعروضة
            </h2>
            <p className="text-sm sm:text-base text-[#527963] mt-1">
              إعلانات تجريبية لعرض شكل المنصة
            </p>
          </div>

          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-[#e8eee9] rounded-xl self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-[#4b6354] hover:text-[#166534]'
              }`}
            >
              الكل ({listings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('بيع')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'بيع'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-[#4b6354] hover:text-[#166534]'
              }`}
            >
              للبيع فقط
            </button>
            <button
              type="button"
              onClick={() => setFilterType('إيجار')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'إيجار'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-[#4b6354] hover:text-[#166534]'
              }`}
            >
              للإيجار فقط
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onViewDetails={onViewDetails}
              isComparing={comparedIds.includes(listing.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>

        {/* Bottom Explorer CTA */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onNavigateToSearch}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#166534] hover:text-[#14532d] p-2 transition-colors group cursor-pointer"
          >
            <span>البحث بالمزيد من المعايير والمحافظات في صفحة البحث</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
