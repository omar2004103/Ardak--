import React, { useState } from 'react';
import { Listing } from '../../types/listing.ts';
import { useApp } from '../../context/AppContext.tsx';
import { ListingCard } from '../listings/ListingCard.tsx';
import {
  Heart,
  Search,
  ChevronLeft,
  Bell,
  BellRing,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  LogIn,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

interface FavoritesPageProps {
  onViewDetails: (listing: Listing) => void;
  onNavigateToSearch: () => void;
  onNavigateHome: () => void;
  comparedIds?: string[];
  onToggleCompare?: (listing: Listing) => void;
  onOpenLogin?: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onViewDetails,
  onNavigateToSearch,
  onNavigateHome,
  comparedIds = [],
  onToggleCompare,
  onOpenLogin,
}) => {
  const {
    listings,
    favorites,
    currentUser,
    priceAlerts,
    togglePriceAlert,
    isPriceAlertActive,
    toggleAllFavoritesPriceAlerts,
  } = useApp();

  const [filterAlertedOnly, setFilterAlertedOnly] = useState(false);
  const [justToggledNotice, setJustToggledNotice] = useState<string | null>(null);

  const favoriteListings = listings.filter((item) => favorites.includes(item.id));

  // Count how many favorited listings currently have active price alerts
  const alertedFavoritesCount = favoriteListings.filter((item) =>
    priceAlerts.includes(item.id)
  ).length;

  const allFavoritesAlerted =
    favoriteListings.length > 0 && alertedFavoritesCount === favoriteListings.length;

  const displayedListings = filterAlertedOnly
    ? favoriteListings.filter((item) => priceAlerts.includes(item.id))
    : favoriteListings;

  const handleToggleAll = () => {
    if (!currentUser && onOpenLogin) {
      onOpenLogin();
      return;
    }
    const enabled = toggleAllFavoritesPriceAlerts();
    setJustToggledNotice(
      enabled
        ? `تم بنجاح تفعيل تنبيهات انخفاض الأسعار لجميع أراضي المفضلة (${favoriteListings.length} أراضي)!`
        : 'تم إلغاء تفعيل تنبيهات انخفاض الأسعار لأراضي المفضلة.'
    );
    setTimeout(() => setJustToggledNotice(null), 3500);
  };

  return (
    <div className="py-8 sm:py-12 bg-[#f7f9f8] min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumbs */}
        <nav aria-label="مسار التنقل">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#e11d48] mb-1">
              <Heart className="w-4 h-4 fill-[#e11d48]" />
              <span>الأراضي المحفوظة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#14281d]">
              قائمة المفضلة ({favoriteListings.length})
            </h1>
            <p className="text-sm text-[#527963] mt-1">
              العقارات والأراضي الزراعية التي قمت بحفظها للرجوع إليها وتتبع أسعارها ومقارنتها لاحقاً.
            </p>
          </div>

          {/* Quick Filters / Counts */}
          {favoriteListings.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterAlertedOnly(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !filterAlertedOnly
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                الكل ({favoriteListings.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterAlertedOnly(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterAlertedOnly
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>المفعّل لها تنبيه ({alertedFavoritesCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Notice feedback if toggled */}
        {justToggledNotice && (
          <div className="p-3.5 rounded-2xl bg-[#dcfce7] border border-[#86efac] text-[#166534] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>{justToggledNotice}</span>
          </div>
        )}

        {/* PRICE DROP ALERTS CONTROL CARD FOR REGISTERED USERS */}
        {favoriteListings.length > 0 && (
          <div className="bg-gradient-to-br from-white via-[#fcfdfc] to-[#f0fdf4] rounded-2xl border-2 border-[#bbf7d0] p-5 sm:p-6 shadow-xs relative overflow-hidden">
            {/* Background decorative accent */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#16a34a]/10 pointer-events-none blur-2xl" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#166534] flex items-center justify-center border border-[#86efac] shadow-2xs">
                    <BellRing className="w-5 h-5 text-[#16a34a] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[#14281d]">
                        تنبيهات انخفاض الأسعار للأراضي المحفوظة
                      </h3>
                      {currentUser ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#dcfce7] text-[#15803d] border border-[#86efac]">
                          <Sparkles className="w-3 h-3 text-[#16a34a]" />
                          <span>خاصية الأعضاء المسجلين مفعّلة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                          <span>تسجيل الدخول مطلوب</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#527963] leading-relaxed">
                  فعّل هذا الخيار ليصلك إشعار فوري وتنبيه على المنصة بمجرد قيام أي مالك أو وسيط
                  بتخفيض سعر أي أرض أو مزرعة قمت بحفظها في مفضلتك، لتكون أول من يقتنص الفرص
                  الاستثمارية المخفضة.
                </p>

                {/* Status indicator badges */}
                <div className="flex items-center gap-3 pt-1 text-xs text-[#374151] flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span>حالة التنبيهات:</span>
                    <strong
                      className={`px-2 py-0.5 rounded-md font-sans text-xs ${
                        alertedFavoritesCount > 0
                          ? 'bg-[#dcfce7] text-[#166534]'
                          : 'bg-[#f3f4f6] text-[#6b7280]'
                      }`}
                    >
                      {alertedFavoritesCount} من أصل {favoriteListings.length} أراضي مفعّلة
                    </strong>
                  </span>

                  {allFavoritesAlerted && (
                    <span className="inline-flex items-center gap-1 text-[#15803d] text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>جميع الأراضي في المفضلة مشمولة بالتنبيه الفوري</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions & Toggles */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleAll}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                        allFavoritesAlerted
                          ? 'bg-white border-2 border-[#dc2626]/40 text-[#dc2626] hover:bg-[#fee2e2]/40'
                          : 'bg-[#166534] hover:bg-[#14532d] text-white hover:shadow-md'
                      }`}
                    >
                      {allFavoritesAlerted ? (
                        <>
                          <Bell className="w-4 h-4 text-[#dc2626]" />
                          <span>إلغاء تفعيل تنبيهات الأسعار للكل</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="w-4 h-4 text-white" />
                          <span>تفعيل تنبيهات انخفاض الأسعار لكل المفضلة</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 text-center sm:text-right">
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer w-full"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول لتفعيل التنبيهات</span>
                    </button>
                    <span className="block text-[11px] text-[#527963]">
                      متاح للأعضاء المسجلين برقم الهاتف أو Google
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {displayedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedListings.map((listing) => {
              const alertActive = isPriceAlertActive(listing.id);

              return (
                <div key={listing.id} className="flex flex-col space-y-2">
                  {/* Price Alert Quick Action Ribbon on top of card */}
                  <div
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      alertActive
                        ? 'bg-[#dcfce7] border-[#86efac] text-[#15803d]'
                        : 'bg-white border-[#e2eae5] text-[#6b7280]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {alertActive ? (
                        <>
                          <BellRing className="w-3.5 h-3.5 text-[#16a34a] animate-bounce" />
                          <span>تنبيه انخفاض السعر: مفعّل ✓</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-[#9ca3af]" />
                          <span>تنبيه السعر غير مفعّل</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser && onOpenLogin) {
                            onOpenLogin();
                            return;
                          }
                          togglePriceAlert(listing.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          alertActive
                            ? 'bg-white border border-[#86efac] text-[#166534] hover:bg-[#fee2e2] hover:text-[#dc2626] hover:border-[#fca5a5]'
                            : 'bg-[#166534] text-white hover:bg-[#14532d]'
                        }`}
                      >
                        {alertActive ? 'إلغاء التنبيه' : 'تفعيل التنبيه'}
                      </button>
                    </div>
                  </div>

                  <ListingCard
                    listing={listing}
                    onViewDetails={onViewDetails}
                    isComparing={comparedIds.includes(listing.id)}
                    onToggleCompare={onToggleCompare}
                  />
                </div>
              );
            })}
          </div>
        ) : favoriteListings.length > 0 && filterAlertedOnly ? (
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-10 text-center space-y-3">
            <Bell className="w-10 h-10 text-[#9ca3af] mx-auto" />
            <h3 className="text-base font-bold text-[#14281d]">
              لا توجد أراضٍ مفعّل لها تنبيهات أسعار حالياً
            </h3>
            <p className="text-xs text-[#527963]">
              يمكنك الضغط على زر "تفعيل تنبيهات انخفاض الأسعار لكل المفضلة" أعلاه لتفعيلها لجميع
              أراضيك.
            </p>
            <button
              type="button"
              onClick={handleToggleAll}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              تفعيل التنبيهات الآن
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center my-6 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#fee2e2] text-[#e11d48] flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#14281d]">قائمة المفضلة فارغة حالياً</h3>
              <p className="text-xs text-[#527963] mt-1 max-w-sm mx-auto">
                تصفح آلاف الأراضي والمزارع واضغط على رمز القلب لحفظ الأراضي المفضلة لديك وتفعيل
                تنبيهات انخفاض أسعارها مباشرة.
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
