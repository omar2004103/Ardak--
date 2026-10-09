import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Listing } from '../../types/listing.ts';
import { MapPin, Maximize2, Eye, Phone, MessageSquare, Sprout, Layers, Scale } from 'lucide-react';

interface LandsMapProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing | null) => void;
  onViewDetails: (listing: Listing) => void;
  comparedIds?: string[];
  onToggleCompare?: (listing: Listing) => void;
}

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyBpbVTjB5tcowp2v5bGUrDW2Cnz88IPJSI';

// Helper component to auto-fit map bounds to visible listings
const MapBoundsFitter: React.FC<{ listings: Listing[] }> = ({ listings }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || listings.length === 0) return;

    if (listings.length === 1) {
      map.setCenter(listings[0].location);
      map.setZoom(10);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    listings.forEach((item) => {
      bounds.extend(item.location);
    });
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, listings]);

  return null;
};

export const LandsMap: React.FC<LandsMapProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  onViewDetails,
  comparedIds = [],
  onToggleCompare,
}) => {
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  // Sync selected listing if changed from outside
  useEffect(() => {
    if (selectedListing) {
      setActiveListing(selectedListing);
    }
  }, [selectedListing]);

  // Default center: Egypt
  const defaultCenter = { lat: 29.8, lng: 30.8 };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] rounded-2xl overflow-hidden border border-[#e2eae5] shadow-xs bg-[#eef3f0]">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="ar" region="EG">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={6.5}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          <MapBoundsFitter listings={listings} />

          {/* Markers for filtered lands */}
          {listings.map((item) => {
            const isSelected = activeListing?.id === item.id;
            const isRent = item.listingType === 'إيجار';

            return (
              <AdvancedMarker
                key={item.id}
                position={item.location}
                title={item.title}
                onClick={() => {
                  setActiveListing(item);
                  onSelectListing(item);
                }}
              >
                {/* Custom Egyptian Agricultural Pin */}
                <div
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer transform -translate-y-1/2 ${
                    isSelected
                      ? 'scale-115 ring-3 ring-white bg-[#14532d] z-30'
                      : isRent
                      ? 'bg-[#d97706] hover:bg-[#b45309] hover:scale-105 z-20'
                      : 'bg-[#166534] hover:bg-[#14532d] hover:scale-105 z-20'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 text-[#86efac]" />
                  <span className="font-sans whitespace-nowrap text-[11px]">
                    {item.area} {item.areaUnit}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow on Marker Click */}
          {activeListing && (
            <InfoWindow
              position={activeListing.location}
              onCloseClick={() => {
                setActiveListing(null);
                onSelectListing(null);
              }}
              headerContent={
                <div className="font-bold text-xs text-[#166534] flex items-center gap-1">
                  <span>{activeListing.governorate}</span>
                  <span>·</span>
                  <span>{activeListing.city}</span>
                </div>
              }
            >
              <div className="p-1 max-w-[260px] text-right font-sans" dir="rtl">
                {/* Badges */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs ${
                      activeListing.listingType === 'إيجار'
                        ? 'bg-[#0284c7]'
                        : 'bg-[#166534]'
                    }`}
                  >
                    {activeListing.listingType === 'بيع' ? 'للبيع' : 'للإيجار'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                    <Layers className="w-3 h-3 text-[#16a34a]" />
                    {activeListing.propertyType}
                  </span>
                  {activeListing.isVerified && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                      ✓ موثق
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-bold text-sm text-[#14281d] leading-snug mb-2 line-clamp-2">
                  {activeListing.title}
                </h4>

                {/* Specs */}
                <div className="bg-[#f7faf8] p-2 rounded-lg border border-[#e2eae5] mb-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#527963]">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-[#16a34a]" />
                      <span>المساحة:</span>
                    </span>
                    <span className="font-bold text-[#14281d]">
                      {activeListing.area} {activeListing.areaUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#527963]">
                    <span>السعر:</span>
                    <span className="font-extrabold text-[#166534]">
                      {activeListing.price}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={() => onToggleCompare(activeListing)}
                      className={`col-span-2 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                        comparedIds.includes(activeListing.id)
                          ? 'bg-[#166534] text-white border-[#166534]'
                          : 'bg-[#f8faf8] text-[#14281d] hover:bg-[#eef3f0] border-[#d1d5db]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>
                        {comparedIds.includes(activeListing.id)
                          ? 'في المقارنة ✓'
                          : '+ إضافة للمقارنة'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewDetails(activeListing)}
                    className="col-span-2 py-1.5 px-3 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض كامل التفاصيل</span>
                  </button>

                  <a
                    href={`https://wa.me/${activeListing.whatsappNumber}?text=${encodeURIComponent(
                      `مرحباً، أستفسر عن إعلان: ${activeListing.title} على خريطة أرضك`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 rounded-lg bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#15803d] text-[11px] font-bold flex items-center justify-center gap-1 border border-[#86efac] transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-[#16a34a]" />
                    <span>واتساب</span>
                  </a>

                  <a
                    href={`tel:${activeListing.contactPhone}`}
                    className="py-1.5 px-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] text-[11px] font-bold flex items-center justify-center gap-1 border border-[#bbf7d0] transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#16a34a]" />
                    <span>اتصال</span>
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Legend / Counter Overlay */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#e2eae5] shadow-sm text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#166534]" />
          <span className="font-bold text-[#14281d]">
            {listings.length} أرض على الخريطة
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 border-r border-[#e2eae5] pr-2 mr-1">
          <span className="flex items-center gap-1 text-[11px] text-[#527963]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534]"></span>
            <span>بيع</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#527963]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
            <span>إيجار</span>
          </span>
        </div>
      </div>
    </div>
  );
};
