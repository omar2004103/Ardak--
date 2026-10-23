import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  AlertCircle,
  Save,
  Coins,
  CheckCircle2,
  Droplets,
  Zap,
  Navigation,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  LandPurchaseRequest,
  PurchaseRequestCategory,
  RequestAreaUnit,
  BudgetVisibility,
  PurchasePurpose,
  ContactPreference,
} from '../../types/purchaseRequest.ts';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LandPurchaseRequest | null;
  onRequestUpdated?: () => void;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onRequestUpdated,
}) => {
  const { updateRequest } = useApp();

  const [title, setTitle] = useState(request?.title || '');
  const [city, setCity] = useState(request?.city || '');
  const [district, setDistrict] = useState(request?.district || '');
  const [areaMin, setAreaMin] = useState<string>(request?.areaMin.toString() || '');
  const [areaMax, setAreaMax] = useState<string>(request?.areaMax.toString() || '');
  const [areaUnit, setAreaUnit] = useState<RequestAreaUnit>(request?.areaUnit || 'فدان');

  const [isBudgetUnspecified, setIsBudgetUnspecified] = useState(request?.isBudgetUnspecified || false);
  const [budgetMin, setBudgetMin] = useState<string>(request?.budgetMin?.toString() || '');
  const [budgetMax, setBudgetMax] = useState<string>(request?.budgetMax?.toString() || '');
  const [budgetVisibility, setBudgetVisibility] = useState<BudgetVisibility>(
    request?.budgetVisibility || 'public'
  );

  const [waterSource, setWaterSource] = useState(request?.requirements?.waterSource || '');
  const [roadType, setRoadType] = useState(request?.requirements?.roadType || '');
  const [electricity, setElectricity] = useState(request?.requirements?.electricity || '');
  const [legalStatus, setLegalStatus] = useState(request?.requirements?.legalStatus || '');
  const [description, setDescription] = useState(request?.description || '');
  const [contactPreferences, setContactPreferences] = useState<ContactPreference>(
    request?.contactPreferences || 'phone_and_whatsapp'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state if request prop changes
  React.useEffect(() => {
    if (request) {
      setTitle(request.title || '');
      setCity(request.city || '');
      setDistrict(request.district || '');
      setAreaMin(request.areaMin.toString());
      setAreaMax(request.areaMax.toString());
      setAreaUnit(request.areaUnit);
      setIsBudgetUnspecified(!!request.isBudgetUnspecified);
      setBudgetMin(request.budgetMin?.toString() || '');
      setBudgetMax(request.budgetMax?.toString() || '');
      setBudgetVisibility(request.budgetVisibility || 'public');
      setWaterSource(request.requirements?.waterSource || '');
      setRoadType(request.requirements?.roadType || '');
      setElectricity(request.requirements?.electricity || '');
      setLegalStatus(request.requirements?.legalStatus || '');
      setDescription(request.description || '');
      setContactPreferences(request.contactPreferences || 'phone_and_whatsapp');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || title.length < 5) {
      setErrorMessage('يرجى إدخال عنوان لا يقل عن 5 أحرف.');
      return;
    }

    const minA = parseFloat(areaMin);
    const maxA = parseFloat(areaMax);
    if (isNaN(minA) || minA <= 0 || isNaN(maxA) || maxA <= 0 || minA > maxA) {
      setErrorMessage('يرجى التحقق من أرقام المساحة المدخلة (الحد الأدنى <= الأقصى).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateRequest(request.id, {
        title: title.trim(),
        city: city.trim(),
        district: district.trim() || undefined,
        areaMin: minA,
        areaMax: maxA,
        areaUnit,
        isBudgetUnspecified,
        budgetMin: !isBudgetUnspecified && budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: !isBudgetUnspecified && budgetMax ? parseFloat(budgetMax) : undefined,
        budgetVisibility,
        requirements: {
          waterSource,
          roadType,
          electricity,
          legalStatus,
        },
        contactPreferences,
        description: description.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'تعذر تعديل الطلب.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('تم تحديث بيانات الطلب بنجاح.');
      setTimeout(() => {
        setIsSubmitting(false);
        if (onRequestUpdated) onRequestUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ التعديلات.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-gradient-to-l from-[#14532d] to-[#166534] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-emerald-200" />
            <h2 className="text-base font-bold text-white">تعديل طلب الشراء</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-right">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">عنوان الطلب</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#166534] text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">المركز / المدينة</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">المنطقة (اختياري)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأدنى للمساحة</label>
              <input
                type="number"
                step="any"
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأقصى للمساحة</label>
              <input
                type="number"
                step="any"
                value={areaMax}
                onChange={(e) => setAreaMax(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700">الميزانية</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBudgetUnspecified}
                  onChange={(e) => setIsBudgetUnspecified(e.target.checked)}
                  className="rounded text-[#166534]"
                />
                <span>مفتوح للتفاوض</span>
              </label>
            </div>
            {!isBudgetUnspecified && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="الحد الأدنى ج.م"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="الحد الأقصى ج.م"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">مصدر المياه</label>
              <input
                type="text"
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">المستندات القانونية</label>
              <input
                type="text"
                value={legalStatus}
                onChange={(e) => setLegalStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">وصف تفصيلي</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
              maxLength={800}
            />
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">طريقة التواصل</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'phone_and_whatsapp' as ContactPreference, label: 'هاتف وواتساب' },
                { id: 'whatsapp_only' as ContactPreference, label: 'واتساب فقط' },
                { id: 'internal_offer_only' as ContactPreference, label: 'عروض المنصة فقط' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setContactPreferences(opt.id)}
                  className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                    contactPreferences === opt.id
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
