import React from 'react';
import { Listing } from '../../types/listing.ts';
import { MapPin, Maximize2, Phone, MessageSquare, Eye, Layers, Scale, Heart, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface ListingCardProps {
  listing: Listing;
  onViewDetails?: (listing: Listing) => void;
  isComparing?: boolean;
  onToggleCompare?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onViewDetails,
  isComparing = false,
  onToggleCompare,
}) => {
  const { isFavorite, toggleFavorite } = useApp();
  const favorited = isFavorite(listing.id);
  // SVG Graphic placeholder themes based on Egyptian agricultural landscape
  const renderPlaceholderGraphic = () => {
    switch (listing.imagePlaceholder.theme) {
      case 'citrus':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#166534] via-[#15803d] to-[#047857] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            {/* Landscape topography lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 60 Q 25 45, 50 65 T 100 50 L 100 100 L 0 100 Z" fill="currentColor" />
              <path d="M0 75 Q 35 60, 70 80 T 100 70 L 100 100 L 0 100 Z" fill="#000" opacity="0.25" />
            </svg>
            <div className="relative z-10 text-center">
              <span className="text-3xl mb-1 block">🍊</span>
              <p className="text-sm font-bold text-white/95">{listing.imagePlaceholder.tag}</p>
              <span className="text-[11px] text-white/75 mt-0.5 inline-block">ري حديث بالتنقيط وموالح</span>
            </div>
          </div>
        );
      case 'livestock':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2e4d3a] via-[#3f674d] to-[#1e3b28] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 70 Q 30 55, 60 70 T 100 60 L 100 100 L 0 100 Z" fill="currentColor" />
            </svg>
            <div className="relative z-10 text-center">
              <span className="text-3xl mb-1 block">🏡</span>
              <p className="text-sm font-bold text-white/95">{listing.imagePlaceholder.tag}</p>
              <span className="text-[11px] text-white/75 mt-0.5 inline-block">عنابر واستراحة متكاملة</span>
            </div>
          </div>
        );
      case 'desert-reclamation':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#855e2d] via-[#6d4c20] to-[#166534] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 65 Q 40 40, 75 60 T 100 55 L 100 100 L 0 100 Z" fill="currentColor" />
            </svg>
            <div className="relative z-10 text-center">
              <span className="text-3xl mb-1 block">🚜</span>
              <p className="text-sm font-bold text-white/95">{listing.imagePlaceholder.tag}</p>
              <span className="text-[11px] text-white/75 mt-0.5 inline-block">طاقة شمسية وآبار عذبة</span>
            </div>
          </div>
        );
      case 'palms':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 68 Q 20 50, 60 70 T 100 65 L 100 100 L 0 100 Z" fill="currentColor" />
            </svg>
            <div className="relative z-10 text-center">
              <span className="text-3xl mb-1 block">🌴</span>
              <p className="text-sm font-bold text-white/95">{listing.imagePlaceholder.tag}</p>
              <span className="text-[11px] text-white/75 mt-0.5 inline-block">نخيل بارحي مثمر وفيلا</span>
            </div>
          </div>
        );
      case 'delta':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f4c2c] via-[#1b6b3e] to-[#2e8b57] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 72 Q 40 55, 80 75 T 100 68 L 100 100 L 0 100 Z" fill="currentColor" />
            </svg>
            <div className="relative z-10 text-center">
              <span className="text-3xl mb-1 block">🌾</span>
              <p className="text-sm font-bold text-white/95">{listing.imagePlaceholder.tag}</p>
              <span className="text-[11px] text-white/75 mt-0.5 inline-block">تربة دلتاوية طميية غنية</span>
            </div>
          </div>
        );
    }
  };

  const isRent = listing.listingType === 'إيجار';

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
        isComparing
          ? 'border-[#166534] ring-2 ring-[#166534]/50'
          : 'border-[#e2eae5]'
      }`}
    >
      <div>
        {/* Card Visual Header with Badges */}
        <div className="h-48 relative overflow-hidden bg-[#e8f1ec]">
          {renderPlaceholderGraphic()}

          {/* Listing Type & Trust Badges */}
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
            {/* Contrasting Transaction Badge: Green for Sale, Blue for Rent */}
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black shadow-md border tracking-wide transition-all ${
                isRent
                  ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white border-[#38bdf8]/40 ring-1 ring-black/10'
                  : 'bg-[#166534] hover:bg-[#14532d] text-white border-[#4ade80]/40 ring-1 ring-black/10'
              }`}
            >
              <span className="text-[11px]">{isRent ? '🔑' : '🏷️'}</span>
              <span>{isRent ? 'للإيجار' : 'للبيع'}</span>
            </span>

            {/* Verified Trust Badge */}
            {listing.isVerified && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-white/95 text-[#059669] border border-white/60 shadow-md backdrop-blur-xs"
                title="إعلان موثق وبيانات مدققة"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span className="hidden sm:inline">موثق</span>
              </span>
            )}
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-3.5 left-3.5 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-xs text-[#166534] border border-white/40 shadow-xs">
              <Layers className="w-3 h-3 text-[#16a34a]" />
              {listing.propertyType}
            </span>
          </div>

          {/* Compare Toggle Button */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(listing);
              }}
              className={`absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isComparing
                  ? 'bg-[#166534] text-white ring-2 ring-white'
                  : 'bg-white/90 backdrop-blur-xs text-[#14281d] hover:bg-white hover:text-[#166534] border border-white/50'
              }`}
              title={isComparing ? 'إلغاء من المقارنة' : 'إضافة إلى المقارنة'}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isComparing ? 'في المقارنة ✓' : '+ مقارنة'}</span>
            </button>
          )}

          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(listing.id);
            }}
            className={`absolute bottom-3 right-3 z-20 p-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
              favorited
                ? 'bg-[#fee2e2] text-[#e11d48] border border-[#fca5a5]'
                : 'bg-white/90 backdrop-blur-xs text-[#6b7280] hover:text-[#e11d48] border border-white/50'
            }`}
            title={favorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-label={favorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#e11d48]' : ''}`} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Location details & Advertiser type */}
          <div className="flex items-center justify-between text-xs text-[#527963] font-medium mb-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
              <span className="truncate">
                {listing.governorate} · {listing.city}
              </span>
            </div>
            {listing.advertiserType && (
              <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                {listing.advertiserType}
              </span>
            )}
          </div>

          {/* Card Title */}
          <h3 className="text-lg font-bold text-[#14281d] line-clamp-1 mb-3 group-hover:text-[#166534] transition-colors">
            {listing.title}
          </h3>

          {/* Key Specs: Area & Price */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#edf3ef] my-3">
            <div>
              <span className="block text-[11px] text-[#6b7280]">المساحة</span>
              <span className="text-sm font-bold text-[#14281d] flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-[#16a34a]" />
                <span className="font-sans font-semibold">{listing.area}</span> {listing.areaUnit}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-[#6b7280]">السعر المطلوب</span>
              <span className="text-sm font-extrabold text-[#166534] font-sans">
                {listing.price}
              </span>
            </div>
          </div>

          {/* Features bullet preview */}
          {listing.features && listing.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {listing.features.slice(0, 2).map((feature, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-[#3f5f4b] bg-[#f0f7f3] px-2 py-0.5 rounded-sm"
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-2 border-t border-[#f0f4f2] bg-[#fafcfb]">
        <div className="grid grid-cols-3 gap-2">
          {/* Details button */}
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(listing)}
            className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] font-bold text-xs border border-[#bbf7d0] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>التفاصيل</span>
          </button>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/${listing.whatsappNumber}?text=${encodeURIComponent(
              `مرحباً، أستفسر بخصوص إعلان: ${listing.title} على منصة أرضك`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#15803d] font-bold text-xs border border-[#86efac] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#16a34a]" />
            <span>واتساب</span>
          </a>

          {/* Call button */}
          <a
            href={`tel:${listing.contactPhone}`}
            className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>اتصال</span>
          </a>
        </div>
      </div>
    </div>
  );
};
