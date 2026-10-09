import React, { useState } from 'react';
import { Listing } from '../../types/listing.ts';
import { useApp } from '../../context/AppContext.tsx';
import {
  X,
  MapPin,
  Maximize2,
  Phone,
  MessageSquare,
  MessageCircle,
  Check,
  CheckCheck,
  Droplets,
  Zap,
  FileText,
  Layers,
  Heart,
  Flag,
  User,
  Edit3,
  Trees,
  Compass,
  Building,
  ShieldCheck,
  Scale,
  Bell,
  BellRing,
  Copy,
  ExternalLink,
  Send,
  Sparkles,
} from 'lucide-react';

interface ListingDetailsModalProps {
  listing: Listing | null;
  onClose: () => void;
  onOpenReport?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onEvaluateListing?: (listing: Listing) => void;
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  listing,
  onClose,
  onOpenReport,
  onEditListing,
  onEvaluateListing,
}) => {
  const {
    users,
    currentUser,
    isFavorite,
    toggleFavorite,
    isPriceAlertActive,
    togglePriceAlert,
  } = useApp();

  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!listing) return null;

  const isRent = listing.listingType === 'إيجار';
  const favorited = isFavorite(listing.id);
  const alertActive = isPriceAlertActive(listing.id);
  const isOwnerOrAdmin =
    currentUser && (currentUser.id === listing.ownerId || currentUser.role === 'admin');

  // استرجاع صاحب الإعلان من قائمة المستخدمين لمطابقة رقم الهاتف في الملف الشخصي
  const ownerUser = users.find(
    (u) =>
      u.id === listing.ownerId ||
      u.name === listing.ownerName ||
      (listing.ownerId === 'owner-001' && (u.id === 'user-001' || u.role === 'user'))
  );

  // استخراج رقم الهاتف المعتمد في الملف الشخصي لصاحب الإعلان
  const profilePhone =
    ownerUser?.companyProfile?.whatsapp ||
    ownerUser?.companyProfile?.phone ||
    ownerUser?.phone ||
    listing.whatsappNumber ||
    listing.contactPhone ||
    '01012345671';

  const ownerDisplayName =
    ownerUser?.companyProfile?.companyName ||
    ownerUser?.name ||
    listing.ownerName ||
    'صاحب الإعلان';

  // تنظيف وتنسيق الرقم الدولي للواتساب في مصر (+20)
  const cleanWhatsAppNumber = (rawPhone: string) => {
    const cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      return `20${cleaned.substring(1)}`;
    }
    if (cleaned.startsWith('20')) {
      return cleaned;
    }
    if (cleaned.startsWith('1') && cleaned.length === 10) {
      return `20${cleaned}`;
    }
    return cleaned || '201012345671';
  };

  const waNumber = cleanWhatsAppNumber(profilePhone);

  // إنشاء رابط واتساب التلقائي مع تفاصيل الأرض والرسالة الجاهزة
  const buildWhatsAppLink = (inquiryTopic?: string) => {
    let msg = `السلام عليكم ورحمة الله وبركاته يا ${ownerDisplayName}،\nأنا مهتم بعرض الأرض المعلن على منصة "أرضك":\n📌 *${listing.title}*\n📍 *الموقع:* ${listing.governorate} - ${listing.city}${listing.village ? ` (${listing.village})` : ''}\n💰 *السعر المطلوب:* ${listing.price}\n📐 *المساحة:* ${listing.area} ${listing.areaUnit}`;

    if (inquiryTopic) {
      msg += `\n\n💬 *موضوع الاستفسار:* ${inquiryTopic}`;
    } else {
      msg += `\n\nأود الاستفسار عن تفاصيل إضافية وتحديد موعد لمعاينة الأرض على الطبيعة. هل العرض لا يزال متاحاً؟`;
    }

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleCopyPhone = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(profilePhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const quickInquiries = [
    { title: '📅 طلب موعد معاينة', query: 'أرغب في تحديد موعد لمعاينة الأرض على الطبيعة' },
    { title: '📑 أوراق الملكية والتسجيل', query: 'أود الاستفسار عن نوع الملكية وصحة الأوراق والتسجيل بالشهر العقاري' },
    { title: '💰 التفاوض على السعر', query: 'هل هناك إمكانية للتفاوض في السعر المطلوب وما هي طرق السداد المتاحة؟' },
    { title: '💧 مصدر المياه والملوحة', query: 'أود معرفة تفاصيل أكثر عن مصدر المياه ونسبة الملوحة (TDS) وشبكة الري' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {/* Contrasting Transaction Badge: Green for Sale, Blue for Rent */}
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black shadow-xs border ${
                isRent
                  ? 'bg-[#0284c7] text-white border-[#38bdf8]/40'
                  : 'bg-[#166534] text-white border-[#4ade80]/40'
              }`}
            >
              <span className="text-[10px]">{isRent ? '🔑' : '🏷️'}</span>
              <span>{isRent ? 'للإيجار' : 'للبيع'}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
              <Layers className="w-3 h-3 text-[#16a34a]" />
              {listing.propertyType}
            </span>

            {listing.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                <span>✓ إعلان موثق</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Price Alert Toggle */}
            <button
              type="button"
              onClick={() => togglePriceAlert(listing.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                alertActive
                  ? 'bg-[#dcfce7] text-[#166534] border-[#86efac] shadow-2xs'
                  : 'bg-white text-[#6b7280] border-[#e2eae5] hover:text-[#166534] hover:bg-[#f0fdf4]'
              }`}
              title={alertActive ? 'تنبيه انخفاض السعر مفعل (انقر للإلغاء)' : 'تفعيل تنبيه انخفاض السعر'}
            >
              {alertActive ? <BellRing className="w-4 h-4 text-[#16a34a]" /> : <Bell className="w-4 h-4" />}
              <span className="text-xs font-bold hidden sm:inline">
                {alertActive ? 'تنبيه السعر مفعّل ✓' : 'تنبيه انخفاض السعر'}
              </span>
            </button>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={() => toggleFavorite(listing.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                favorited
                  ? 'bg-[#fee2e2] text-[#e11d48] border-[#fca5a5]'
                  : 'bg-white text-[#6b7280] border-[#e2eae5] hover:text-[#e11d48]'
              }`}
              title={favorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-[#e11d48]' : ''}`} />
            </button>

            {/* Report flag */}
            {onOpenReport && (
              <button
                type="button"
                onClick={() => onOpenReport(listing)}
                className="p-2 rounded-xl bg-white text-[#6b7280] hover:text-[#dc2626] border border-[#e2eae5] hover:bg-[#fee2e2]/40 transition-colors cursor-pointer"
                title="إبلاغ عن الإعلان"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}

            {/* Owner Edit shortcut */}
            {isOwnerOrAdmin && onEditListing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditListing(listing);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe] border border-[#bae6fd] text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Title & Location */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#527963] font-medium mb-1.5">
              <MapPin className="w-4 h-4 text-[#16a34a]" />
              <span>
                محافظة {listing.governorate} · مركز {listing.city} {listing.village ? `· ${listing.village}` : ''}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#14281d] leading-snug">
              {listing.title}
            </h2>
          </div>

          {/* Pricing & Area Banner */}
          <div className="bg-[#f7faf8] rounded-xl p-4 border border-[#e2eae5] space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-[#6b7280] mb-0.5">المساحة الإجمالية</span>
                <div className="text-lg font-bold text-[#14281d] flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-[#16a34a]" />
                  <span className="font-sans">{listing.area}</span> {listing.areaUnit}
                  {listing.qirat ? <span className="text-xs text-[#527963]">({listing.qirat} قيراط)</span> : null}
                </div>
              </div>
              <div>
                <span className="block text-xs text-[#6b7280] mb-0.5">السعر المطلوب (asking_price)</span>
                <div className="text-lg font-extrabold text-[#166534] font-sans">
                  {listing.price}
                </div>
              </div>
            </div>

            {onEvaluateListing && (
              <button
                type="button"
                onClick={() => onEvaluateListing(listing)}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#f0fdf4] text-[#166534] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#86efac] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <Scale className="w-4 h-4 text-[#16a34a]" />
                <span>تقييم عدالة السعر بمحرك الصفقات المشابهة (Comparable Engine)</span>
              </button>
            )}

            {/* Price Drop Alert In-Card Box */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
              alertActive
                ? 'bg-[#f0fdf4] border-[#86efac]'
                : 'bg-white/90 border-[#e2eae5]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  alertActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f3f4f6] text-[#6b7280]'
                }`}>
                  {alertActive ? <BellRing className="w-4 h-4 text-[#16a34a]" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#14281d] flex items-center gap-1.5">
                    <span>{alertActive ? 'تنبيه انخفاض السعر مفعّل لهذه الأرض ✓' : 'تفعيل تنبيه انخفاض السعر'}</span>
                  </div>
                  <span className="text-[11px] text-[#527963] block">
                    {alertActive
                      ? 'ستصلك إشعارات فورية في حال قيام المالك بخفض السعر عن الحالي.'
                      : 'هل تنتظر تخفيضاً؟ سنبلغك فور قيام المالك بخفض السعر المطلوب.'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePriceAlert(listing.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs ${
                  alertActive
                    ? 'bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca] border border-[#fca5a5]'
                    : 'bg-[#166534] text-white hover:bg-[#14532d]'
                }`}
              >
                {alertActive ? 'إلغاء التنبيه' : 'تفعيل التنبيه 🔔'}
              </button>
            </div>
          </div>

          {/* Owner info & Trust card with prominent Account Type badge */}
          <div className="bg-[#f0fdf4] rounded-xl p-4 border border-[#bbf7d0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white text-[#166534] flex items-center justify-center border border-[#86efac] shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#14281d]">
                      {listing.ownerName || 'مالك الأرض'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black shadow-2xs border ${
                        listing.advertiserType === 'شركة عقارية'
                          ? 'bg-[#1e3a8a] text-white border-[#3b82f6]/40'
                          : listing.advertiserType === 'وسيط'
                          ? 'bg-[#0369a1] text-white border-[#38bdf8]/40'
                          : 'bg-[#166534] text-white border-[#22c55e]/40'
                      }`}
                    >
                      <span>
                        {listing.advertiserType === 'شركة عقارية'
                          ? '🏢 شركة عقارية'
                          : listing.advertiserType === 'وسيط'
                          ? '🤝 وسيط'
                          : '🏡 مالك'}
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] text-[#527963] block">
                    نُشر بتاريخ: {listing.createdAt || 'محدث مؤخراً'}
                  </span>
                </div>
              </div>

              <div className="text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-white px-2.5 py-1 rounded-lg border border-[#86efac]">
                  <span>✓ هاتف موثق</span>
                </span>
              </div>
            </div>
          </div>

          {/* ميزة التواصل السريع عبر واتساب مع صاحب الإعلان بناءً على رقم هاتفه في الملف الشخصي */}
          <div className="bg-gradient-to-br from-[#f0fdf4] via-[#ecfdf5] to-[#e6fcf5] rounded-2xl p-4 sm:p-5 border-2 border-[#86efac] shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bbf7d0]/70 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#25d366] text-white flex items-center justify-center shadow-sm shrink-0">
                  <MessageCircle className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-[#14281d]">
                      التواصل السريع عبر واتساب مع المعلن
                    </h3>
                    <span className="text-[10px] font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full border border-[#86efac]">
                      رابط تلقائي مباشر
                    </span>
                  </div>
                  <p className="text-xs text-[#527963] mt-0.5">
                    يربطك مباشرة بـ <strong>{ownerDisplayName}</strong> عبر رقم الهاتف المسجل في ملفه الشخصي:{' '}
                    <span className="font-sans font-bold text-[#14281d] dir-ltr inline-block">
                      {profilePhone}
                    </span>
                  </p>
                </div>
              </div>

              {/* أزرار الاتصال والنسخ */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#bbf7d0] hover:bg-[#f0fdf4] text-xs font-bold text-[#374151] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="نسخ رقم هاتف صاحب الإعلان"
                >
                  {copiedPhone ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                      <span className="text-[#16a34a]">تم النسخ ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6b7280]" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>

                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-black shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>فتح واتساب الآن</span>
                  <ExternalLink className="w-3 h-3 opacity-90" />
                </a>
              </div>
            </div>

            {/* استفسارات سريعة مسبقة التجهيز بنقرة واحدة */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#14281d] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>رسائل سريعة بنقرة واحدة (تفتح المحادثة جاهزة ببيانات الأرض):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickInquiries.map((inq, idx) => (
                  <a
                    key={idx}
                    href={buildWhatsAppLink(inq.query)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white hover:bg-[#f0fdf4] border border-[#d1fae5] hover:border-[#86efac] text-right text-xs transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                  >
                    <span className="font-bold text-[#166534] group-hover:text-[#14532d]">
                      {inq.title}
                    </span>
                    <Send className="w-3.5 h-3.5 text-[#10b981] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* هوية الأرض - الـ 6 أركان الرئيسية */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#14281d] border-b border-[#edf3ef] pb-2 flex items-center gap-1.5">
              <span>🌱 هوية ومواصفات الأرض المعتمدة</span>
            </h3>

            {/* 1. الموقع والوصول */}
            <div className="bg-[#fcfdfc] p-3.5 rounded-xl border border-[#e2eae5] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                <Compass className="w-4 h-4 text-[#16a34a]" />
                <span>1. الموقع الجغرافي ونوع الطريق</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#374151]">
                <div>
                  <span className="text-[#6b7280]">الموقع الإداري: </span>
                  <span className="font-semibold">{listing.governorate} - مركز {listing.city} {listing.village ? `(${listing.village})` : ''}</span>
                </div>
                <div>
                  <span className="text-[#6b7280]">نوع الطريق: </span>
                  <span className="font-semibold">{listing.roadType || 'طريق ممهد'}</span>
                </div>
                {listing.distanceFromMainRoad && (
                  <div className="sm:col-span-2">
                    <span className="text-[#6b7280]">المسافة من الطريق الرئيسي: </span>
                    <span className="font-semibold text-[#0284c7]">{listing.distanceFromMainRoad}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. المساحة والواجهة */}
            <div className="bg-[#fcfdfc] p-3.5 rounded-xl border border-[#e2eae5] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                <Maximize2 className="w-4 h-4 text-[#16a34a]" />
                <span>2. أبعاد وشكل الأرض</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#374151]">
                <div>
                  <span className="text-[#6b7280]">المساحة الإجمالية: </span>
                  <span className="font-bold text-[#14281d] font-sans">{listing.area} {listing.areaUnit}</span>
                </div>
                <div>
                  <span className="text-[#6b7280]">الواجهة على الطريق: </span>
                  <span className="font-semibold">{listing.frontageMeters ? `${listing.frontageMeters} متر` : 'متناسقة'}</span>
                </div>
                {listing.landShape && (
                  <div className="sm:col-span-2">
                    <span className="text-[#6b7280]">شكل القطعة: </span>
                    <span className="font-semibold">{listing.landShape}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. المياه والري */}
            <div className="bg-[#f0f9ff]/70 p-3.5 rounded-xl border border-[#bae6fd] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369a1]">
                <Droplets className="w-4 h-4 text-[#0284c7]" />
                <span>3. مصادر المياه وجودة الري 💧</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0f172a]">
                <div>
                  <span className="text-[#64748b]">نوع المصدر: </span>
                  <span className="font-bold text-[#0369a1]">{listing.waterSourceType || listing.waterSource || 'بئر جوفي'}</span>
                </div>
                <div>
                  <span className="text-[#64748b]">الملوحة والتحليل: </span>
                  <span className="font-bold text-[#166534]">{listing.waterSalinityTDS || 'عذبة صالحة للزراعة'}</span>
                </div>
                {listing.wellsCount !== undefined && (
                  <div>
                    <span className="text-[#64748b]">عدد الآبار: </span>
                    <span className="font-semibold">{listing.wellsCount} {listing.wellDepthMeters ? `(عمق ${listing.wellDepthMeters}م)` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. البنية التحتية والمرافق */}
            <div className="bg-[#fcfdfc] p-3.5 rounded-xl border border-[#e2eae5] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                <Zap className="w-4 h-4 text-[#ca8a04]" />
                <span>4. البنية التحتية والكهرباء والري</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#374151]">
                <div>
                  <span className="text-[#6b7280]">مصدر الكهرباء: </span>
                  <span className="font-semibold">{listing.electricityType || (listing.electricity ? 'كهرباء متوفرة' : 'طاقة شمسية')}</span>
                </div>
                <div>
                  <span className="text-[#6b7280]">نظام الري: </span>
                  <span className="font-semibold">{listing.irrigationType || (listing.irrigationNetwork ? 'شبكة ري حديثة' : 'ري بالتنقيط')}</span>
                </div>
                {listing.buildings && (
                  <div className="sm:col-span-2">
                    <span className="text-[#6b7280]">المباني والاستراحات: </span>
                    <span className="font-semibold">{listing.buildings}</span>
                  </div>
                )}
                {listing.fencing && (
                  <div className="sm:col-span-2">
                    <span className="text-[#6b7280]">السور والتأمين: </span>
                    <span className="font-semibold">{listing.fencing}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. الزراعة والمحاصيل */}
            <div className="bg-[#f0fdf4]/70 p-3.5 rounded-xl border border-[#bbf7d0] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                <Trees className="w-4 h-4 text-[#16a34a]" />
                <span>5. المحاصيل والإنتاجية 🌾</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#14281d]">
                <div>
                  <span className="text-[#527963]">حالة الزراعة: </span>
                  <span className="font-bold">{listing.cultivationStatus || 'مزروعة ومنتجة'}</span>
                </div>
                <div>
                  <span className="text-[#527963]">المحاصيل الحالية: </span>
                  <span className="font-semibold">{listing.mainCrops || 'أشجار مثمرة ومحاصيل'}</span>
                </div>
                {listing.treeAgeYears && (
                  <div>
                    <span className="text-[#527963]">عمر الأشجار: </span>
                    <span className="font-semibold">{listing.treeAgeYears} سنوات</span>
                  </div>
                )}
                {listing.productivityNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-[#527963]">ملاحظات الإنتاج: </span>
                    <span className="font-semibold">{listing.productivityNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. الملكية القانونية والمستندات */}
            <div className="bg-[#fcfdfc] p-3.5 rounded-xl border border-[#e2eae5] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                <span>6. الملكية القانونية والمستندات المتاحة 📜</span>
              </div>
              <div className="text-xs text-[#374151] space-y-1">
                <div>
                  <span className="text-[#6b7280]">نوع الملكية: </span>
                  <span className="font-bold text-[#166534]">{listing.ownershipType || listing.legalStatus || 'عقد مسجل شهر عقاري'}</span>
                </div>
                {listing.documentsAvailable && listing.documentsAvailable.length > 0 && (
                  <div>
                    <span className="text-[#6b7280]">المستندات المدققة: </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {listing.documentsAvailable.map((doc, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-[11px] font-medium">
                          ✓ {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="text-sm font-bold text-[#14281d] border-b border-[#edf3ef] pb-1.5 mb-2">
                تفاصيل ووصف الإعلان
              </h3>
              <p className="text-sm text-[#4b6354] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Key Features */}
          {listing.features && listing.features.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#14281d] border-b border-[#edf3ef] pb-1.5 mb-2.5">
                مزايا الأرض الإضافية
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#374151]">
                    <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="sticky bottom-0 bg-[#f7faf8] px-6 py-4 border-t border-[#edf3ef] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#527963] hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse"></span>
            <span>تواصل مباشر مع المعلن ({ownerDisplayName}): <strong className="text-[#14281d] font-sans">{profilePhone}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>محادثة واتساب سريعة</span>
            </a>

            <a
              href={`tel:${profilePhone}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال هاتفي ({profilePhone})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
