export type ListingType = 'بيع' | 'إيجار';

export type PropertyType = 'أرض زراعية' | 'مزرعة' | 'أرض استصلاح' | 'أرض مباني زراعية';

export type AreaUnit = 'فدان' | 'قيراط' | 'متر';

export type ListingStatus = 'published' | 'pending_approval' | 'paused' | 'rejected';

export type AdvertiserType = 'مالك' | 'وسيط' | 'شركة عقارية';

export type RoadType = 'أسفلت مباشر' | 'مدق ممهد' | 'طريق ترابي' | 'طريق خرساني';

export type WaterSourceType =
  | 'ترعة (ري بحاري نيلي)'
  | 'ارتوازي (بئر جوفي)'
  | 'مختلط (ترعة + بئر)'
  | 'معالجة ثلاثية';

export type IrrigationType =
  | 'تنقيط حديث'
  | 'رش محوري Pivot'
  | 'غمر مطور'
  | 'غمر تقليدي';

export type CultivationStatus =
  | 'مزروعة ومنتجة'
  | 'بور مستصلحة'
  | 'تحت التجهيز والشبكات';

export type OwnershipType =
  | 'عقد مسجل شهر عقاري'
  | 'عقد تمليك نهائي خالص'
  | 'حيازة زراعية معتمدة'
  | 'تقنين مدفوع بالكامل'
  | 'حق انتفاع';

// هوية الأرض المتكاملة - Land Identity Data Model
export interface Listing {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  area: number;
  areaUnit: AreaUnit;
  governorate: string;
  city: string;
  propertyType: PropertyType;
  listingType: ListingType;
  imagePlaceholder: {
    theme: 'delta' | 'desert-reclamation' | 'palms' | 'citrus' | 'livestock' | 'nile';
    tag: string;
  };
  features: string[];

  // 1. الموقع الدقيق والوصول
  village?: string;
  district?: string;
  distanceFromMainRoad?: string;
  roadType?: RoadType;
  location: {
    lat: number;
    lng: number;
  };

  // 2. تفاصيل المساحة والواجهة
  qirat?: number;
  landShape?: string;
  frontageMeters?: number;

  // 3. المياه والري
  waterSource?: string;
  waterSourceType?: WaterSourceType;
  wellsCount?: number;
  wellDepthMeters?: number;
  waterSalinityTDS?: string;

  // 4. البنية التحتية والمرافق
  electricity?: boolean;
  electricityType?: string;
  drainage?: boolean;
  drainageType?: string;
  irrigationNetwork?: boolean;
  irrigationType?: IrrigationType;
  buildings?: string;
  storage?: string;
  fencing?: string;

  // 5. الزراعة والمحاصيل
  cultivationStatus?: CultivationStatus;
  mainCrops?: string;
  treeTypes?: string;
  treeAgeYears?: number;
  productivityNotes?: string;

  // 6. الملكية والتوثيق
  legalStatus?: string;
  ownershipType?: OwnershipType;
  ownersCount?: number;
  documentsAvailable?: string[];
  verificationStatus?: 'verified' | 'pending' | 'unverified';

  // صور الأرض والمستندات المرفوعة من الجهاز
  customImages?: string[]; // صور الأرض والمزرعة المرفوعة من جهاز المستخدم
  documentImages?: string[]; // صور العقود والمستندات الرسمية والأوراق القانونية

  // بيانات التواصل والمعلن
  contactPhone: string;
  whatsappNumber: string;
  description?: string;
  status?: ListingStatus;
  ownerId?: string;
  ownerName?: string;
  advertiserType?: AdvertiserType;
  isVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  rejectionReason?: string;
  viewsCount?: number;
}

// سجل الصفقات الفعلية المنفذة في السوق (Sold Transactions Entity)
export interface SoldTransaction {
  id: string;
  title: string;
  governorate: string; // المحافظة
  city: string; // المركز
  village?: string; // القرية
  district?: string; // المنطقة
  areaFeddan: number; // المساحة بالفدان
  askingPrice: number; // السعر المطلوب في الإعلان
  soldPrice: number; // السعر الذي تمت به الصفقة الفعلي
  soldPricePerFeddan: number; // سعر البيع للفدان الفعلي
  saleDate: string; // تاريخ البيع
  propertyType: PropertyType; // نوع الأرض
  waterSource: string; // مصدر المياه
  waterSourceType?: WaterSourceType;
  salinityPPM?: number; // الملوحة
  roadType: RoadType; // نوع الطريق
  distanceFromMainRoad?: string;
  electricity: boolean; // الكهرباء
  electricityType?: string;
  irrigationType?: IrrigationType;
  cultivationStatus: CultivationStatus;
  crops?: string; // المحصول
  ownershipType: OwnershipType; // نوع الملكية
  verifiedByArdak: boolean;
  notes?: string;

  // بيانات الصفقة الداخلية المتقدمة (مخصصة للإدارة والنظام التحليلي حسب الصلاحيات)
  confidentialData?: {
    sellerName: string; // البائع
    buyerName: string; // المشتري
    source: string; // المصدر (الشهر العقاري، جمعية زراعية، وكيل معتمد)
    verificationMethod: string; // طريقة التحقق (مطابقة عقد مشهر، كشف تحديد)
    documentsAttached: string[]; // المستندات (عقد مسجل، إيصال تصرفات)
    confidenceScore: number; // درجة الثقة (مثلاً 98%)
    confidenceLevel: 'عالية جداً' | 'عالية' | 'متوسطة';
  };
}

// Backward compatibility alias
export type SoldDeal = SoldTransaction;

// Comparable Engine Types
export interface SimilarityBreakdown {
  location: number; // max 30%
  area: number; // max 15%
  water: number; // max 15%
  road: number; // max 10%
  electricity: number; // max 10%
  cultivation: number; // max 10%
  infrastructure: number; // max 10%
  totalScore: number; // 0 - 100%
}

export interface ComparableResult {
  transaction: SoldTransaction;
  similarity: SimilarityBreakdown;
  discountPercentage: number;
}

export interface ValuationReport {
  targetAreaFeddan: number;
  comparables: ComparableResult[];
  minPricePerFeddan: number;
  maxPricePerFeddan: number;
  weightedAvgPricePerFeddan: number;
  minTotalEstimatedValue: number;
  maxTotalEstimatedValue: number;
  estimatedTotalValue: number;
  avgNegotiationDiscount: number;
}

export interface SearchFilters {
  operationType: string;
  governorate: string;
  city: string;
  minArea: string;
  maxArea: string;
  maxPrice: string;
  propertyType?: string;
}

// 4 أدوار أساسية مقترحة للمنصة
export type UserRole = 'user' | 'agent' | 'company' | 'admin' | 'owner';

// مستويات التوثيق
export type VerificationLevel = 'member' | 'verified_user' | 'verified_company';

// ملف الشركة أو الحساب التجاري
export interface CompanyProfile {
  companyName: string;
  logo?: string;
  phone: string;
  whatsapp: string;
  bio: string;
  governorate: string;
  operatingGovernorates: string[];
  commercialRegister?: string;
  taxCard?: string;
  listingsCount?: number;
  isVerified?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  governorate?: string;
  role: UserRole;
  accountType?: AdvertiserType;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  firebaseUid?: string;
  verificationLevel?: VerificationLevel;
  companyProfile?: CompanyProfile;
  status: 'active' | 'blocked';
  joinedAt: string;
  avatar?: string;
  password?: string;
  priceAlerts?: string[];
  priceAlertsEnabled?: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userRole: UserRole;
  requestedLevel: VerificationLevel;
  companyName?: string;
  documents: string[];
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export type ReportReason =
  | 'misleading'
  | 'wrong_phone'
  | 'sold'
  | 'scam'
  | 'duplicate'
  | 'other';

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterName: string;
  reporterPhone: string;
  reason: ReportReason;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
