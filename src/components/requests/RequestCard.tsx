import React from 'react';
import {
  MapPin,
  Calendar,
  Layers,
  DollarSign,
  Sparkles,
  Droplets,
  Zap,
  FileCheck,
  Tag,
  ArrowLeft,
  Clock,
  Eye,
  CheckCircle2,
  Lock,
  PlusCircle,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { LandPurchaseRequest } from '../../types/purchaseRequest.ts';

interface RequestCardProps {
  request: LandPurchaseRequest;
  onViewDetails: (request: LandPurchaseRequest) => void;
  onSubmitOffer: (request: LandPurchaseRequest) => void;
  isOwner?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onViewDetails,
  onSubmitOffer,
  isOwner = false,
}) => {
  // Calculate remaining days
  const now = new Date().getTime();
  const expiresAt = new Date(request.expiresAt).getTime();
  const diffDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0 || request.status === 'expired';
  const isClosed = request.status === 'closed';

  const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'أرض زراعية': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    'مزرعة': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    'أرض استصلاح': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    'أرض سكنية': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    'أرض تجارية': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    'استثمارية': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  };

  const currentCategory = categoryColorMap[request.category] || {
    bg: 'bg-gray-50',
    text: 'text-gray-800',
    border: 'border-gray-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative group text-right ${
        isClosed || isExpired
          ? 'border-gray-200 opacity-80'
          : 'border-[#e2eae5] hover:border-[#16a34a]/40 shadow-xs hover:shadow-md'
      }`}
      dir="rtl"
    >
      {/* Top Header Strip */}
      <div className="p-4 sm:p-5 border-b border-[#edf3ef] bg-gradient-to-l from-[#fafcfb] to-white space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${currentCategory.bg} ${currentCategory.text} ${currentCategory.border}`}
          >
            <Tag className="w-3 h-3" />
            <span>{request.category}</span>
          </span>

          <div className="flex items-center gap-2">
            {/* Status / Expiration Badge */}
            {isClosed ? (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                طلب مغلق
              </span>
            ) : isExpired ? (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>انتهت المدة</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>متبقي {diffDays} يوم</span>
              </span>
            )}

            {/* Offers Count Badge */}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
              {request.offerCount > 0 ? `${request.offerCount} عروض` : 'بانتظار العروض'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(request)}
          className="text-base sm:text-lg font-black text-[#14281d] leading-snug hover:text-[#166534] transition-colors cursor-pointer line-clamp-2"
        >
          {request.title}
        </h3>

        {/* Location & Buyer Badge */}
        <div className="flex items-center justify-between text-xs text-[#527963] pt-1">
          <div className="flex items-center gap-1.5 font-bold text-[#14281d]">
            <MapPin className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
            <span>
              {request.governorate} • {request.city} {request.district ? `(${request.district})` : ''}
            </span>
          </div>

          <div className="text-[11px] text-[#6b7280]">
            بواسطة:{' '}
            <strong className="text-[#374151] font-semibold">
              {isOwner ? 'أنت (صاحب الطلب)' : request.buyerName}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Specs Grid */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Required Area */}
          <div className="bg-[#fcfdfc] p-2.5 rounded-xl border border-[#edf3ef]">
            <span className="text-[10px] text-[#6b7280] block font-medium">المساحة المطلوبة</span>
            <span className="font-black text-sm text-[#14281d] mt-0.5 block font-sans">
              {request.areaMin} - {request.areaMax}{' '}
              <span className="text-xs font-normal text-[#527963]">{request.areaUnit}</span>
            </span>
          </div>

          {/* Budget */}
          <div className="bg-[#fcfdfc] p-2.5 rounded-xl border border-[#edf3ef]">
            <span className="text-[10px] text-[#6b7280] block font-medium">الميزانية المرصودة</span>
            {request.isBudgetUnspecified ? (
              <span className="font-bold text-xs text-[#166534] mt-1 block">
                مفتوحة للتفاوض حسب الجدية
              </span>
            ) : request.budgetVisibility === 'hidden' ? (
              <span className="font-bold text-xs text-[#b45309] mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>خاصة (تظهر مع العرض)</span>
              </span>
            ) : (
              <span className="font-black text-sm text-[#166534] mt-0.5 block font-sans">
                {request.budgetMin ? `${request.budgetMin.toLocaleString('ar-EG')} - ` : ''}
                {request.budgetMax ? `${request.budgetMax.toLocaleString('ar-EG')} ج.م` : 'غير محدد'}
              </span>
            )}
          </div>
        </div>

        {/* Purpose */}
        <div className="flex items-center gap-1.5 text-xs text-[#374151] bg-[#f9fbf9] p-2 rounded-lg border border-[#eef4f0]">
          <Briefcase className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
          <span className="font-medium text-[#6b7280]">الغرض:</span>
          <span className="font-bold text-[#14281d] truncate">{request.purpose}</span>
        </div>

        {/* Requirement Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {request.requirements.waterSource && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-sky-50 text-sky-800 border border-sky-200">
              <Droplets className="w-2.5 h-2.5 text-sky-600" />
              <span>{request.requirements.waterSource}</span>
            </span>
          )}
          {request.requirements.roadType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-stone-50 text-stone-700 border border-stone-200">
              <span>طريق: {request.requirements.roadType}</span>
            </span>
          )}
          {request.requirements.electricity && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
              <Zap className="w-2.5 h-2.5 text-amber-600" />
              <span>{request.requirements.electricity}</span>
            </span>
          )}
          {request.requirements.legalStatus && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
              <FileCheck className="w-2.5 h-2.5 text-emerald-600" />
              <span>{request.requirements.legalStatus}</span>
            </span>
          )}
        </div>

        {/* Short description preview if present */}
        {request.description && (
          <p className="text-xs text-[#527963] line-clamp-2 leading-relaxed">
            {request.description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-3 border-t border-[#edf3ef] bg-white flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(request)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] hover:text-[#14532d] px-3 py-2 rounded-xl hover:bg-[#f0fdf4] transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>تفاصيل الطلب والعروض</span>
        </button>

        {!isClosed && !isExpired && (
          <button
            type="button"
            onClick={() => onSubmitOffer(request)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isOwner ? 'متابعة العروض' : 'قدم عرض أرض'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
