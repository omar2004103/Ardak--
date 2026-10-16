import React, { useState } from 'react';
import {
  X,
  Sprout,
  CheckCircle2,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  ShieldCheck,
  Plus,
  Camera,
} from 'lucide-react';
import { egyptianGovernorates } from '../../data/listings.ts';
import { useApp } from '../../context/AppContext.tsx';
import {
  ListingType,
  PropertyType,
  AreaUnit,
  AdvertiserType,
  RoadType,
  WaterSourceType,
  CultivationStatus,
  OwnershipType,
} from '../../types/listing.ts';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: (listingId: string) => void;
}

const govCoords: Record<string, { lat: number; lng: number }> = {
  البحيرة: { lat: 30.8251, lng: 30.5342 },
  الإسكندرية: { lat: 31.0264, lng: 29.8081 },
  الشرقية: { lat: 30.5877, lng: 31.502 },
  المنوفية: { lat: 30.5503, lng: 30.9935 },
  الجيزة: { lat: 29.987, lng: 31.2118 },
  'الوادي الجديد': { lat: 25.4514, lng: 30.5463 },
  القليوبية: { lat: 30.3292, lng: 31.2168 },
  الدقهلية: { lat: 31.0409, lng: 31.3785 },
  'كفر الشيخ': { lat: 31.1107, lng: 30.9388 },
  الفيوم: { lat: 29.3084, lng: 30.8428 },
  'بني سويف': { lat: 29.0661, lng: 31.0994 },
  المنيا: { lat: 28.0871, lng: 30.7618 },
  أسيوط: { lat: 27.1783, lng: 31.1859 },
  مطروح: { lat: 31.3543, lng: 27.2373 },
  الإسماعيلية: { lat: 30.5965, lng: 32.2715 },
  السويس: { lat: 29.9668, lng: 32.5498 },
};

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const { addListing, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('بيع');
  const [propertyType, setPropertyType] = useState<PropertyType>('أرض زراعية');
  const [advertiserType, setAdvertiserType] = useState<AdvertiserType>(
    currentUser?.accountType || 'مالك'
  );
  const [governorate, setGovernorate] = useState('البحيرة');
  const [city, setCity] = useState('');
  const [village, setVillage] = useState('');
  const [roadType, setRoadType] = useState<RoadType>('مدق ممهد');
  const [distanceFromMainRoad, setDistanceFromMainRoad] = useState('');

  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('فدان');
  const [frontageMeters, setFrontageMeters] = useState('');
  const [price, setPrice] = useState('');

  const [waterSourceType, setWaterSourceType] = useState<WaterSourceType>('ارتوازي (بئر جوفي)');
  const [wellDepthMeters, setWellDepthMeters] = useState('');
  const [waterSalinityTDS, setWaterSalinityTDS] = useState('450 PPM');

  const [electricity, setElectricity] = useState(true);
  const [electricityType, setElectricityType] = useState('محول كهرباء خاص');

  const [cultivationStatus, setCultivationStatus] = useState<CultivationStatus>('مزروعة ومنتجة');
  const [mainCrops, setMainCrops] = useState('');

  const [ownershipType, setOwnershipType] = useState<OwnershipType>('عقد مسجل شهر عقاري');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(
    currentUser?.phone ? `2${currentUser.phone}` : ''
  );
  const [description, setDescription] = useState('');

  // صور الأرض وصور المستندات المرفوعة من الجهاز
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [documentImages, setDocumentImages] = useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState('');

  if (!isOpen) return null;

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
    const numArea = parseFloat(area) || 1;

    const formattedPrice =
      listingType === 'إيجار'
        ? `${rawP.toLocaleString('ar-EG')} ج.م / سنوياً`
        : `${rawP.toLocaleString('ar-EG')} ج.م`;

    const coords = govCoords[governorate] || { lat: 30.0, lng: 31.0 };

    const result = addListing({
      title,
      listingType,
      propertyType,
      advertiserType,
      governorate,
      city,
      village,
      roadType,
      distanceFromMainRoad,
      area: numArea,
      areaUnit,
      frontageMeters: parseFloat(frontageMeters) || undefined,
      rawPrice: rawP,
      price: formattedPrice,
      imagePlaceholder: {
        theme:
          propertyType === 'مزرعة'
            ? 'livestock'
            : propertyType === 'أرض استصلاح'
            ? 'desert-reclamation'
            : 'delta',
        tag: `${propertyType} في ${city || governorate}`,
      },
      features: [
        'تربة خصبة جاهزة',
        waterSourceType,
        electricity ? 'كهرباء متوفرة' : 'طاقة شمسية',
        ownershipType,
      ],
      waterSource: waterSourceType,
      waterSourceType,
      wellDepthMeters: parseFloat(wellDepthMeters) || undefined,
      waterSalinityTDS,
      electricity,
      electricityType,
      cultivationStatus,
      mainCrops,
      legalStatus: ownershipType,
      ownershipType,
      documentsAvailable: [ownershipType, 'خريطة مساحية معتمدة'],
      customImages: customImages.length > 0 ? customImages : undefined,
      documentImages: documentImages.length > 0 ? documentImages : undefined,
      contactPhone: contactPhone || '01012345671',
      whatsappNumber: whatsappNumber || '201012345671',
      description,
      location: coords,
    });

    setCreatedId(result.id);
    setSubmitted(true);
  };

  const handleFinish = () => {
    setSubmitted(false);
    onClose();
    if (onListingCreated && createdId) {
      onListingCreated(createdId);
    }
  };

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
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center border border-[#bbf7d0]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14281d]">
                تسجيل هوية أرض أو مزرعة جديدة
              </h2>
              <span className="text-[11px] text-[#527963]">
                بناء ملف وهوية زراعية موثقة للأرض لعرضها أمام آلاف المشترين
              </span>
            </div>
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
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#14281d]">
                  تم تسجيل هوية أرضك بنجاح!
                </h3>
                <p className="text-xs text-[#527963] max-w-sm mx-auto mt-1">
                  أصبح إعلانك بهويته الكاملة متاحاً في لوحة تحكمك، وسيتم مراجعته وظهوره في نتائج البحث وعلى الخريطة.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <span>عرض ومتابعة إعلاناتي</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  عنوان الإعلان الواضح
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أرض زراعية 10 فدان ري بحاري بوادي النطرون"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2.5 text-xs outline-hidden"
                />
              </div>

              {/* Transaction & Advertiser Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    صفتك كمعلن
                  </label>
                  <select
                    value={advertiserType}
                    onChange={(e) => setAdvertiserType(e.target.value as AdvertiserType)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  >
                    <option value="مالك">مالك</option>
                    <option value="وسيط">وسيط</option>
                    <option value="شركة عقارية">شركة عقارية</option>
                  </select>
                </div>
              </div>

              {/* 1. الموقع والوصول */}
              <div className="bg-[#fcfdfc] p-3.5 rounded-xl border border-[#e2eae5] space-y-3">
                <span className="text-xs font-bold text-[#166534] block">
                  1. الموقع الجغرافي والوصول:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1">
                      المحافظة
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    >
                      {egyptianGovernorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1">
                      المركز / المدينة
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: وادي النطرون"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1">
                      القرية / المنطقة
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: بني سلامة"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1">
                      نوع الطريق المؤدي للأرض
                    </label>
                    <select
                      value={roadType}
                      onChange={(e) => setRoadType(e.target.value as RoadType)}
                      className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    >
                      <option value="أسفلت مباشر">أسفلت مباشر</option>
                      <option value="مدق ممهد">مدق ممهد</option>
                      <option value="طريق ترابي">طريق ترابي</option>
                      <option value="طريق خرساني">طريق خرساني</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1">
                      المسافة من الطريق الرئيسي
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 800 متر من الطريق الصحراوي"
                      value={distanceFromMainRoad}
                      onChange={(e) => setDistanceFromMainRoad(e.target.value)}
                      className="w-full bg-white border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2. المساحة والسعر */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    المساحة الإجمالية
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      placeholder="10"
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
                    الواجهة على الطريق (متر)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 150"
                    value={frontageMeters}
                    onChange={(e) => setFrontageMeters(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    السعر المطلوب (ج.م)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="5000"
                    placeholder="مثال: 4500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
              </div>

              {/* 3. المياه والري */}
              <div className="bg-[#f0f9ff]/70 p-3.5 rounded-xl border border-[#bae6fd] space-y-3">
                <span className="text-xs font-bold text-[#0369a1] block">
                  3. مصادر المياه والري:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">
                      نوع مصدر المياه
                    </label>
                    <select
                      value={waterSourceType}
                      onChange={(e) => setWaterSourceType(e.target.value as WaterSourceType)}
                      className="w-full bg-white border border-[#bae6fd] focus:border-[#0284c7] rounded-xl px-3 py-2 text-xs outline-hidden"
                    >
                      <option value="ارتوازي (بئر جوفي)">ارتوازي (بئر جوفي)</option>
                      <option value="ترعة (ري بحاري نيلي)">ترعة (ري بحاري نيلي)</option>
                      <option value="مختلط (ترعة + بئر)">مختلط (ترعة + بئر)</option>
                      <option value="معالجة ثلاثية">معالجة ثلاثية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">
                      عمق البئر إن وُجد (متر)
                    </label>
                    <input
                      type="number"
                      placeholder="مثال: 120"
                      value={wellDepthMeters}
                      onChange={(e) => setWellDepthMeters(e.target.value)}
                      className="w-full bg-white border border-[#bae6fd] focus:border-[#0284c7] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f172a] mb-1">
                      الملوحة (PPM)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 450 PPM"
                      value={waterSalinityTDS}
                      onChange={(e) => setWaterSalinityTDS(e.target.value)}
                      className="w-full bg-white border border-[#bae6fd] focus:border-[#0284c7] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 4. الزراعة والكهرباء والملكية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    حالة الزراعة
                  </label>
                  <select
                    value={cultivationStatus}
                    onChange={(e) => setCultivationStatus(e.target.value as CultivationStatus)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  >
                    <option value="مزروعة ومنتجة">مزروعة ومنتجة</option>
                    <option value="بور مستصلحة">بور مستصلحة</option>
                    <option value="تحت التجهيز والشبكات">تحت التجهيز والشبكات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    المحاصيل أو الأشجار
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: برتقال صيفي وزيتون كلاماتا"
                    value={mainCrops}
                    onChange={(e) => setMainCrops(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    نوع الملكية القانونية
                  </label>
                  <select
                    value={ownershipType}
                    onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  >
                    <option value="عقد مسجل شهر عقاري">عقد مسجل شهر عقاري</option>
                    <option value="عقد تمليك نهائي خالص">عقد تمليك نهائي خالص</option>
                    <option value="حيازة زراعية معتمدة">حيازة زراعية معتمدة</option>
                    <option value="تقنين مدفوع بالكامل">تقنين مدفوع بالكامل</option>
                    <option value="حق انتفاع">حق انتفاع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    الكهرباء والمصدر
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: محول خاص 100 ك.ف.أ أو طاقة شمسية"
                    value={electricityType}
                    onChange={(e) => setElectricityType(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    رقم الهاتف للاتصال
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
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
                    placeholder="201xxxxxxxxx"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  تفاصيل ووصف إضافي للأرض
                </label>
                <textarea
                  rows={2}
                  placeholder="اكتب مواصفات التربة والمباني والطرق المجاورة..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl p-3 text-xs outline-hidden resize-none"
                />
              </div>

              {/* قسم 1: رفع صور الأرض والمزرعة من جهازك */}
              <div className="bg-[#f0fdf4] p-3.5 rounded-2xl border border-[#bbf7d0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                    <Camera className="w-4 h-4 text-[#16a34a]" />
                    <span>رفع صور الأرض والمزرعة من جهازك</span>
                  </div>
                  <span className="text-[11px] text-[#527963]">
                    {customImages.length} صور مختارة
                  </span>
                </div>

                <label className="border-2 border-dashed border-[#86efac] hover:border-[#166534] bg-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group">
                  <Upload className="w-5 h-5 text-[#16a34a] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#166534]">
                    اضغط لاختيار صور الأرض من الهاتف أو الكمبيوتر
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

                {/* Previews */}
                {customImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {customImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-[#86efac] shadow-2xs"
                      >
                        <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
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

              {/* قسم 2: رفع صور الأوراق والمستندات القانونية */}
              <div className="bg-[#f0f9ff] p-3.5 rounded-2xl border border-[#bae6fd] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369a1]">
                    <FileText className="w-4 h-4 text-[#0284c7]" />
                    <span>رفع صور الأوراق والمستندات القانونية (عقود، كشوف مساحية، إيصالات)</span>
                  </div>
                  <span className="text-[11px] text-[#0369a1]">
                    {documentImages.length} مستندات
                  </span>
                </div>

                <label className="border-2 border-dashed border-[#7dd3fc] hover:border-[#0284c7] bg-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group">
                  <ShieldCheck className="w-5 h-5 text-[#0284c7] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#0284c7]">
                    اضغط لرفع صور العقود والأوراق الرسمية من جهازك
                  </span>
                  <span className="text-[10px] text-[#6b7280]">
                    عقد مسجل، بطاقة حيازة، كشف تحديد، إيصال تقنين
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6b7280] hover:bg-[#f3f4f6] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  نشر هوية الأرض
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
