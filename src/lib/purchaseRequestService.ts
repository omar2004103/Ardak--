import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import {
  LandPurchaseRequest,
  LandOffer,
  RequestNotification,
  PurchaseRequestFilters,
  RequestStatus,
  RequestModerationStatus,
  OfferStatus,
} from '../types/purchaseRequest.ts';
import { User } from '../types/listing.ts';

export const REQUESTS_COLLECTION = 'landPurchaseRequests';
export const NOTIFICATIONS_COLLECTION = 'request_notifications';
export const AUDIT_LOGS_COLLECTION = 'audit_logs';

/**
 * Validates purchase request inputs strictly
 */
export function validatePurchaseRequestInput(data: Partial<LandPurchaseRequest>): {
  isValid: boolean;
  error?: string;
} {
  if (!data.title || data.title.trim().length < 5) {
    return { isValid: false, error: 'عنوان الطلب يجب أن يتكون من 5 أحرف على الأقل.' };
  }
  if (data.title.trim().length > 150) {
    return { isValid: false, error: 'عنوان الطلب لا يجب أن يتجاوز 150 حرفاً.' };
  }
  if (!data.category) {
    return { isValid: false, error: 'يرجى تحديد نوع الأرض المطلوبة.' };
  }
  if (!data.governorate) {
    return { isValid: false, error: 'يرجى اختيار المحافظة المطلوبة.' };
  }
  if (!data.city || !data.city.trim()) {
    return { isValid: false, error: 'يرجى تحديد المركز أو المدينة المطلوبة.' };
  }
  if (!data.areaMin || data.areaMin <= 0) {
    return { isValid: false, error: 'الحد الأدنى للمساحة يجب أن يكون رقماً موجباً أكبر من الصفر.' };
  }
  if (!data.areaMax || data.areaMax < data.areaMin) {
    return { isValid: false, error: 'الحد الأقصى للمساحة يجب أن يكون مساوياً أو أكبر من الحد الأدنى.' };
  }
  if (!data.areaUnit) {
    return { isValid: false, error: 'يرجى تحديد وحدة المساحة (فدان، قيراط، متر مربع).' };
  }
  if (!data.isBudgetUnspecified) {
    if (data.budgetMin !== undefined && data.budgetMin < 0) {
      return { isValid: false, error: 'الميزانية الدنيا لا يمكن أن تكون قيمة سالبة.' };
    }
    if (data.budgetMax !== undefined && data.budgetMin !== undefined && data.budgetMax < data.budgetMin) {
      return { isValid: false, error: 'الميزانية العليا يجب أن تكون أكبر من أو مساوية للميزانية الدنيا.' };
    }
  }
  return { isValid: true };
}

/**
 * Creates and automatically publishes a new Land Purchase Request to Firestore
 */
export async function createPurchaseRequest(
  buyer: User,
  input: Omit<
    LandPurchaseRequest,
    | 'id'
    | 'buyerId'
    | 'buyerName'
    | 'buyerPhone'
    | 'buyerRole'
    | 'status'
    | 'moderationStatus'
    | 'offerCount'
    | 'createdAt'
    | 'updatedAt'
    | 'expiresAt'
  >
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validation = validatePurchaseRequestInput(input);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const newId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const durationDays = input.durationDays || 30;
    const expiresDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const newRequest: LandPurchaseRequest = {
      ...input,
      id: newId,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerRole: buyer.role,
      status: 'open',
      moderationStatus: 'visible',
      offerCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresDate.toISOString(),
    };

    const docRef = doc(db, REQUESTS_COLLECTION, newId);
    await setDoc(docRef, {
      ...newRequest,
      serverTimestamp: serverTimestamp(),
    });

    return { success: true, id: newId };
  } catch (error: any) {
    console.error('Failed to create purchase request:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء حفظ الطلب في قاعدة البيانات.' };
  }
}

/**
 * Fetches public open purchase requests with filtering and pagination
 */
export async function getPublicPurchaseRequests(
  filters?: PurchaseRequestFilters
): Promise<LandPurchaseRequest[]> {
  try {
    const colRef = collection(db, REQUESTS_COLLECTION);
    // Base query: open and visible requests, limited to 60 for optimal Firestore read costs
    const q = query(
      colRef,
      where('moderationStatus', '==', 'visible'),
      where('status', '==', 'open'),
      limit(60)
    );

    const snap = await getDocs(q);
    const nowTime = new Date().getTime();
    const requests: LandPurchaseRequest[] = [];

    for (const d of snap.docs) {
      const data = d.data() as LandPurchaseRequest;
      // Check expiration dynamically
      const expTime = new Date(data.expiresAt).getTime();
      if (expTime < nowTime && data.status === 'open') {
        data.status = 'expired';
        // Non-blocking background mark
        updateDoc(doc(db, REQUESTS_COLLECTION, data.id), { status: 'expired' }).catch(() => {});
      }

      // Filter locally for multifaceted composite fields without requiring 10+ composite indexes
      let matches = true;

      if (filters?.governorate && filters.governorate !== 'الكل') {
        if (data.governorate !== filters.governorate) matches = false;
      }

      if (filters?.city && filters.city.trim()) {
        const queryCity = filters.city.trim().toLowerCase();
        if (!data.city.toLowerCase().includes(queryCity) && !(data.district || '').toLowerCase().includes(queryCity)) {
          matches = false;
        }
      }

      if (filters?.category && filters.category !== 'الكل') {
        if (data.category !== filters.category) matches = false;
      }

      if (filters?.minArea) {
        const minA = parseFloat(filters.minArea);
        if (!isNaN(minA) && data.areaMax < minA) matches = false;
      }

      if (filters?.maxArea) {
        const maxA = parseFloat(filters.maxArea);
        if (!isNaN(maxA) && data.areaMin > maxA) matches = false;
      }

      if (filters?.maxBudget) {
        const maxB = parseFloat(filters.maxBudget);
        if (!isNaN(maxB) && data.budgetMin && data.budgetMin > maxB) matches = false;
      }

      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const qStr = filters.searchQuery.trim().toLowerCase();
        const inTitle = data.title.toLowerCase().includes(qStr);
        const inDesc = (data.description || '').toLowerCase().includes(qStr);
        const inCity = data.city.toLowerCase().includes(qStr);
        if (!inTitle && !inDesc && !inCity) matches = false;
      }

      if (matches) {
        requests.push(data);
      }
    }

    // Sort by createdAt descending
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return requests;
  } catch (error) {
    console.error('Failed to get public purchase requests:', error);
    return [];
  }
}

/**
 * Fetches a single purchase request by ID
 */
export async function getPurchaseRequestById(
  requestId: string
): Promise<LandPurchaseRequest | null> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data() as LandPurchaseRequest;
    // Check if expired
    if (data.status === 'open' && new Date(data.expiresAt).getTime() < Date.now()) {
      data.status = 'expired';
    }
    return data;
  } catch (error) {
    console.error(`Failed to get request ${requestId}:`, error);
    return null;
  }
}

/**
 * Fetches all purchase requests created by a specific buyer
 */
export async function getUserPurchaseRequests(buyerId: string): Promise<LandPurchaseRequest[]> {
  try {
    const colRef = collection(db, REQUESTS_COLLECTION);
    const q = query(colRef, where('buyerId', '==', buyerId), limit(50));
    const snap = await getDocs(q);

    const list: LandPurchaseRequest[] = [];
    snap.forEach((d) => {
      const item = d.data() as LandPurchaseRequest;
      if (item.status === 'open' && new Date(item.expiresAt).getTime() < Date.now()) {
        item.status = 'expired';
      }
      list.push(item);
    });

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Failed to get user purchase requests:', error);
    return [];
  }
}

/**
 * Updates a purchase request by its owner
 */
export async function updatePurchaseRequest(
  requestId: string,
  buyerId: string,
  updates: Partial<LandPurchaseRequest>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      return { success: false, error: 'الطلب غير موجود.' };
    }

    const data = existing.data() as LandPurchaseRequest;
    if (data.buyerId !== buyerId) {
      return { success: false, error: 'غير مصرح لك بتعديل هذا الطلب.' };
    }

    // Disallow overriding buyerId or moderationStatus directly
    delete updates.buyerId;
    delete updates.moderationStatus;
    delete updates.offerCount;

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update purchase request:', error);
    return { success: false, error: error.message || 'فشل تحديث الطلب.' };
  }
}

/**
 * Closes a purchase request
 */
export async function closePurchaseRequest(
  requestId: string,
  buyerId: string
): Promise<{ success: boolean; error?: string }> {
  return updatePurchaseRequest(requestId, buyerId, { status: 'closed' });
}

/**
 * Renews an expired or closed request with a fresh duration
 */
export async function renewPurchaseRequest(
  requestId: string,
  buyerId: string,
  durationDays: number = 30
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();
  const newExpires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return updatePurchaseRequest(requestId, buyerId, {
    status: 'open',
    durationDays,
    expiresAt: newExpires.toISOString(),
  });
}

/**
 * Administrative moderation: Hide, restore, or close request
 */
export async function adminModerateRequest(
  requestId: string,
  action: 'hide' | 'restore' | 'close',
  reason: string,
  adminUser: User
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return { success: false, error: 'الطلب غير موجود.' };
    }

    const now = new Date().toISOString();
    const updateData: Partial<LandPurchaseRequest> = {
      updatedAt: now,
      moderatedAt: now,
      moderatedBy: `${adminUser.name} (${adminUser.phone})`,
      moderationReason: reason,
    };

    if (action === 'hide') {
      updateData.moderationStatus = 'hidden';
    } else if (action === 'restore') {
      updateData.moderationStatus = 'visible';
      updateData.status = 'open';
    } else if (action === 'close') {
      updateData.status = 'closed';
    }

    await updateDoc(docRef, updateData);

    // Record immutable audit log
    const auditId = `audit-${Date.now()}`;
    await setDoc(doc(db, AUDIT_LOGS_COLLECTION, auditId), {
      id: auditId,
      action: `moderate_request_${action}`,
      target: `طلب شراء: ${requestId}`,
      admin: adminUser.name,
      adminPhone: adminUser.phone,
      reason,
      time: now,
      status: 'success',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to moderate request:', error);
    return { success: false, error: error.message || 'فشل تنفيذ الإجراء الإداري.' };
  }
}

// -------------------------------------------------------------
// OFFERS SUBCOLLECTION: landPurchaseRequests/{requestId}/offers
// -------------------------------------------------------------

/**
 * Submits a land offer on a purchase request
 */
export async function submitLandOffer(
  request: LandPurchaseRequest,
  seller: User,
  offerData: {
    offeredArea: number;
    areaUnit: LandPurchaseRequest['areaUnit'];
    totalPrice: number;
    pricePerFeddan?: number;
    governorate: string;
    city: string;
    message: string;
    existingListingId?: string;
    existingListingTitle?: string;
    waterSource?: string;
    legalStatus?: string;
    electricity?: boolean;
    images?: string[];
  }
): Promise<{ success: boolean; offerId?: string; error?: string }> {
  try {
    // 1. Validation checks
    if (!seller || !seller.id) {
      return { success: false, error: 'يجب تسجيل الدخول لتقديم عرض.' };
    }
    if (seller.id === request.buyerId) {
      return { success: false, error: 'لا يمكنك تقديم عرض على طلبك الشخصي.' };
    }
    if (request.status !== 'open' || request.moderationStatus !== 'visible') {
      return { success: false, error: 'عذراً، هذا الطلب مغلق أو منتهٍ ولا يستقبل عروضاً جديدة.' };
    }
    if (!offerData.offeredArea || offerData.offeredArea <= 0) {
      return { success: false, error: 'يرجى إدخال مساحة صالحة للأرض المعروضة.' };
    }
    if (!offerData.totalPrice || offerData.totalPrice <= 0) {
      return { success: false, error: 'يرجى إدخال السعر الإجمالي للأرض المعروضة.' };
    }
    if (!offerData.message || offerData.message.trim().length < 5) {
      return { success: false, error: 'يرجى كتابة رسالة توضيحية لصاحب الطلب (5 أحرف على الأقل).' };
    }

    const offerId = `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newOffer: LandOffer = {
      id: offerId,
      requestId: request.id,
      requestTitle: request.title,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerPhone: seller.phone,
      sellerRole: seller.role,
      existingListingId: offerData.existingListingId,
      existingListingTitle: offerData.existingListingTitle,
      offeredArea: offerData.offeredArea,
      areaUnit: offerData.areaUnit,
      totalPrice: offerData.totalPrice,
      pricePerFeddan:
        offerData.pricePerFeddan ||
        (offerData.areaUnit === 'فدان' && offerData.offeredArea > 0
          ? Math.round(offerData.totalPrice / offerData.offeredArea)
          : undefined),
      governorate: offerData.governorate,
      city: offerData.city,
      waterSource: offerData.waterSource,
      legalStatus: offerData.legalStatus,
      electricity: offerData.electricity,
      message: offerData.message,
      images: offerData.images || [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Save offer into subcollection
    const offerDocRef = doc(db, REQUESTS_COLLECTION, request.id, 'offers', offerId);
    await setDoc(offerDocRef, {
      ...newOffer,
      serverTimestamp: serverTimestamp(),
    });

    // Increment offerCount on parent request
    const parentRef = doc(db, REQUESTS_COLLECTION, request.id);
    await updateDoc(parentRef, {
      offerCount: increment(1),
      updatedAt: now,
    });

    // Notify buyer
    const notifId = `notif-${Date.now()}`;
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), {
      id: notifId,
      userId: request.buyerId,
      type: 'new_offer',
      title: 'عرض جديد على طلبك',
      message: `تلقيت عرض أرض جديد بمساحة ${offerData.offeredArea} ${offerData.areaUnit} من ${seller.name}.`,
      requestId: request.id,
      offerId,
      read: false,
      createdAt: now,
    });

    return { success: true, offerId };
  } catch (error: any) {
    console.error('Failed to submit land offer:', error);
    return { success: false, error: error.message || 'فشل إرسال العرض.' };
  }
}

/**
 * Fetches all offers submitted on a specific purchase request
 */
export async function getOffersForRequest(requestId: string): Promise<LandOffer[]> {
  try {
    const colRef = collection(db, REQUESTS_COLLECTION, requestId, 'offers');
    const snap = await getDocs(colRef);
    const list: LandOffer[] = [];
    snap.forEach((d) => list.push(d.data() as LandOffer));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error(`Failed to get offers for request ${requestId}:`, error);
    return [];
  }
}

/**
 * Updates offer status (accept, reject, or withdraw)
 */
export async function updateOfferStatus(
  requestId: string,
  offerId: string,
  newStatus: OfferStatus,
  actionUser: User,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const offerRef = doc(db, REQUESTS_COLLECTION, requestId, 'offers', offerId);
    const snap = await getDoc(offerRef);
    if (!snap.exists()) {
      return { success: false, error: 'العرض غير موجود.' };
    }

    const offer = snap.data() as LandOffer;
    const now = new Date().toISOString();

    const updatePayload: Partial<LandOffer> = {
      status: newStatus,
      updatedAt: now,
    };
    if (rejectionReason) {
      updatePayload.rejectionReason = rejectionReason;
    }

    await updateDoc(offerRef, updatePayload);

    // Send notification to offer seller
    const notifId = `notif-${Date.now()}`;
    let notifTitle = '';
    let notifMsg = '';

    if (newStatus === 'accepted') {
      notifTitle = 'تم قبول عرضك المبدئي!';
      notifMsg = `وافق صاحب الطلب على عرضك المقدم (${offer.requestTitle || 'طلب شراء أرض'}). يمكنك الآن التواصل مباشرة.`;
    } else if (newStatus === 'rejected') {
      notifTitle = 'تحديث بشأن عرضك';
      notifMsg = `تم الاعتذار عن قبول عرضك على الطلب (${offer.requestTitle || 'طلب شراء أرض'}).`;
    } else if (newStatus === 'withdrawn') {
      notifTitle = 'تم سحب العرض';
      notifMsg = `تم سحب العرض المقدم بنجاح.`;
    }

    if (notifTitle && offer.sellerId !== actionUser.id) {
      await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), {
        id: notifId,
        userId: offer.sellerId,
        type: newStatus === 'accepted' ? 'offer_accepted' : 'offer_rejected',
        title: notifTitle,
        message: notifMsg,
        requestId,
        offerId,
        read: false,
        createdAt: now,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update offer status:', error);
    return { success: false, error: error.message || 'فشل تحديث حالة العرض.' };
  }
}

/**
 * Fetches notifications for a specific user
 */
export async function getUserRequestNotifications(userId: string): Promise<RequestNotification[]> {
  try {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(colRef, where('userId', '==', userId), limit(30));
    const snap = await getDocs(q);
    const list: RequestNotification[] = [];
    snap.forEach((d) => list.push(d.data() as RequestNotification));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
}

/**
 * Marks notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const ref = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(ref, { read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Calculates real platform statistics for Purchase Requests
 */
export async function getPurchaseRequestStats(): Promise<{
  total: number;
  open: number;
  closed: number;
  expired: number;
  hidden: number;
  totalOffers: number;
}> {
  try {
    const snap = await getDocs(collection(db, REQUESTS_COLLECTION));
    let total = 0;
    let open = 0;
    let closed = 0;
    let expired = 0;
    let hidden = 0;
    let totalOffers = 0;

    const now = Date.now();

    snap.forEach((d) => {
      const data = d.data() as LandPurchaseRequest;
      total++;
      totalOffers += data.offerCount || 0;

      if (data.moderationStatus === 'hidden') {
        hidden++;
      } else if (data.status === 'closed') {
        closed++;
      } else if (data.status === 'expired' || new Date(data.expiresAt).getTime() < now) {
        expired++;
      } else {
        open++;
      }
    });

    return { total, open, closed, expired, hidden, totalOffers };
  } catch (error) {
    console.error('Failed to calculate request stats:', error);
    return { total: 0, open: 0, closed: 0, expired: 0, hidden: 0, totalOffers: 0 };
  }
}
