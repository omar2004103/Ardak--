import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BellRing, X, TrendingDown, Eye } from 'lucide-react';

interface PriceDropToastProps {
  onViewListing?: (listingId: string) => void;
}

export const PriceDropToast: React.FC<PriceDropToastProps> = ({ onViewListing }) => {
  const { activeToast, clearActiveToast } = useApp();

  if (!activeToast) return null;

  return (
    <div
      className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-2 border-[#16a34a] p-4 animate-in slide-in-from-bottom-5 duration-300 text-right"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0 border border-[#86efac]">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded-md">
              تنبيه انخفاض السعر 🔔
            </span>
            <span className="text-[10px] text-[#6b7280]">{activeToast.timestamp}</span>
          </div>

          <h4 className="font-bold text-xs text-[#14281d] leading-snug line-clamp-1">
            {activeToast.listingTitle}
          </h4>

          <div className="text-xs text-[#374151]">
            انخفض السعر من <span className="line-through text-[#6b7280]">{activeToast.oldPrice}</span> إلى{' '}
            <strong className="text-[#166534] font-extrabold">{activeToast.newPrice}</strong>
          </div>

          {activeToast.dropAmount > 0 && (
            <div className="text-[11px] font-bold text-[#15803d] flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>تخفيض بمقدار {activeToast.dropAmount.toLocaleString('ar-EG')} ج.م!</span>
            </div>
          )}

          {onViewListing && (
            <button
              type="button"
              onClick={() => {
                onViewListing(activeToast.listingId);
                clearActiveToast();
              }}
              className="mt-2 text-xs font-bold text-[#166534] bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#86efac] px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة العرض المخفّض</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={clearActiveToast}
          className="text-[#9ca3af] hover:text-[#14281d] p-1 rounded-md transition-colors cursor-pointer"
          title="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
