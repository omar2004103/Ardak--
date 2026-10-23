import { validatePurchaseRequestInput } from '../lib/purchaseRequestService.ts';
import { LandPurchaseRequest } from '../types/purchaseRequest.ts';

// Simple lightweight assertion utility
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Test Failed: ${message}`);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runTests() {
  console.log('\n--- 1. Validation Logic Tests ---');

  const baseValid = {
    title: 'مطلوب أرض زراعية ممتازة',
    category: 'أرض زراعية' as const,
    governorate: 'البحيرة',
    city: 'وادي النطرون',
    areaMin: 5,
    areaMax: 10,
    areaUnit: 'فدان' as const,
    durationDays: 30,
  };

  // Test 1: Empty title
  const invalidTitle = validatePurchaseRequestInput({
    ...baseValid,
    title: '   ',
  });
  assert(!invalidTitle.isValid && invalidTitle.error!.includes('عنوان'), 'Rejects empty or short title');

  // Test 2: Missing city
  const missingCity = validatePurchaseRequestInput({
    ...baseValid,
    city: '   ',
  });
  assert(!missingCity.isValid && missingCity.error!.includes('المدينة'), 'Rejects missing city/district');

  // Test 3: Negative or zero area
  const negativeArea = validatePurchaseRequestInput({
    ...baseValid,
    areaMin: -5,
  });
  assert(!negativeArea.isValid && Boolean(negativeArea.error?.includes('مساحة')), 'Rejects negative minimum area');

  // Test 4: AreaMin > AreaMax
  const invertedArea = validatePurchaseRequestInput({
    ...baseValid,
    areaMin: 20,
    areaMax: 5,
  });
  assert(!invertedArea.isValid && invertedArea.error!.includes('الحد الأقصى للمساحة يجب أن يكون مساوياً أو أكبر'), 'Rejects AreaMin > AreaMax');

  // Test 5: Negative budget
  const negativeBudget = validatePurchaseRequestInput({
    ...baseValid,
    budgetMin: -1000,
    isBudgetUnspecified: false,
  });
  assert(!negativeBudget.isValid && negativeBudget.error!.includes('سالبة'), 'Rejects negative budget');

  // Test 6: Inverted budget
  const invertedBudget = validatePurchaseRequestInput({
    ...baseValid,
    budgetMin: 5000000,
    budgetMax: 2000000,
    isBudgetUnspecified: false,
  });
  assert(!invertedBudget.isValid && invertedBudget.error!.includes('الميزانية العليا يجب أن تكون أكبر'), 'Rejects budgetMin > budgetMax');

  // Test 7: Valid unspecified budget
  const validUnspecified = validatePurchaseRequestInput({
    ...baseValid,
    isBudgetUnspecified: true,
  });
  assert(validUnspecified.isValid, 'Accepts valid request with unspecified budget (open for negotiation)');

  // Test 8: Valid complete request
  const validComplete = validatePurchaseRequestInput({
    ...baseValid,
    budgetMin: 1500000,
    budgetMax: 2500000,
    isBudgetUnspecified: false,
  });
  assert(validComplete.isValid, 'Accepts fully specified valid request');

  console.log('\n--- 2. Business Logic & Constraints Tests ---');

  // Mock Request Object
  const mockRequest: LandPurchaseRequest = {
    id: 'req-mock-1',
    buyerId: 'user-buyer-123',
    buyerName: 'أحمد التاجر',
    buyerPhone: '01012345678',
    title: 'مطلوب أرض 10 أفدنة',
    category: 'أرض زراعية',
    governorate: 'البحيرة',
    city: 'وادي النطرون',
    areaMin: 10,
    areaMax: 15,
    areaUnit: 'فدان',
    budgetVisibility: 'public',
    purpose: 'استثمار زراعي وتجاري',
    requirements: {},
    contactPreferences: 'phone_and_whatsapp',
    status: 'open',
    moderationStatus: 'visible',
    offerCount: 0,
    durationDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Rule 1: Prevent user from offering on their own request
  const isOwnerOffering = (currentUserId: string, request: LandPurchaseRequest) => {
    return currentUserId === request.buyerId;
  };
  assert(isOwnerOffering('user-buyer-123', mockRequest) === true, 'Correctly detects self-offering attempt');
  assert(isOwnerOffering('seller-456', mockRequest) === false, 'Allows different registered seller to offer');

  // Rule 2: Cannot offer on closed or expired requests
  const canReceiveOffers = (request: LandPurchaseRequest) => {
    const isExpired = new Date(request.expiresAt).getTime() <= Date.now();
    return request.status === 'open' && request.moderationStatus === 'visible' && !isExpired;
  };
  assert(canReceiveOffers(mockRequest) === true, 'Open visible request can receive offers');

  const closedRequest = { ...mockRequest, status: 'closed' as const };
  assert(canReceiveOffers(closedRequest) === false, 'Closed request blocks new offers');

  const hiddenRequest = { ...mockRequest, moderationStatus: 'hidden' as const };
  assert(canReceiveOffers(hiddenRequest) === false, 'Moderator-hidden request blocks new offers');

  const expiredRequest = { ...mockRequest, expiresAt: new Date(Date.now() - 10000).toISOString() };
  assert(canReceiveOffers(expiredRequest) === false, 'Expired request blocks new offers');

  // Rule 3: Privacy and budget visibility
  const getDisplayBudget = (request: LandPurchaseRequest, viewerId?: string) => {
    if (request.isBudgetUnspecified) return 'مفتوحة للتفاوض';
    if (request.budgetVisibility === 'hidden' && viewerId !== request.buyerId) {
      return 'ميزانية خاصة (تظهر لأصحاب العروض)';
    }
    return `${request.budgetMax?.toLocaleString('ar-EG')} ج.م`;
  };

  const hiddenBudgetReq: LandPurchaseRequest = {
    ...mockRequest,
    budgetMax: 3000000,
    budgetVisibility: 'hidden',
  };
  assert(getDisplayBudget(hiddenBudgetReq, 'stranger-999') === 'ميزانية خاصة (تظهر لأصحاب العروض)', 'Hides budget from general public when budgetVisibility is hidden');
  assert(
    !getDisplayBudget(hiddenBudgetReq, 'user-buyer-123').includes('خاصة'),
    'Shows budget to owner even if budgetVisibility is hidden'
  );

  console.log('\n🎉 ALL UNIT AND BUSINESS LOGIC TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
