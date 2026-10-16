import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  CheckCircle2,
  Upload,
  Camera,
  FileText,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { Listing, PropertyType, ListingType, AreaUnit } from '../../types/listing.ts';
import { egyptianGovernorates } from '../../data/listings.ts';
import { useApp } from '../../context/AppContext.tsx';

interface EditListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { updateListing } = useApp();

  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('بيع');
  const [propertyType, setPropertyType] = useState<PropertyType>('أرض زراعية');
  const [governorate, setGovernorate] = useState('البحيرة');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('فدان');
  const [price, setPrice] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [electricity, setElectricity] = useState(true);
  const [legalStatus, setLegalStatus] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [description, setDescription] = useState('');
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [documentImages, setDocumentImages] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setListingType(listing.listingType);
      setPropertyType(listing.propertyType);
      setGovernorate(listing.governorate);
      setCity(listing.city);
      setArea(String(listing.area));
      setAreaUnit(listing.areaUnit);
      setPrice(String(listing.rawPrice || ''));
      setWaterSource(listing.waterSource || '');
      setElectricity(listing.electricity ?? true);
      setLegalStatus(listing.legalStatus || '');
      setContactPhone(listing.contactPhone);
      setWhatsappNumber(listing.whatsappNumber);
      setDescription(listing.description || '');
      setCustomImages(listing.customImages || []);
      setDocumentImages(listing.documentImages || []);
      setSaved(false);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleLandImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setDocumentImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCustomImage = (idx: number) => {
    setCustomImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeDocImage = (idx: number) => {
    setDocumentImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawP = parseFloat(price) || 0;
    const formattedPrice =
      listingType === 'إيجار'
        ? `${rawP.toLocaleString('ar-EG')} ج.م / سنوياً`
        : `${rawP.toLocaleString('ar-EG')} ج.م`;

    updateListing(listing.id, {
      title,
      listingType,
      propertyType,
      governorate,
      city,
      area: parseFloat(area) || listing.area,
      areaUnit,
      rawPrice: rawP,
      price: formattedPrice,
      waterSource,
      electricity,
      legalStatus,
      contactPhone,
      whatsappNumber,
      description,
      customImages,
      documentImages,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#14281d]">
              تعديل بيانات الإعلان
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {saved ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#14281d]">
                تم حفظ التعديلات بنجاح
              </h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  عنوان الإعلان
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2 text-xs outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    نوع العملية
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  >
                    <option value="بيع">بيع</option>
                    <option value="إيجار">إيجار</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    نوع العقار
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  >
                    <option value="أرض زراعية">أرض زراعية</option>
                    <option value="مزرعة">مزرعة</option>
                    <option value="أرض استصلاح">أرض استصلاح</option>
                    <option value="أرض مباني زراعية">أرض مباني زراعية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    المحافظة
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  >
                    {egyptianGovernorates.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    المركز / المدينة
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    المساحة والوحدة
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-2/3 bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                      className="w-1/3 bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-1 py-2 text-xs outline-hidden"
                    >
                      <option value="فدان">فدان</option>
                      <option value="قيراط">قيراط</option>
                      <option value="متر">متر</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    السعر المطلوب (ج.م)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    رقم الهاتف للاتصال
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  مصدر المياه والري
                </label>
                <input
                  type="text"
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  الوضع القانوني
                </label>
                <input
                  type="text"
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  الوصف والتفاصيل
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl p-3 text-xs outline-hidden resize-none"
                />
              </div>

              {/* قسم رفع صور الأرض والمزرعة من الجهاز */}
              <div className="bg-[#f0fdf4] p-3.5 rounded-2xl border border-[#bbf7d0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                    <Camera className="w-4 h-4 text-[#16a34a]" />
                    <span>صور الأرض الحية (مرفوعة من جهازك)</span>
                  </div>
                  <span className="text-[11px] text-[#527963]">
                    {customImages.length} صور حالية
                  </span>
                </div>

                <label className="border-2 border-dashed border-[#86efac] hover:border-[#166534] bg-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group">
                  <Upload className="w-5 h-5 text-[#16a34a] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#166534]">
                    اضغط لإضافة صور إضافية للأرض من جهازك (كاميرا / استوديو)
                  </span>
                  <span className="text-[10px] text-[#6b7280]">
                    يدعم صور متعددة (JPG, PNG, WebP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleLandImagesUpload}
                    className="hidden"
                  />
                </label>

                {/* Land Image Previews */}
                {customImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {customImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-[#86efac] shadow-2xs"
                      >
                        <img src={img} alt={`صورة أرض ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeCustomImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* قسم رفع صور الأوراق والمستندات الرسمية والقانونية */}
              <div className="bg-[#f0f9ff] p-3.5 rounded-2xl border border-[#bae6fd] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369a1]">
                    <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                    <span>صور الأوراق والمستندات القانونية (عقود، حيازة، كشوف مساحية)</span>
                  </div>
                  <span className="text-[11px] text-[#0369a1]">
                    {documentImages.length} مستندات
                  </span>
                </div>

                <label className="border-2 border-dashed border-[#7dd3fc] hover:border-[#0284c7] bg-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group">
                  <Upload className="w-5 h-5 text-[#0284c7] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#0284c7]">
                    اضغط لرفع صور أوراق ومستندات الأرض من جهازك
                  </span>
                  <span className="text-[10px] text-[#6b7280]">
                    عقد مسجل، بطاقة حيازة زراعية، كشف مساحي، تراخيص بئر
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleDocImagesUpload}
                    className="hidden"
                  />
                </label>

                {/* Doc Previews */}
                {documentImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {documentImages.map((doc, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden aspect-4/3 border border-[#7dd3fc] bg-white p-1 shadow-2xs"
                      >
                        <img src={doc} alt={`مستند ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                        <span className="absolute bottom-1 right-1 left-1 bg-black/60 text-white text-[9px] font-bold text-center py-0.5 rounded px-1 truncate">
                          مستند رسمي #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDocImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="حذف المستند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
