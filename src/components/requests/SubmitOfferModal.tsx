import React, { useState } from 'react';
import {
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Maximize2,
  DollarSign,
  Building2,
  FileCheck,
  Droplets,
  Zap,
  LogIn,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { LandPurchaseRequest, RequestAreaUnit } from '../../types/purchaseRequest.ts';
import { egyptianGovernorates } from '../../data/listings.ts';

interface SubmitOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LandPurchaseRequest | null;
  onOfferSubmitted?: (offerId: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  isOpen,
  onClose,
  request,
  onOfferSubmitted,
  onOpenAuthModal,
}) => {
  const { currentUser, listings, submitOffer } = useApp();

  // Mode: link existing listing or custom land offer
  const [offerType, setOfferType] = useState<'existing' | 'custom'>('existing');
  const [selectedListingId, setSelectedListingId] = useState<string>('');

  // Custom offer fields
  const [offeredArea, setOfferedArea] = useState<string>('');
  const [areaUnit, setAreaUnit] = useState<RequestAreaUnit>('فدان');
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [pricePerFeddan, setPricePerFeddan] = useState<string>('');
  const [governorate, setGovernorate] = useState<string>(request?.governorate || 'البحيرة');
  const [city, setCity] = useState<string>(request?.city || '');
  const [waterSource, setWaterSource] = useState<string>('بئر ارتوازي');
  const [legalStatus, setLegalStatus] = useState<string>('عقد مسجل شهر عقاري');
  const [electricity, setElectricity] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  // Unauthenticated guard
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">تسجيل الدخول لتقديم عرض</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            يجب أن تكون مسجلاً بحساب مفعل على منصة أرضك لتتمكن من تقديم عرض أرض على هذا الطلب والتواصل مع المشتري.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenAuthModal) onOpenAuthModal('login');
              }}
              className="w-full py-3 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl transition-all shadow-md"
            >
              تسجيل الدخول الآن
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuthModal) onOpenAuthModal('register');
              }}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition-all border border-emerald-200"
            >
              إنشاء حساب جديد
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prevent self-offering
  if (currentUser.id === request.buyerId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا يمكنك تقديم عرض على طلبك الشخصي</h3>
          <p className="text-sm text-gray-600 mb-6">
            أنت صاحب هذا الطلب. يمكنك متابعة العروض الواردة من البائعين الآخرين في لوحة عروضك.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  // Prevent offering on closed/expired request
  if (request.status !== 'open' || request.moderationStatus !== 'visible') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">هذا الطلب غير متاح لتلقي العروض</h3>
          <p className="text-sm text-gray-600 mb-6">
            الطلب مغلق أو منتهي الصلاحية أو غير متاح للعروض حالياً.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  // Filter listings belonging to the logged-in user
  const userListings = listings.filter((l) => (l as any).publisherId === currentUser.id);

  // If user picks an existing listing
  const handleSelectListing = (listingId: string) => {
    setSelectedListingId(listingId);
    const item = userListings.find((l) => l.id === listingId);
    if (item) {
      setOfferedArea(item.area.toString());
      setAreaUnit((item.areaUnit as RequestAreaUnit) || 'فدان');
      setTotalPrice(item.rawPrice.toString());
      if (item.area > 0 && item.rawPrice > 0) {
        setPricePerFeddan(Math.round(item.rawPrice / item.area).toString());
      }
      setGovernorate(item.governorate);
      setCity(item.city);
      setWaterSource(item.waterSourceType || item.waterSource || 'بئر جوفي');
      setLegalStatus(item.ownershipType || 'عقد مسجل');
      setElectricity(Boolean(item.electricity));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const areaNum = parseFloat(offeredArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setErrorMessage('يرجى تحديد مساحة صالحة للأرض المعروضة أكبر من الصفر.');
      return;
    }

    const priceNum = parseFloat(totalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('يرجى تحديد السعر الإجمالي للعرض.');
      return;
    }

    if (!message.trim() || message.length < 10) {
      setErrorMessage('يرجى كتابة رسالة توضيحية للمشتري لا تقل عن 10 أحرف تتضمن تفاصيل الأرض ومميزاتها.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedItem = userListings.find((l) => l.id === selectedListingId);

      const res = await submitOffer(request, {
        offeredArea: areaNum,
        areaUnit,
        totalPrice: priceNum,
        pricePerFeddan: pricePerFeddan ? parseFloat(pricePerFeddan) : undefined,
        governorate,
        city,
        message: message.trim(),
        existingListingId: offerType === 'existing' && selectedListingId ? selectedListingId : undefined,
        existingListingTitle: offerType === 'existing' && selectedItem ? selectedItem.title : undefined,
        waterSource,
        legalStatus,
        electricity,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'تعذر إرسال العرض، يرجى المحاولة لاحقاً.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('تم إرسال عرضك بنجاح لصاحب الطلب! سيتم إشعاره بالعرض فورياً.');
      setTimeout(() => {
        setIsSubmitting(false);
        if (onOfferSubmitted && res.offerId) {
          onOfferSubmitted(res.offerId);
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء إرسال العرض.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-l from-[#14532d] to-[#166534] text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">تقديم عرض أرض</h2>
            <p className="text-xs text-emerald-100/80 truncate max-w-xs sm:max-w-md">
              على طلب: «{request.title}»
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Request Specs Bar */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-900">
          <span className="font-bold">مواصفات المشتري:</span>
          <span>
            {request.governorate} — {request.city}
          </span>
          <span>
            المساحة المطلوبة: {request.areaMin} إلى {request.areaMax} {request.areaUnit}
          </span>
          <span>
            الميزانية: {request.isBudgetUnspecified ? 'مفتوحة للتفاوض' : request.budgetVisibility === 'public' ? `${request.budgetMax?.toLocaleString('ar-EG')} ج.م` : 'ميزانية خاصة'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-right">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Offer Type Selection (If user has published listings) */}
          {userListings.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">مصدر الأرض المعروضة:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOfferType('existing')}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                    offerType === 'existing'
                      ? 'border-[#166534] bg-emerald-50 text-[#14532d] font-bold'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs">من إعلاناتي على أرضك</p>
                    <p className="text-[10px] text-gray-500 font-normal">ربط إعلان منشور بالفعل</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOfferType('custom');
                    setSelectedListingId('');
                  }}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                    offerType === 'custom'
                      ? 'border-[#166534] bg-emerald-50 text-[#14532d] font-bold'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs">عرض أرض مباشر</p>
                    <p className="text-[10px] text-gray-500 font-normal">أرض خاصة غير منشورة</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Pick Listing Dropdown if 'existing' */}
          {offerType === 'existing' && userListings.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                اختر الأرض من إعلاناتك <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => handleSelectListing(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-xs font-medium"
              >
                <option value="">-- اضغط لاختيار أحد إعلاناتك --</option>
                {userListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.area} {l.areaUnit} - {l.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Offer specifications */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-[#14532d] flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              المساحة والسعر المعروض
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  المساحة المعروضة <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={offeredArea}
                    onChange={(e) => setOfferedArea(e.target.value)}
                    placeholder="مثال: 5"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-xs"
                    required
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as RequestAreaUnit)}
                    className="px-2 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  >
                    <option value="فدان">فدان</option>
                    <option value="قيراط">قيراط</option>
                    <option value="متر مربع">م²</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  السعر الإجمالي (ج.م) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  value={totalPrice}
                  onChange={(e) => {
                    setTotalPrice(e.target.value);
                    const p = parseFloat(e.target.value);
                    const a = parseFloat(offeredArea);
                    if (!isNaN(p) && !isNaN(a) && a > 0) {
                      setPricePerFeddan(Math.round(p / a).toString());
                    }
                  }}
                  placeholder="مثال: 1800000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-xs"
                  required
                />
              </div>
            </div>

            {pricePerFeddan && (
              <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                سعر الفدان التقديري: {Number(pricePerFeddan).toLocaleString('ar-EG')} جنيه مصري
              </p>
            )}
          </div>

          {/* Location & Infrastructure */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-[#14532d] flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              الموقع ومواصفات الأرض
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs"
                >
                  {egyptianGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المركز / القرية</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: وادي النطرون"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-600" />
                  مصدر الري
                </label>
                <input
                  type="text"
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  placeholder="بئر جوفي 120م / ترعة"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-indigo-600" />
                  المستندات القانونية
                </label>
                <input
                  type="text"
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value)}
                  placeholder="عقد مسجل / تقنين خالص"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={electricity}
                onChange={(e) => setElectricity(e.target.checked)}
                className="rounded text-[#166534] focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                متوفر بالكهرباء (محول أو شبكة عمومية أو طاقة شمسية)
              </span>
            </label>
          </div>

          {/* Message to Buyer */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              رسالتك وتفاصيل العرض للمشتري <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب شرحاً وافياً عن موقع الأرض وقربها من الخدمات والطرق، وحالة التربة والري، وجاهزية المعاينة..."
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-xs"
              maxLength={500}
              required
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">{message.length}/500 حرف</span>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600">
            سيتم إشعار صاحب الطلب «{request.buyerName}» بعرضك فورياً. يمكنه مراجعة العرض وقبوله أو التواصل معك مباشرة وفق إعدادات التواصل المحددة.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال العرض الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
