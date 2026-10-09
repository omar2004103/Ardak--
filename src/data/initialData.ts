import { User, ListingReport, Listing, AdvertiserType } from '../types/listing.ts';
import { listings as baseListings } from './listings.ts';

export const initialUsers: User[] = [
  {
    id: 'user-001',
    name: 'أحمد محمود',
    phone: '01012345671',
    email: 'ahmed@ardak.eg',
    governorate: 'البحيرة',
    role: 'user', // مستخدم: مشتري/باحث عن أرض، ويمكنه أيضاً عرض أرضه
    accountType: 'مالك',
    phoneVerified: true,
    verificationLevel: 'member', // 🟢 عضو عادي
    status: 'active',
    joinedAt: '2024-01-15',
  },
  {
    id: 'agent-001',
    name: 'سامي التميمي',
    phone: '01098765432',
    email: 'sami@ardak.eg',
    governorate: 'البحيرة',
    role: 'agent', // وكيل/مسوق: يعرض أراضي نيابة عن ملاك
    accountType: 'وسيط',
    phoneVerified: true,
    verificationLevel: 'verified_user', // 🔵 تم التحقق من بعض بياناته
    status: 'active',
    joinedAt: '2023-11-20',
  },
  {
    id: 'company-001',
    name: 'شركة النيل للاستثمار الزراعي واستصلاح الأراضي',
    phone: '01234567890',
    email: 'contact@nile-agri.eg',
    governorate: 'الإسكندرية',
    role: 'company', // شركة: تعرض عدة أراضي واستثمارات
    accountType: 'شركة عقارية',
    phoneVerified: true,
    verificationLevel: 'verified_company', // 🔵 تم التحقق من بيانات الشركة وفق المستندات
    companyProfile: {
      companyName: 'شركة النيل للاستثمار الزراعي واستصلاح الأراضي',
      phone: '01234567890',
      whatsapp: '01234567890',
      bio: 'شركة رائدة متخصصة في تطوير واستصلاح الأراضي الزراعية وتجهيز مزارع الفاكهة والنخيل بمحافظات الدلتا والظهير الصحراوي.',
      governorate: 'الإسكندرية',
      operatingGovernorates: ['البحيرة', 'الإسكندرية', 'مطروح'],
      commercialRegister: 'س.ت: 48921 إسكندرية',
      taxCard: 'ب.ض: 782-190-332',
      listingsCount: 37,
      isVerified: true,
    },
    status: 'active',
    joinedAt: '2023-05-10',
  },
  {
    id: 'admin-001',
    name: 'م. عادل إبراهيم (إدارة المنصة)',
    phone: '01000000000',
    email: 'admin@ardak.eg',
    governorate: 'القاهرة',
    role: 'admin', // أدمن: إدارة ومراجعة المنصة (ممنوع في صفحة التسجيل)
    accountType: 'شركة عقارية',
    phoneVerified: true,
    verificationLevel: 'verified_user',
    status: 'active',
    joinedAt: '2023-01-01',
  },
];

export const initialListings: Listing[] = baseListings.map((listing, index) => {
  // Give first 3 listings to owner-001
  const isOwnerListing = index < 3;
  return {
    ...listing,
    status: 'published',
    ownerId: isOwnerListing ? 'owner-001' : `owner-${index + 10}`,
    ownerName: isOwnerListing ? 'الحاج محمود عبد الله' : 'شركة الدلتا للتطوير والاستثمار الزراعي',
    advertiserType: (isOwnerListing ? 'مالك' : index % 2 === 0 ? 'وسيط' : 'شركة عقارية') as AdvertiserType,
    isVerified: true,
    phoneVerified: true,
    createdAt: new Date(Date.now() - (index + 1) * 86400000 * 3).toISOString().split('T')[0],
    viewsCount: 120 + index * 45,
  };
});

// Also add 1 pending approval listing so admin can test approval flow right away!
initialListings.push({
  id: 'ard-pending-01',
  title: 'أرض زراعية 12 فدان بئر خاص بطريق مصر إسكندرية الصحراوي',
  price: '6,200,000 ج.م',
  rawPrice: 6200000,
  area: 12,
  areaUnit: 'فدان',
  governorate: 'البحيرة',
  city: 'وادي النطرون',
  propertyType: 'أرض زراعية',
  listingType: 'بيع',
  imagePlaceholder: {
    theme: 'citrus',
    tag: 'إعلان جديد بانتظار المراجعة',
  },
  features: ['بئر عميق 140م', 'طاقة شمسية', 'طريق ممهد', 'عقد تمليك خالص'],
  waterSource: 'بئر جوفي ملوحة 450 جزء في المليون',
  electricity: true,
  legalStatus: 'عقد مسجل شهر عقاري',
  contactPhone: '01012345671',
  whatsappNumber: '201012345671',
  description: 'إعلان جديد تم إرساله من المالك، مزروعة برتقال صيفي عمر 4 سنوات، تروى بالتنقيط بالكامل.',
  location: {
    lat: 30.41,
    lng: 30.29,
  },
  status: 'pending_approval',
  ownerId: 'owner-001',
  ownerName: 'الحاج محمود عبد الله',
  advertiserType: 'مالك',
  isVerified: false,
  phoneVerified: true,
  createdAt: new Date().toISOString().split('T')[0],
  viewsCount: 12,
});

export const initialReports: ListingReport[] = [
  {
    id: 'rep-001',
    listingId: 'ard-006',
    listingTitle: 'قطعة 2 قيراط في المنوفية',
    reporterName: 'سعيد عبد الرازق',
    reporterPhone: '01122334455',
    reason: 'sold',
    details: 'تواصلت مع الرقم وقال المالك إنه تم تأجير القطعة بالفعل الأسبوع الماضي ويرجى تحديث الإعلان.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString().split('T')[0],
  },
];
