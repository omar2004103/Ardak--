import React, { useState } from 'react';
import { X, Flag, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Listing, ReportReason } from '../../types/listing.ts';
import { useApp } from '../../context/AppContext.tsx';

interface ReportModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

const reasonLabels: { value: ReportReason; label: string }[] = [
  { value: 'sold', label: 'تم بيع أو تأجير الأرض بالفعل' },
  { value: 'wrong_phone', label: 'رقم الهاتف خطأ أو لا يستجيب' },
  { value: 'misleading', label: 'بيانات ومواصفات مضللة أو غير حقيقية' },
  { value: 'scam', label: 'اشتباه في احتيال أو طلب عمولات مسبقة' },
  { value: 'duplicate', label: 'إعلان مكرر في الموقع' },
  { value: 'other', label: 'سبب آخر' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { currentUser, submitReport } = useApp();
  const [reason, setReason] = useState<ReportReason>('sold');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phone || '');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      listingId: listing.id,
      listingTitle: listing.title,
      reporterName: reporterName.trim() || 'فاعل خير',
      reporterPhone: reporterPhone.trim() || '01028200048',
      reason,
      details,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fee2e2] text-[#dc2626] flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14281d]">
                إبلاغ عن إعلان مخالف
              </h2>
              <span className="text-[11px] text-[#6b7280] line-clamp-1 max-w-[240px]">
                {listing.title}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#14281d]">
                تم استلام البلاغ بنجاح
              </h3>
              <p className="text-xs text-[#527963]">
                شكراً لمساعدتنا في الحفاظ على مصداقية السوق الزراعي. سيقوم فريق الإدارة بمراجعته فوراً.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="bg-[#fffbeb] border border-[#fef3c7] p-2.5 rounded-xl flex items-start gap-2 text-xs text-[#92400e]">
                <AlertTriangle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <span>
                  نحن نأخذ جميع البلاغات بجدية لضمان بيئة آمنة للمشترين والمزارعين.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  سبب الإبلاغ
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                >
                  {reasonLabels.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#374151] mb-1">
                    اسمك (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="اسمك الكريم"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-1.5 text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#374151] mb-1">
                    رقم هاتفك (اختياري)
                  </label>
                  <input
                    type="tel"
                    placeholder="للتواصل معك إذا لزم"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-1.5 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  ملاحظات وتفاصيل إضافية
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="يرجى توضيح سبب البلاغ بالتفصيل..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl p-2.5 text-xs outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6b7280] hover:bg-[#f3f4f6] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  إرسال البلاغ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
