import React, { useState, useEffect } from 'react';
import { X, Edit3, CheckCircle2 } from 'lucide-react';
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
      setSaved(false);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

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
