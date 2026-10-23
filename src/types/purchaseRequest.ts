import { UserRole } from './listing.ts';

export type PurchaseRequestCategory =
  | 'أرض زراعية'
  | 'مزرعة'
  | 'أرض استصلاح'
  | 'أرض سكنية'
  | 'أرض تجارية'
  | 'استثمارية'
  | 'أخرى';

export type RequestAreaUnit = 'فدان' | 'قيراط' | 'متر مربع';

export type RequestStatus = 'open' | 'closed' | 'expired';

export type RequestModerationStatus = 'visible' | 'hidden';

export type BudgetVisibility = 'public' | 'hidden';

export type ContactPreference =
  | 'internal_offer_only' // عروض داخل الموقع فقط
  | 'phone_and_whatsapp'  // اتصال هاتفي وواتساب
  | 'whatsapp_only';      // واتساب فقط

export type PurchasePurpose =
  | 'استثمار زراعي وتجاري'
  | 'إنشاء مزرعة نموذجية'
  | 'إنتاج حيواني وداجني'
  | 'تصدير زراعي ونخيل'
  | 'استصلاح وطاقة شمسية'
  | 'سكن ريفي ومزرعة خاصة'
  | 'مشروع صناعي زراعي'
  | 'أخرى';

export interface PurchaseRequestRequirements {
  waterSource?: string;     // بحاري، بئر جوفي، ترعة، غير محدد
  roadType?: string;        // أسفلت مباشر، مدق ممهد، قريب من الرئيسي
  electricity?: string;     // محول خاص، كهرباء عمومية، طاقة شمسية
  legalStatus?: string;     // عقد مسجل، تمليك نهائي، تقنين مستوفي
}

export interface LandPurchaseRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerRole?: UserRole;
  title: string;
  category: PurchaseRequestCategory;
  governorate: string;
  city: string;
  district?: string;
  areaMin: number;
  areaMax: number;
  areaUnit: RequestAreaUnit;
  budgetMin?: number;
  budgetMax?: number;
  isBudgetUnspecified?: boolean;
  budgetVisibility: BudgetVisibility;
  purpose: PurchasePurpose;
  requirements: PurchaseRequestRequirements;
  contactPreferences: ContactPreference;
  description?: string;
  images?: string[];
  status: RequestStatus;
  moderationStatus: RequestModerationStatus;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  offerCount: number;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type OfferStatus =
  | 'pending'    // قيد المراجعة من صاحب الطلب
  | 'accepted'   // تم القبول المبدئي
  | 'rejected'   // تم الرفض
  | 'withdrawn'  // سحبه مقدم العرض
  | 'expired';   // انتهت صلاحيته

export interface LandOffer {
  id: string;
  requestId: string;
  requestTitle?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerRole?: UserRole;
  existingListingId?: string; // إعلان أرض حالي منشور على أرضك
  existingListingTitle?: string;
  offeredArea: number;
  areaUnit: RequestAreaUnit;
  totalPrice: number;
  pricePerFeddan?: number;
  governorate: string;
  city: string;
  waterSource?: string;
  legalStatus?: string;
  electricity?: boolean;
  message: string;
  images?: string[];
  status: OfferStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequestNotificationType =
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'offer_withdrawn'
  | 'request_expiring'
  | 'request_hidden';

export interface RequestNotification {
  id: string;
  userId: string;
  type: RequestNotificationType;
  title: string;
  message: string;
  requestId: string;
  offerId?: string;
  read: boolean;
  createdAt: string;
}

export interface PurchaseRequestFilters {
  governorate?: string;
  city?: string;
  category?: string;
  minArea?: string;
  maxArea?: string;
  maxBudget?: string;
  status?: string;
  searchQuery?: string;
}
