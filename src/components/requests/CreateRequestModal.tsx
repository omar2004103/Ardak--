import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  AlertCircle,
  Clock,
  MapPin,
  Maximize2,
  Coins,
  CheckCircle2,
  Eye,
  EyeOff,
  Droplets,
  Zap,
  Navigation,
  FileText,
  ShieldAlert,
  LogIn,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { egyptianGovernorates } from '../../data/listings.ts';
import {
  PurchaseRequestCategory,
  RequestAreaUnit,
  BudgetVisibility,
  PurchasePurpose,
  ContactPreference,
} from '../../types/purchaseRequest.ts';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: (requestId: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

const CATEGORIES: PurchaseRequestCategory[] = [
  'أرض زراعية',
  'مزرعة',
  'أرض استصلاح',
  'أرض سكنية',
  'أرض تجارية',
  'استثمارية',
  'أخرى',
];

const PURPOSES: PurchasePurpose[] = [
  'استثمار زراعي وتجاري',
  'إنشاء مزرعة نموذجية',
  'إنتاج حيواني وداجني',
  'تصدير زراعي ونخيل',
  'استصلاح وطاقة شمسية',
  'سكن ريفي ومزرعة خاصة',
  'مشروع صناعي زراعي',
  'أخرى',
];

const WATER_OPTIONS = [
  'ترعة دائمة (ري بحاري)',
  'بئر جوفي ارتوازي',
  'مختلط (ترعة + بئر)',
  'شبكة مياه حكومية',
  'غير مشترط حالياً',
];

const ROAD_OPTIONS = [
  'أسفلت رئيسي مباشر',
  'طريق أسفلتي فرعي',
  'مدق ترابي ممهد',
  'قريب من محور أو طريق إقليمي',
];

const ELECTRICITY_OPTIONS = [
  'محول كهرباء خاص',
  'كهرباء عمومية 3 فاز',
  'طاقة شمسية',
  'شبكة ريفية عادية',
  'غير مشترط / بدون كهرباء',
];

const LEGAL_OPTIONS = [
  'عقد مسجل شهر عقاري',
  'عقد تمليك نهائي خالص',
  'حيازة زراعية معتمدة',
  'ملف تقنين 144 مستوفي',
  'عقد تخصيص هيئة التعمير',
  'أي مستند قابل للمعاينة',
];

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
  onOpenAuthModal,
}) => {
  const { currentUser, createRequest } = useApp();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PurchaseRequestCategory>('أرض زراعية');
  const [governorate, setGovernorate] = useState(egyptianGovernorates[0] || 'البحيرة');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  const [areaMin, setAreaMin] = useState<string>('');
  const [areaMax, setAreaMax] = useState<string>('');
  const [areaUnit, setAreaUnit] = useState<RequestAreaUnit>('فدان');

  const [isBudgetUnspecified, setIsBudgetUnspecified] = useState(false);
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [budgetVisibility, setBudgetVisibility] = useState<BudgetVisibility>('public');

  const [purpose, setPurpose] = useState<PurchasePurpose>('استثمار زراعي وتجاري');
  const [waterSource, setWaterSource] = useState(WATER_OPTIONS[0]);
  const [roadType, setRoadType] = useState(ROAD_OPTIONS[0]);
  const [electricity, setElectricity] = useState(ELECTRICITY_OPTIONS[0]);
  const [legalStatus, setLegalStatus] = useState(LEGAL_OPTIONS[0]);

  const [description, setDescription] = useState('');
  const [contactPreferences, setContactPreferences] = useState<ContactPreference>('phone_and_whatsapp');
  const [durationDays, setDurationDays] = useState<number>(30);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Non-authenticated guard
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">تسجيل الدخول مطلوب</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            وفقاً لسياسة الأمان في منصة أرضك، لا يمكن نشر طلبات شراء أراضٍ إلا من خلال حساب مسجّل وموثق لضمان جدية الطلبات وحماية الخصوصية.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenAuthModal) onOpenAuthModal('login');
              }}
              className="w-full py-3 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
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
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium mt-1"
            >
              إلغاء والعودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!title.trim() || title.length < 5) {
      setErrorMessage('يرجى كتابة عنوان واضح للطلب لا يقل عن 5 أحرف.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('يرجى تحديد المركز أو المدينة المطلوبة.');
      return;
    }

    const minA = parseFloat(areaMin);
    const maxA = parseFloat(areaMax);
    if (isNaN(minA) || minA <= 0) {
      setErrorMessage('يرجى إدخال حد أدنى صحيح للمساحة أكبر من الصفر.');
      return;
    }
    if (isNaN(maxA) || maxA <= 0) {
      setErrorMessage('يرجى إدخال حد أقصى صحيح للمساحة.');
      return;
    }
    if (minA > maxA) {
      setErrorMessage('الحد الأدنى للمساحة لا يمكن أن يتجاوز الحد الأقصى.');
      return;
    }

    let minB: number | undefined = undefined;
    let maxB: number | undefined = undefined;
    if (!isBudgetUnspecified) {
      minB = budgetMin ? parseFloat(budgetMin) : undefined;
      maxB = budgetMax ? parseFloat(budgetMax) : undefined;

      if (minB !== undefined && minB < 0) {
        setErrorMessage('الميزانية لا يمكن أن تكون قيمة سالبة.');
        return;
      }
      if (maxB !== undefined && maxB <= 0) {
        setErrorMessage('يرجى إدخال حد أقصى صحيح للميزانية.');
        return;
      }
      if (minB !== undefined && maxB !== undefined && minB > maxB) {
        setErrorMessage('الحد الأدنى للميزانية لا يمكن أن يتجاوز الحد الأقصى.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await createRequest({
        title: title.trim(),
        category,
        governorate,
        city: city.trim(),
        district: district.trim() || undefined,
        areaMin: minA,
        areaMax: maxA,
        areaUnit,
        budgetMin: minB,
        budgetMax: maxB,
        isBudgetUnspecified,
        budgetVisibility,
        purpose,
        requirements: {
          waterSource,
          roadType,
          electricity,
          legalStatus,
        },
        contactPreferences,
        description: description.trim() || undefined,
        durationDays,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'تعذر نشر الطلب، يرجى المحاولة لاحقاً.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('تم نشر طلب الشراء بنجاح! سيظهر لجميع أصحاب الأراضي والمزارع.');
      setTimeout(() => {
        setIsSubmitting(false);
        if (onRequestCreated && res.id) {
          onRequestCreated(res.id);
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء حفظ الطلب.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-l from-[#14532d] to-[#166534] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileCheck2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">إضافة طلب شراء أرض</h2>
              <p className="text-xs text-emerald-100/80">انشر مواصفاتك وسيتواصل معك أصحاب الأراضي بالعروض المناسبة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#14532d] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              المعلومات الأساسية ونوع الأرض
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                عنوان الطلب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مطلوب مزرعة 5 إلى 10 فدان بوادي النطرون ري بحاري"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all"
                maxLength={90}
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {title.length}/90 حرف — اكتب عنواناً واضحاً وجذاباً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  نوع الأرض / التصنيف <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PurchaseRequestCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  الغرض الأساسي من الشراء <span className="text-red-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as PurchasePurpose)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {PURPOSES.map((purp) => (
                    <option key={purp} value={purp}>
                      {purp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#14532d] flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              الموقع الجغرافي المطلوب
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  المحافظة <span className="text-red-500">*</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {egyptianGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  المركز / المدينة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: وادي النطرون"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  المنطقة أو القرية <span className="text-gray-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثال: قرية بني سلامة"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                />
              </div>
            </div>
          </div>

          {/* 3. Area and Budget */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#14532d] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              المساحة والميزانية المستهدفة
            </h4>

            {/* Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  نطاق المساحة <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">الوحدة:</span>
                  {(['فدان', 'قيراط', 'متر مربع'] as RequestAreaUnit[]).map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setAreaUnit(u)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        areaUnit === u
                          ? 'bg-[#166534] text-white border-[#166534]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={areaMin}
                    onChange={(e) => setAreaMin(e.target.value)}
                    placeholder="الحد الأدنى للمساحة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    placeholder="الحد الأقصى للمساحة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  الميزانية المقدرة (بالجنيه المصري)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBudgetUnspecified}
                    onChange={(e) => setIsBudgetUnspecified(e.target.checked)}
                    className="rounded text-[#166534] focus:ring-emerald-500"
                  />
                  <span>بدون تحديد ميزانية (مفتوح للتفاوض)</span>
                </label>
              </div>

              {!isBudgetUnspecified && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="من (مثال: 500,000 ج.م)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="إلى (مثال: 2,500,000 ج.م)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                    />
                  </div>

                  {/* Budget visibility toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      {budgetVisibility === 'public' ? (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-amber-600" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {budgetVisibility === 'public' ? 'إظهار الميزانية للعامة' : 'إخفاء الميزانية عن العامة'}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {budgetVisibility === 'public'
                            ? 'ستظهر ميزانيتك في كارت الطلب لجميع الزوار.'
                            : 'ستظهر عبارة (ميزانية خاصة) ولن يراها إلا مقدمو العروض بعد التقديم.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setBudgetVisibility((prev) => (prev === 'public' ? 'hidden' : 'public'))
                      }
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        budgetVisibility === 'public'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {budgetVisibility === 'public' ? 'معلنة للجميع' : 'مخفية'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Requirements */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#14532d] flex items-center gap-2 border-b border-gray-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              المواصفات والاشتراطات الفنية
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  مصدر المياه المطلوب
                </label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {WATER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-stone-600" />
                  نوع الطريق والوصول
                </label>
                <select
                  value={roadType}
                  onChange={(e) => setRoadType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {ROAD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  اشتراطات الكهرباء
                </label>
                <select
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {ELECTRICITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  المستندات القانونية المقبولة
                </label>
                <select
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#166534] text-sm"
                >
                  {LEGAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                تفاصيل وملاحظات إضافية <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اذكر أي تفاصيل إضافية مثل: ملوحة مياه معينة، وجود حيازة، رغبة في استراحة أو شبكة ري قائمة، شروط سداد كاش أو تقسيط..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-sm"
                maxLength={800}
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {description.length}/800 حرف
              </span>
            </div>
          </div>

          {/* 5. Contact Preferences & Duration */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#14532d] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              طريقة التواصل ومدة صلاحية الطلب
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                طريقة التواصل المفضلة <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'phone_and_whatsapp' as ContactPreference,
                    label: 'اتصال هاتفي وواتساب',
                    sub: 'إظهار رقم الهاتف لأصحاب العروض',
                  },
                  {
                    id: 'whatsapp_only' as ContactPreference,
                    label: 'واتساب فقط',
                    sub: 'دردشة عبر الواتساب دون اتصالات مباشرة',
                  },
                  {
                    id: 'internal_offer_only' as ContactPreference,
                    label: 'عروض المنصة فقط',
                    sub: 'أقصى خصوصية، إخفاء الرقم تماماً',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      contactPreferences === item.id
                        ? 'border-[#166534] bg-emerald-50/60 ring-1 ring-[#166534]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">{item.label}</span>
                      <input
                        type="radio"
                        name="contactPref"
                        checked={contactPreferences === item.id}
                        onChange={() => setContactPreferences(item.id)}
                        className="text-[#166534] focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 leading-tight">{item.sub}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                مدة بقاء الطلب نشطاً <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                {[7, 15, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      durationDays === days
                        ? 'bg-[#166534] text-white border-[#166534] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {days} يوماً
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                يمكنك تجديد مدة الطلب أو إغلاقه في أي وقت لاحقاً من صفحة «طلباتي».
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              يُنشر الطلب فورياً في قسم «طلبات الشراء» ويصبح متاحاً لأصحاب الأراضي لتقديم عروضهم. المنصة سوق مباشر ولا تطلب أي رسوم خفية أو عمولات سمسرة.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>نشر الطلب الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
