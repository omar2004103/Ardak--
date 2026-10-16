import { SoldTransaction } from '../types/listing.ts';

// سجل الصفقات الزراعية الموثقة الفعلي - يتم الإدراج مع اعتماد صفقات جديدة
export const initialSoldTransactions: SoldTransaction[] = [];

// Alias for backwards compatibility
export const initialSoldDeals = initialSoldTransactions;
