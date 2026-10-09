import React from 'react';
import { Listing } from '../../types/listing.ts';
import { Scale, X, ArrowLeft, Trash2 } from 'lucide-react';

interface ComparisonBarProps {
  comparedListings: Listing[];
  onOpenComparison: () => void;
  onOpenComparePage?: () => void;
  onRemoveListing: (id: string) => void;
  onClearAll: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  comparedListings,
  onOpenComparison,
  onOpenComparePage,
  onRemoveListing,
  onClearAll,
}) => {
  if (comparedListings.length === 0) return null;

  const canCompare = comparedListings.length >= 2;

  return (
    <aside
      aria-label="شريط مقارنة الأراضي الزراعية"
      className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-2xl w-[calc(100%-24px)] sm:w-auto bg-[#14281d] text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-white/15 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left side (in RTL): Badge and list of compared properties */}
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full w-full sm:w-auto py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10">
            <Scale className="w-4 h-4 text-[#4ade80]" />
            <span className="text-xs font-bold whitespace-nowrap">
              المقارنة ({comparedListings.length}/4)
            </span>
          </div>

          {/* Mini property chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {comparedListings.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 text-xs text-[#e2f0e6] border border-white/10 shrink-0"
              >
                <span className="max-w-[120px] truncate font-medium">
                  {item.city} - {item.area} {item.areaUnit}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveListing(item.id)}
                  className="hover:text-[#f87171] p-0.5 transition-colors cursor-pointer"
                  title="إزالة من المقارنة"
                  aria-label={`إزالة ${item.title} من المقارنة`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right side (in RTL): Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-white/10 pt-2 sm:border-0 sm:pt-0">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-[#9ca3af] hover:text-[#f87171] px-2 py-1 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح</span>
          </button>

          <button
            type="button"
            onClick={onOpenComparePage || onOpenComparison}
            disabled={!canCompare}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              canCompare
                ? 'bg-[#16a34a] hover:bg-[#15803d] text-white active:scale-95'
                : 'bg-white/20 text-white/60 cursor-not-allowed'
            }`}
          >
            <span>{canCompare ? 'قارن الأراضي ⚖️' : 'اختر عقاراً آخر'}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
