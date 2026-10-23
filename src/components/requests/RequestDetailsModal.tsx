import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  DollarSign,
  Maximize2,
  Droplets,
  Zap,
  Navigation,
  FileText,
  FileCheck2,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Share2,
  AlertTriangle,
  Send,
  UserCheck,
  Building2,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Edit,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { LandPurchaseRequest, LandOffer } from '../../types/purchaseRequest.ts';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LandPurchaseRequest | null;
  onSubmitOffer: (request: LandPurchaseRequest) => void;
  onEditRequest?: (request: LandPurchaseRequest) => void;
  onReportRequest?: (request: LandPurchaseRequest) => void;
  onViewListing?: (listingId: string) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitOffer,
  onEditRequest,
  onReportRequest,
  onViewListing,
}) => {
  const { currentUser, getOffers, respondToOffer, closeRequest, renewRequest } = useApp();

  const [offers, setOffers] = useState<LandOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOwner = currentUser && request && currentUser.id === request.buyerId;

  // Load offers when open
  useEffect(() => {
    if (isOpen && request) {
      setIsLoadingOffers(true);
      getOffers(request.id)
        .then((data) => {
          setOffers(data);
        })
        .catch(() => {
          // Fallback or ignore
        })
        .finally(() => {
          setIsLoadingOffers(false);
        });
    }
  }, [isOpen, request?.id, getOffers]);

  if (!isOpen || !request) return null;

  // Calculate days left
  const now = new Date().getTime();
  const expiresAt = new Date(request.expiresAt).getTime();
  const diffDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0 || request.status === 'expired';
  const isClosed = request.status === 'closed';

  // Find if current non-owner user has an offer
  const mySubmittedOffer = currentUser && !isOwner
    ? offers.find((o) => o.sellerId === currentUser.id)
    : null;

  const handleCopyShare = () => {
    const url = window.location.origin + window.location.pathname + '#request-' + request.id;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAcceptOffer = async (offerId: string) => {
    const res = await respondToOffer(request.id, offerId, 'accepted');
    if (res.success) {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o))
      );
      setActionNotice('تم قبول العرض مبدئياً! يمكنك الآن التواصل مع صاحب الأرض لإتمام المعاينة.');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    const res = await respondToOffer(request.id, offerId, 'rejected');
    if (res.success) {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o))
      );
      setActionNotice('تم رفض العرض.');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleWithdrawOffer = async (offerId: string) => {
    const res = await respondToOffer(request.id, offerId, 'withdrawn');
    if (res.success) {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: 'withdrawn' } : o))
      );
      setActionNotice('تم سحب عرضك بنجاح.');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleCloseThisRequest = async () => {
    if (confirm('هل أنت متأكد من رغبتك في إغلاق هذا الطلب؟ لن يتم استقبال أي عروض جديدة عليه.')) {
      const res = await closeRequest(request.id);
      if (res.success) {
        setActionNotice('تم إغلاق الطلب بنجاح.');
        setTimeout(() => setActionNotice(null), 3000);
      }
    }
  };

  const handleRenewThisRequest = async () => {
    const res = await renewRequest(request.id, 30);
    if (res.success) {
      setActionNotice('تم تجديد صلاحية الطلب لمدة 30 يوماً إضافية!');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  // Safe phone/whatsapp link
  const cleanPhone = request.buyerPhone.replace(/\D/g, '');
  const formattedWa = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedWa}?text=${encodeURIComponent(
    `السلام عليكم، بخصوص طلب شراء الأرض على منصة «أرضك»: ${request.title}`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-l from-[#14532d] via-[#166534] to-[#1e7840] text-white flex items-start justify-between shrink-0">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
                {request.category}
              </span>

              {isClosed ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/80 text-white">
                  مغلق
                </span>
              ) : isExpired ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/80 text-white">
                  منتهي الصلاحية
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-400/90 text-emerald-950 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  متبقي {diffDays} يوم
                </span>
              )}

              {isOwner && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400 text-amber-950">
                  طلبك الشخصي
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {request.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-emerald-100/90">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                {request.governorate} — {request.city} {request.district ? `(${request.district})` : ''}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                نُشر: {new Date(request.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors relative"
              title="مشاركة الطلب"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded shadow whitespace-nowrap">
                  تم النسخ!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {/* Main Key Figures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-right">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                المساحة المستهدفة
              </div>
              <p className="text-base font-extrabold text-[#14532d]">
                من {request.areaMin} إلى {request.areaMax} {request.areaUnit}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">وفق حاجة المشتري</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-right">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold mb-1">
                <DollarSign className="w-4 h-4 text-amber-600" />
                الميزانية المتاحة
              </div>
              <p className="text-base font-extrabold text-amber-950">
                {request.isBudgetUnspecified
                  ? 'مفتوحة للتفاوض'
                  : request.budgetVisibility === 'hidden' && !isOwner
                  ? 'ميزانية خاصة للمشتري'
                  : `${request.budgetMin ? request.budgetMin.toLocaleString('ar-EG') + ' - ' : ''}${
                      request.budgetMax?.toLocaleString('ar-EG') || ''
                    } ج.م`}
              </p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                {request.budgetVisibility === 'hidden' && !isOwner
                  ? 'تظهر لك بعد تقديم العرض'
                  : 'جاهزية السداد الفوري'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-right">
              <div className="flex items-center gap-2 text-sky-900 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4 text-sky-600" />
                العروض المستلمة
              </div>
              <p className="text-base font-extrabold text-sky-950">
                {offers.length || request.offerCount || 0} عروض مقدمة
              </p>
              <p className="text-[11px] text-sky-700/80 mt-0.5">
                {request.status === 'open' ? 'يقبل عروض جديدة' : 'مغلق للعروض'}
              </p>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#166534]" />
              الاشتراطات والمواصفات المطلوبة بالتفصيل
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-100">
                <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[10px]">مصدر المياه:</span>
                  <span className="font-bold text-gray-800">
                    {request.requirements?.waterSource || 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-100">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[10px]">اشتراطات الكهرباء:</span>
                  <span className="font-bold text-gray-800">
                    {request.requirements?.electricity || 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-100">
                <Navigation className="w-4 h-4 text-stone-600 shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[10px]">نوع الطريق والوصول:</span>
                  <span className="font-bold text-gray-800">
                    {request.requirements?.roadType || 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-100">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[10px]">المستندات القانونية:</span>
                  <span className="font-bold text-gray-800">
                    {request.requirements?.legalStatus || 'عقد مسجل أو تمليك'}
                  </span>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-semibold">الغرض الأساسي:</span>
              <span className="font-bold text-[#14532d] bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                {request.purpose}
              </span>
            </div>

            {/* Description */}
            {request.description && (
              <div className="pt-2 border-t border-gray-200/60 text-xs">
                <span className="text-gray-500 font-semibold block mb-1">وصف المشتري وملاحظاته:</span>
                <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                  {request.description}
                </p>
              </div>
            )}
          </div>

          {/* Buyer & Direct Contact Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#166534] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                {request.buyerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{request.buyerName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                    صاحب الطلب
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  طريقة التواصل:{' '}
                  {request.contactPreferences === 'phone_and_whatsapp'
                    ? 'هاتف وواتساب مباشر'
                    : request.contactPreferences === 'whatsapp_only'
                    ? 'واتساب فقط'
                    : 'عروض من داخل المنصة فقط'}
                </p>
              </div>
            </div>

            {/* Contact buttons if permitted */}
            {!isOwner && request.contactPreferences !== 'internal_offer_only' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب</span>
                </a>

                {request.contactPreferences === 'phone_and_whatsapp' && (
                  <a
                    href={`tel:${request.buyerPhone}`}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone className="w-4 h-4 text-gray-700" />
                    <span>اتصال</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* User's Submitted Offer (If non-owner and already submitted) */}
          {mySubmittedOffer && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  لقد قدمت عرضاً على هذا الطلب
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    mySubmittedOffer.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : mySubmittedOffer.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : mySubmittedOffer.status === 'withdrawn'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {mySubmittedOffer.status === 'accepted'
                    ? 'تم قبول عرضك'
                    : mySubmittedOffer.status === 'rejected'
                    ? 'تم رفض العرض'
                    : mySubmittedOffer.status === 'withdrawn'
                    ? 'عرض مسحوب'
                    : 'قيد المراجعة من المشتري'}
                </span>
              </div>
              <p className="text-xs text-sky-800">
                المساحة المعروضة: {mySubmittedOffer.offeredArea} {mySubmittedOffer.areaUnit} — السعر:{' '}
                {mySubmittedOffer.totalPrice.toLocaleString('ar-EG')} ج.م
              </p>
              {mySubmittedOffer.message && (
                <p className="text-xs text-gray-600 bg-white/70 p-2 rounded-lg">
                  «{mySubmittedOffer.message}»
                </p>
              )}
              {mySubmittedOffer.status === 'pending' && (
                <button
                  onClick={() => handleWithdrawOffer(mySubmittedOffer.id)}
                  className="text-xs text-red-600 hover:text-red-800 font-bold underline"
                >
                  سحب هذا العرض
                </button>
              )}
            </div>
          )}

          {/* Offers List for the Request Owner */}
          {isOwner && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#166534]" />
                  العروض المقدمة على طلبك ({offers.length})
                </h3>
                {isLoadingOffers && (
                  <span className="text-xs text-gray-400">جاري التحديث...</span>
                )}
              </div>

              {offers.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">
                    لم تتلقَ أي عروض حتى الآن على هذا الطلب.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    طلبك منشور ونشط ويراه أصحاب الأراضي والمزارع. سيصلك إشعار فور تقديم أي عرض.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => {
                    const sellerWa = offer.sellerPhone.replace(/\D/g, '');
                    const sellerWaFormatted = sellerWa.startsWith('0') ? '2' + sellerWa : sellerWa;
                    const offerWaUrl = `https://wa.me/${sellerWaFormatted}?text=${encodeURIComponent(
                      `مرحباً ${offer.sellerName}، اطلعت على عرضك بخصوص طلب شراء الأرض على منصة أرضك: ${request.title}`
                    )}`;

                    return (
                      <div
                        key={offer.id}
                        className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">
                                {offer.sellerName}
                              </span>
                              {offer.sellerRole && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-semibold">
                                  {offer.sellerRole}
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  offer.status === 'accepted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : offer.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : offer.status === 'withdrawn'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {offer.status === 'accepted'
                                  ? 'مقبول'
                                  : offer.status === 'rejected'
                                  ? 'مرفوض'
                                  : offer.status === 'withdrawn'
                                  ? 'مسحوب'
                                  : 'جديد قيد المراجعة'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {offer.governorate} — {offer.city} • قُدم بتاريخ{' '}
                              {new Date(offer.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>

                          <div className="text-left">
                            <span className="text-sm font-extrabold text-[#14532d] block">
                              {offer.totalPrice.toLocaleString('ar-EG')} ج.م
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {offer.offeredArea} {offer.areaUnit}
                            </span>
                          </div>
                        </div>

                        {/* Linked listing button */}
                        {offer.existingListingId && (
                          <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                            <span className="text-emerald-900 truncate">
                              مرتبط بإعلان: <strong>{offer.existingListingTitle || 'عرض أرض منشور'}</strong>
                            </span>
                            {onViewListing && (
                              <button
                                onClick={() => onViewListing(offer.existingListingId!)}
                                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 shrink-0"
                              >
                                <span>معاينة الإعلان</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Offer Message */}
                        <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                          «{offer.message}»
                        </p>

                        {/* Actions for owner */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <a
                              href={offerWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>تواصل واتساب</span>
                            </a>
                            <a
                              href={`tel:${offer.sellerPhone}`}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>اتصال</span>
                            </a>
                          </div>

                          {offer.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptOffer(offer.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs"
                              >
                                قبول العرض
                              </button>
                              <button
                                onClick={() => handleRejectOffer(offer.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Owner Request Controls */}
          {isOwner && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-gray-700">إدارة هذا الطلب:</span>
              <div className="flex items-center gap-2">
                {onEditRequest && (
                  <button
                    onClick={() => onEditRequest(request)}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                )}
                <button
                  onClick={handleRenewThisRequest}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تجديد 30 يوماً</span>
                </button>
                {request.status === 'open' && (
                  <button
                    onClick={handleCloseThisRequest}
                    className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>إغلاق الطلب</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div>
            {onReportRequest && (
              <button
                onClick={() => onReportRequest(request)}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>إبلاغ عن محتوى غير لائق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
            >
              إغلاق
            </button>

            {/* If visitor or non-owner and open: CTA to submit offer */}
            {!isOwner && request.status === 'open' && !mySubmittedOffer && (
              <button
                onClick={() => onSubmitOffer(request)}
                className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>تقديم عرض أرض على هذا الطلب</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
