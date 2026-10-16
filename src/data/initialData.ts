import { User, ListingReport, Listing } from '../types/listing.ts';

/**
 * Clean Platform Initial State (Zero Trial Data)
 * Only the authentic Super Admin account is retained.
 */
export const initialUsers: User[] = [
  {
    id: 'admin-001',
    name: 'المدير العام (إدارة المنصة)',
    phone: '01028200048',
    email: 'admin@ardak.eg',
    password: '2004103Om@',
    governorate: 'القاهرة',
    role: 'admin', // أدمن: إدارة ومراجعة المنصة (صلاحيات كاملة)
    accountType: 'شركة عقارية',
    phoneVerified: true,
    verificationLevel: 'verified_user',
    status: 'active',
    joinedAt: '2023-01-01',
  },
];

// Clean empty listings - Ready for real production ads
export const initialListings: Listing[] = [];

// Clean empty reports
export const initialReports: ListingReport[] = [];
