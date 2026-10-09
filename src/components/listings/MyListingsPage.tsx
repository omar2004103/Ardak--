import React, { useState } from 'react';
import { Listing } from '../../types/listing.ts';
import { useApp } from '../../context/AppContext.tsx';
import {
  PlusCircle,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  MapPin,
  Maximize2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronLeft,
} from 'lucide-react';

interface MyListingsPageProps {
  onAddNewListing: () => void;
  onEditListing: (listing: Listing) => void;
  onViewDetails: (listing: Listing) => void;
  onNavigateHome: () => void;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({
  onAddNewListing,
  onEditListing,
  onViewDetails,
  onNavigateHome,
}) => {
  const { currentUser, listings, toggleListingStatus, deleteListing } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'pending' | 'paused'>('all');

  // Filter listings by current owner (or fallback to owner-001 if testing without login)
  const ownerId = currentUser?.id || 'owner-001';
  const myListings = listings.filter(
    (item) => item.ownerId === ownerId || (!item.ownerId && ownerId === 'owner-001')
  );

  const filtered = myListings.filter((item) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'published') return item.status === 'published';
    if (filterTab === 'pending') return item.status === 'pending_approval';
    if (filterTab === 'paused') return item.status === 'paused';
    return true;
  });

  const publishedCount = myListings.filter((i) => i.status === 'published').length;
  const pendingCount = myListings.filter((i) => i.status === 'pending_approval').length;
  const pausedCount = myListings.filter((i) => i.status === 'paused').length;

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
            <li className="text-[#14281d] font-bold">إعلاناتي</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-[#e2eae5] shadow-xs">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] text-xs font-bold border border-[#bbf7d0] mb-2">
              <span>لوحة تحكم المعلن والمالك</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#14281d]">
              إدارة الأراضي والمعروضات
            </h1>
            <p className="text-sm text-[#527963] mt-1">
              مرحباً {currentUser?.name || 'مالك الأرض'}، تابع حالة إعلاناتك، عدّل الأسعار والمواصفات، أو أضف قطع أراض جديدة.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNewListing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إضافة أرض جديدة</span>
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-[#e2eae5] shadow-xs">
            <span className="text-xs text-[#6b7280] block mb-1">إجمالي إعلاناتي</span>
            <span className="text-2xl font-black text-[#14281d] font-sans">
              {myListings.length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e2eae5] shadow-xs">
            <span className="text-xs text-[#16a34a] font-bold block mb-1">نشط ومتاح للجميع</span>
            <span className="text-2xl font-black text-[#166534] font-sans">
              {publishedCount}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e2eae5] shadow-xs">
            <span className="text-xs text-[#d97706] font-bold block mb-1">بانتظار الموافقة</span>
            <span className="text-2xl font-black text-[#d97706] font-sans">
              {pendingCount}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e2eae5] shadow-xs">
            <span className="text-xs text-[#6b7280] block mb-1">موقوف مؤقتاً</span>
            <span className="text-2xl font-black text-[#6b7280] font-sans">
              {pausedCount}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e2eae5] pb-3 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#4b6354] hover:bg-[#e8eee9]'
            }`}
          >
            الكل ({myListings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('published')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'published'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#4b6354] hover:bg-[#e8eee9]'
            }`}
          >
            النشطة ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'pending'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#4b6354] hover:bg-[#e8eee9]'
            }`}
          >
            بانتظار المراجعة ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('paused')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'paused'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#4b6354] hover:bg-[#e8eee9]'
            }`}
          >
            موقوف مؤقتاً ({pausedCount})
          </button>
        </div>

        {/* Listings List */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => {
              const isPaused = item.status === 'paused';
              const isPending = item.status === 'pending_approval';
              const isRejected = item.status === 'rejected';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#e2eae5] p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:border-[#bbf7d0] transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badges */}
                      {item.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold border border-[#86efac]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>نشط ومتاح للجمهور</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-bold border border-[#fde68a]">
                          <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                          <span>بانتظار مراجعة الإدارة</span>
                        </span>
                      )}
                      {isPaused && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563] text-xs font-bold border border-[#d1d5db]">
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>موقوف مؤقتاً (مخفي)</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] text-xs font-bold border border-[#fca5a5]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>مرفوض: {item.rejectionReason || 'بيانات غير مطابقة'}</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                        {item.propertyType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white bg-[#166534]">
                        {item.listingType === 'بيع' ? 'للبيع' : 'للإيجار'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#14281d]">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#527963]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span>
                          {item.governorate} · {item.city}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span className="font-bold text-[#14281d]">
                          {item.area} {item.areaUnit}
                        </span>
                      </span>
                      <span className="text-[#166534] font-extrabold font-sans text-sm">
                        {item.price}
                      </span>
                      {item.viewsCount && (
                        <span className="text-[11px] text-[#9ca3af]">
                          👁️ {item.viewsCount} مشاهدة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto">
                    {/* Preview details */}
                    <button
                      type="button"
                      onClick={() => onViewDetails(item)}
                      className="p-2 rounded-xl bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7] border border-[#bbf7d0] transition-colors cursor-pointer"
                      title="معاينة الإعلان"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => onEditListing(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#d1d5db] text-[#374151] hover:text-[#166534] hover:border-[#166534] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    {/* Pause / Resume toggle */}
                    <button
                      type="button"
                      onClick={() => toggleListingStatus(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isPaused
                          ? 'bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]'
                          : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>إعادة النشر</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>إيقاف مؤقت</span>
                        </>
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) {
                          deleteListing(item.id);
                        }
                      }}
                      className="p-2 rounded-xl text-[#dc2626] hover:bg-[#fee2e2]/40 transition-colors cursor-pointer"
                      title="حذف الإعلان"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center my-6 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#14281d]">لا توجد إعلانات في هذا التبويب</h3>
              <p className="text-xs text-[#527963] mt-1 max-w-sm mx-auto">
                ابدأ بإضافة أول قطعة أرض أو مزرعة لتبدأ باستقبال الاتصالات ومراسلات الواتساب من المشترين المهتمين.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onAddNewListing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ أضف إعلانك الآن</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
