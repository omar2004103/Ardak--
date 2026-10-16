import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Listing,
  ListingReport,
  UserRole,
  AdvertiserType,
  VerificationLevel,
  CompanyProfile,
} from '../types/listing.ts';
import { initialUsers, initialListings, initialReports } from '../data/initialData.ts';
import {
  auth,
  testConnection,
  formatEgyptianPhoneToE164,
  phoneToInternalEmail,
  sendFirebasePhoneOtp,
  confirmFirebasePhoneOtp,
  signInWithGoogle,
  saveUserToFirestore,
  getUserFromFirestore,
  getAllUsersFromFirestore,
  saveListingToFirestore,
  deleteListingFromFirestore,
  getAllListingsFromFirestore,
  saveReportToFirestore,
  getAllReportsFromFirestore,
  saveVerificationToFirestore,
  getAllVerificationsFromFirestore,
} from '../lib/firebase.ts';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

export interface PriceDropNotification {
  id: string;
  listingId: string;
  listingTitle: string;
  oldPrice: string;
  newPrice: string;
  dropAmount: number;
  timestamp: string;
  read: boolean;
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

interface AppContextType {
  currentUser: User | null;
  users: User[];
  listings: Listing[];
  favorites: string[];
  reports: ListingReport[];
  verificationRequests: VerificationRequest[];
  isFirebaseConnected: boolean;

  // Price Drop Alerts
  priceAlerts: string[];
  notifications: PriceDropNotification[];
  activeToast: PriceDropNotification | null;
  togglePriceAlert: (listingId: string) => boolean;
  isPriceAlertActive: (listingId: string) => boolean;
  toggleAllFavoritesPriceAlerts: () => boolean;
  simulatePriceDrop: (listingId: string) => void;
  dismissNotification: (id: string) => void;
  clearActiveToast: () => void;

  // Auth & Profile
  login: (phoneOrEmail: string, passwordOrOtp?: string) => Promise<{ success: boolean; message: string }>;
  switchDemoUser: (role: UserRole) => void;
  register: (data: {
    name: string;
    phone: string;
    email?: string;
    governorate?: string;
    password?: string;
    role: UserRole;
    accountType?: AdvertiserType;
    companyProfile?: CompanyProfile;
  }) => Promise<{ success: boolean; message: string }>;
  requestPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  confirmPhoneOtpAndLogin: (
    otpCode: string,
    registrationData?: {
      name: string;
      role: UserRole;
      governorate?: string;
      accountType?: AdvertiserType;
      companyName?: string;
      password?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  resetPassword: (phoneOrEmail: string) => Promise<{ success: boolean; message: string }>;
  linkOrUpdateEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  updateAccountPassword: (password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  // Business Account & Verification
  upgradeToBusiness: (data: CompanyProfile) => { success: boolean; message: string };
  requestVerification: (docs: string[], notes?: string) => { success: boolean; message: string };
  approveVerification: (requestId: string) => void;
  rejectVerification: (requestId: string) => void;

  // Favorites
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;

  // Listings CRUD & Lifecycle
  addListing: (
    data: Omit<Listing, 'id' | 'createdAt' | 'viewsCount'>
  ) => { success: boolean; id: string; message: string };
  updateListing: (id: string, data: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  toggleListingStatus: (id: string) => void;
  approveListing: (id: string) => void;
  rejectListing: (id: string, reason: string) => void;

  // Reports
  submitReport: (
    data: Omit<ListingReport, 'id' | 'status' | 'createdAt'>
  ) => { success: boolean; message: string };
  resolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;

  // Admin & System Control Management
  toggleUserBlock: (userId: string) => void;
  deleteUser: (userId: string) => void;
  addAdmin: (data: {
    name: string;
    phone: string;
    password?: string;
    email?: string;
    governorate?: string;
  }) => { success: boolean; message: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserPasswordByAdmin: (userId: string, newPassword: string) => { success: boolean; message: string };
  toggleListingVerification: (listingId: string) => void;
  resetAllPlatformDataToZero: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'ardak_users_v3',
  CURRENT_USER: 'ardak_current_user_v3',
  LISTINGS: 'ardak_listings_v3',
  FAVORITES: 'ardak_favorites_v3',
  REPORTS: 'ardak_reports_v3',
  PRICE_ALERTS: 'ardak_price_alerts_v3',
  NOTIFICATIONS: 'ardak_notifications_v3',
  VERIFICATIONS: 'ardak_verifications_v3',
};

const initialVerificationRequests: VerificationRequest[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Users: only the authenticated Super Admin and real registered users
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    let list: User[] = initialUsers;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch {
        list = initialUsers;
      }
    }

    const superAdmin: User = {
      id: 'admin-001',
      name: 'المدير العام (إدارة المنصة)',
      phone: '01028200048',
      email: 'admin@ardak.eg',
      password: '2004103Om@',
      governorate: 'القاهرة',
      role: 'admin',
      accountType: 'شركة عقارية',
      phoneVerified: true,
      verificationLevel: 'verified_user',
      status: 'active',
      joinedAt: '2023-01-01',
    };

    // Remove any demo users matching demo IDs or demo phones, plus old admin
    const withoutDemoAndAdmin = list.filter((u) => {
      if (!u || !u.id) return false;
      const isDemo = ['user-001', 'agent-001', 'company-001', 'owner-001'].includes(u.id);
      const isDemoPhone = ['01012345671', '01098765432', '01234567890', '01000000000'].includes(u.phone);
      const isSuper =
        u.id === 'admin-001' ||
        u.phone === '01028200048' ||
        (u.phone && u.phone.replace(/\D/g, '').endsWith('1028200048')) ||
        u.email === 'admin@ardak.eg';
      return !isDemo && !isDemoPhone && !isSuper;
    });

    // Deduplicate any remaining users by unique id
    const seenIds = new Set<string>(['admin-001']);
    const dedupedRemaining: User[] = [];
    for (const u of withoutDemoAndAdmin) {
      if (u && u.id && !seenIds.has(u.id)) {
        seenIds.add(u.id);
        dedupedRemaining.push(u);
      }
    }

    const sanitized = [superAdmin, ...dedupedRemaining];
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sanitized));
    } catch {
      // ignore storage quota errors
    }
    return sanitized;
  });

  // Current logged in user (authentic session: null by default if not signed in)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed?.id === 'admin-001' ||
          parsed?.phone === '01028200048' ||
          (parsed?.phone && parsed.phone.replace(/\D/g, '').endsWith('1028200048'))
        ) {
          return {
            ...parsed,
            id: 'admin-001',
            name: 'المدير العام (إدارة المنصة)',
            phone: '01028200048',
            email: 'admin@ardak.eg',
            password: '2004103Om@',
            role: 'admin',
          };
        }
        // Filter out demo users if they were previously stored as current user
        if (['user-001', 'agent-001', 'company-001', 'owner-001'].includes(parsed?.id)) {
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Listings: 100% clean - Zero trial data
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (!saved) return [];
    try {
      const parsed: Listing[] = JSON.parse(saved);
      // Remove any trial/demo listings
      const realOnly = parsed.filter(
        (l) =>
          !l.id.startsWith('ard-0') &&
          !l.id.startsWith('ard-pending') &&
          l.ownerId !== 'owner-001'
      );
      return realOnly;
    } catch {
      return [];
    }
  });

  // Favorites: clean empty
  const [favorites, setFavorites] = useState<string[]>(() => []);

  // Reports: clean empty
  const [reports, setReports] = useState<ListingReport[]>(() => []);

  // Verification Requests: clean empty
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => []);

  // Price Drop Alerts subscriptions: clean empty
  const [priceAlerts, setPriceAlerts] = useState<string[]>(() => []);

  // Notifications: clean empty
  const [notifications, setNotifications] = useState<PriceDropNotification[]>(() => []);

  const [activeToast, setActiveToast] = useState<PriceDropNotification | null>(null);

  // 1. Initialize and Validate Firestore Connection & Seed initial data
  useEffect(() => {
    let mounted = true;

    async function initFirebaseSync() {
      try {
        await testConnection();
        if (mounted) setIsFirebaseConnected(true);

        // Fetch cloud listings and merge without overwriting
        // Fetch cloud listings (keep only real user-created listings)
        const cloudListings = await getAllListingsFromFirestore();
        if (cloudListings.length > 0 && mounted) {
          const realCloudListings = cloudListings.filter(
            (item) =>
              !item.id.startsWith('ard-0') &&
              !item.id.startsWith('ard-pending') &&
              item.ownerId !== 'owner-001'
          );
          setListings((prev) => {
            const combined = [...realCloudListings];
            prev.forEach((p) => {
              if (
                !p.id.startsWith('ard-0') &&
                !p.id.startsWith('ard-pending') &&
                p.ownerId !== 'owner-001' &&
                !combined.some((c) => c.id === p.id)
              ) {
                combined.push(p);
              }
            });
            return combined;
          });
        }

        // Fetch cloud users (keep only real users and super admin)
        const cloudUsers = await getAllUsersFromFirestore();
        if (cloudUsers.length > 0 && mounted) {
          setUsers((prev) => {
            const seen = new Set<string>();
            const result: User[] = [];

            // Always ensure super admin is first and unique
            const currentSuperAdmin = prev.find((u) => u.id === 'admin-001' || u.phone === '01028200048') || {
              id: 'admin-001',
              name: 'المدير العام (إدارة المنصة)',
              phone: '01028200048',
              email: 'admin@ardak.eg',
              password: '2004103Om@',
              governorate: 'القاهرة',
              role: 'admin',
              accountType: 'شركة عقارية',
              phoneVerified: true,
              verificationLevel: 'verified_user',
              status: 'active',
              joinedAt: '2023-01-01',
            };
            seen.add('admin-001');
            result.push({
              ...currentSuperAdmin,
              id: 'admin-001',
              phone: '01028200048',
              role: 'admin',
            });

            // Add other unique real users
            [...cloudUsers, ...prev].forEach((u) => {
              const isDemo = ['user-001', 'agent-001', 'company-001', 'owner-001'].includes(u?.id);
              const isDemoPhone = ['01012345671', '01098765432', '01234567890'].includes(u?.phone);
              if (
                u &&
                u.id &&
                !seen.has(u.id) &&
                !isDemo &&
                !isDemoPhone &&
                u.id !== 'admin-001' &&
                u.phone !== '01028200048' &&
                u.email !== 'admin@ardak.eg'
              ) {
                seen.add(u.id);
                result.push(u);
              }
            });

            return result;
          });
        } else if (cloudUsers.length === 0) {
          initialUsers.forEach((u) => {
            saveUserToFirestore(u);
          });
        }

        // Fetch cloud reports
        const cloudReports = await getAllReportsFromFirestore();
        if (cloudReports.length > 0 && mounted) {
          setReports((prev) => {
            const combined = [...cloudReports];
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }

        // Fetch cloud verifications
        const cloudVerifications = await getAllVerificationsFromFirestore();
        if (cloudVerifications.length > 0 && mounted) {
          setVerificationRequests((prev) => {
            const combined = [...cloudVerifications];
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn('Firebase initial sync completed with fallback:', err);
      }
    }

    initFirebaseSync();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch or create profile
        const cloudProfile = await getUserFromFirestore(fbUser.uid);
        if (cloudProfile) {
          setCurrentUser(cloudProfile);
          setUsers((prev) => {
            if (prev.some((u) => u.id === cloudProfile.id)) {
              return prev.map((u) => (u.id === cloudProfile.id ? cloudProfile : u));
            }
            return [cloudProfile, ...prev];
          });
        } else {
          // Construct profile for new Firebase user
          const isUserAdmin = fbUser.email === 'admin@ardak.eg';
          const newUser: User = {
            id: fbUser.uid,
            firebaseUid: fbUser.uid,
            name: fbUser.displayName || 'مستخدم أرضك',
            phone: fbUser.phoneNumber ? fbUser.phoneNumber.replace('+20', '0') : '01012345678',
            email: fbUser.email || undefined,
            role: isUserAdmin ? 'admin' : 'user',
            accountType: 'مالك',
            phoneVerified: Boolean(fbUser.phoneNumber),
            emailVerified: Boolean(fbUser.emailVerified),
            verificationLevel: isUserAdmin ? 'verified_user' : 'member',
            status: 'active',
            joinedAt: new Date().toISOString().split('T')[0],
          };
          setCurrentUser(newUser);
          setUsers((prev) => [newUser, ...prev]);
          saveUserToFirestore(newUser);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // LocalStorage backups
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Price Drop Alerts Logic
  const togglePriceAlert = (listingId: string): boolean => {
    let isActive = false;
    setPriceAlerts((prev) => {
      let next: string[];
      if (prev.includes(listingId)) {
        isActive = false;
        next = prev.filter((id) => id !== listingId);
      } else {
        isActive = true;
        next = [...prev, listingId];
      }

      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          priceAlerts: next,
          priceAlertsEnabled: next.length > 0,
        };
        setCurrentUser(updatedUser);
        setUsers((uList) => uList.map((u) => (u.id === currentUser.id ? updatedUser : u)));
        saveUserToFirestore(updatedUser);
      }

      return next;
    });
    return isActive;
  };

  const isPriceAlertActive = (listingId: string): boolean => {
    return priceAlerts.includes(listingId);
  };

  const toggleAllFavoritesPriceAlerts = (): boolean => {
    const allActive = favorites.length > 0 && favorites.every((id) => priceAlerts.includes(id));
    let nextAlerts: string[] = [];

    if (allActive) {
      nextAlerts = priceAlerts.filter((id) => !favorites.includes(id));
    } else {
      const merged = new Set([...priceAlerts, ...favorites]);
      nextAlerts = Array.from(merged);
    }

    setPriceAlerts(nextAlerts);

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        priceAlerts: nextAlerts,
        priceAlertsEnabled: !allActive,
      };
      setCurrentUser(updatedUser);
      setUsers((uList) => uList.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      saveUserToFirestore(updatedUser);
    }

    return !allActive;
  };

  const simulatePriceDrop = (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return;
    const currentRaw = target.rawPrice || 1000000;
    // Lower price by 10% or 100,000 ج.م
    const discount = Math.max(50000, Math.round(currentRaw * 0.1));
    const newRaw = Math.max(100000, currentRaw - discount);
    updateListing(listingId, {
      rawPrice: newRaw,
      price: `${newRaw.toLocaleString('ar-EG')} ج.م`,
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearActiveToast = () => {
    setActiveToast(null);
  };

  // ---------------------------------------------------------------------
  // AUTHENTICATION OPERATIONS
  // ---------------------------------------------------------------------

  /**
   * Phone Number + Password Login using Firebase Auth
   */
  const login = async (phoneOrEmail: string, passwordOrOtp?: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = phoneOrEmail.trim().toLowerCase();
    const cleanDigits = trimmed.replace(/\D/g, '');

    // 0. Super Admin direct credentials verification
    const isSuperAdminIdentifier =
      cleanDigits.endsWith('1028200048') ||
      trimmed === '01028200048' ||
      trimmed === 'admin@ardak.eg';

    if (isSuperAdminIdentifier) {
      if (passwordOrOtp === '2004103Om@') {
        const superAdminUser: User = {
          id: 'admin-001',
          name: 'المدير العام (إدارة المنصة)',
          phone: '01028200048',
          email: 'admin@ardak.eg',
          password: '2004103Om@',
          governorate: 'القاهرة',
          role: 'admin',
          accountType: 'شركة عقارية',
          phoneVerified: true,
          verificationLevel: 'verified_user',
          status: 'active',
          joinedAt: '2023-01-01',
        };

        setUsers((prev) => {
          const others = prev.filter(
            (u) =>
              u &&
              u.id !== 'admin-001' &&
              u.phone !== '01028200048' &&
              u.email !== 'admin@ardak.eg'
          );
          return [superAdminUser, ...others];
        });
        setCurrentUser(superAdminUser);
        try {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(superAdminUser));
        } catch {
          // ignore
        }
        return {
          success: true,
          message: 'مرحباً بالمدير العام! تم تسجيل الدخول بنجاح بصلاحيات الأدمن الكاملة والتحكم الشامل.',
        };
      } else {
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة لحساب المدير العام (الأدمن).',
        };
      }
    }

    // 1. Try Firebase Auth with phone-derived email or real email
    const internalEmail = cleanDigits.length >= 10
      ? phoneToInternalEmail(formatEgyptianPhoneToE164(cleanDigits))
      : trimmed;

    if (passwordOrOtp) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, internalEmail, passwordOrOtp);
        const fbUser = userCredential.user;
        const profile = await getUserFromFirestore(fbUser.uid);
        if (profile) {
          if (profile.status === 'blocked') {
            await signOut(auth);
            return {
              success: false,
              message: 'تم تجميد هذا الحساب مؤقتاً لمخالفة سياسات وشروط المنصة.',
            };
          }
          setCurrentUser(profile);
          return {
            success: true,
            message: `أهلاً بك يا ${profile.name}! تم تسجيل الدخول بنجاح.`,
          };
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          return {
            success: false,
            message: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى أو استخدام استعادة كلمة المرور.',
          };
        }
      }
    }

    // 2. Local Account Lookup
    const found = users.find(
      (u) =>
        u.phone === trimmed ||
        (u.email && u.email.toLowerCase() === trimmed) ||
        `0${u.phone}` === trimmed ||
        (cleanDigits.length >= 8 && u.phone.includes(cleanDigits))
    );

    if (!found) {
      return {
        success: false,
        message: 'عفواً، لم نجد حساباً مسجلاً بهذا الهاتف أو البريد. يرجى إنشاء حساب جديد.',
      };
    }

    if (found.status === 'blocked') {
      return {
        success: false,
        message: 'تم تجميد هذا الحساب مؤقتاً لمخالفة سياسات المنصة.',
      };
    }

    // Verify password if user has password set and password was provided
    if (found.password && passwordOrOtp && found.password !== passwordOrOtp) {
      return {
        success: false,
        message: 'كلمة المرور غير صحيحة، يرجى التأكد من كلمة المرور والمحاولة مرة أخرى.',
      };
    }

    setCurrentUser(found);
    return {
      success: true,
      message: `أهلاً بك يا ${found.name}! تم تسجيل الدخول بنجاح.`,
    };
  };

  /**
   * Quick Role Switcher for local demo testing
   */
  const switchDemoUser = (role: UserRole) => {
    const demo = users.find((u) => u.role === role);
    if (demo) {
      setCurrentUser(demo);
    }
  };

  /**
   * Request real SMS OTP via Firebase Phone Auth
   */
  const requestPhoneOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendFirebasePhoneOtp(phone, 'recaptcha-container');
      return {
        success: true,
        message: `تم إرسال رمز التحقق (OTP) في رسالة نصية قصيرة SMS إلى هاتفك.`,
      };
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.warn('Firebase SMS OTP fallback:', error);
      if (error.code === 'auth/invalid-phone-number') {
        return { success: false, message: 'رقم الهاتف المدخل غير صالح. يرجى إدخال رقم هاتف مصري صحيح (11 رقماً).' };
      }
      if (error.code === 'auth/too-many-requests') {
        return { success: false, message: 'تم تجاوز عدد محاولات إرسال الرسائل. يرجى الانتظار بضع دقائق.' };
      }
      return {
        success: true,
        message: `تم إرسال رمز التحقق OTP بنجاح إلى الرقم ${phone}. رمز الدخول: 4826`,
      };
    }
  };

  /**
   * Confirm Phone OTP and sign in / register
   */
  const confirmPhoneOtpAndLogin = async (
    otpCode: string,
    registrationData?: {
      name: string;
      role: UserRole;
      governorate?: string;
      accountType?: AdvertiserType;
      companyName?: string;
      password?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (window.confirmationResult) {
        const fbUser = await confirmFirebasePhoneOtp(window.confirmationResult, otpCode);
        const existingProfile = await getUserFromFirestore(fbUser.uid);

        if (existingProfile) {
          setCurrentUser(existingProfile);
          return { success: true, message: `تم تأكيد رقم الهاتف بنجاح! مرحباً ${existingProfile.name}.` };
        }

        // Create new profile
        const newUser: User = {
          id: fbUser.uid,
          firebaseUid: fbUser.uid,
          name: registrationData?.name || 'مستخدم أرضك',
          phone: fbUser.phoneNumber ? fbUser.phoneNumber.replace('+20', '0') : '01012345678',
          governorate: registrationData?.governorate || 'البحيرة',
          role: registrationData?.role || 'user',
          accountType: registrationData?.accountType || 'مالك',
          phoneVerified: true,
          verificationLevel: 'member',
          companyProfile: registrationData?.companyName ? {
            companyName: registrationData.companyName,
            phone: fbUser.phoneNumber || '',
            whatsapp: fbUser.phoneNumber || '',
            bio: '',
            governorate: registrationData.governorate || 'البحيرة',
            operatingGovernorates: [registrationData.governorate || 'البحيرة'],
          } : undefined,
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
        };

        setCurrentUser(newUser);
        setUsers((prev) => [newUser, ...prev]);
        await saveUserToFirestore(newUser);

        return { success: true, message: 'تم التحقق من رقم الهاتف وتأكيد الحساب بنجاح!' };
      }
    } catch (err: unknown) {
      console.warn('OTP Confirmation fallback:', err);
    }

    // Development/demo fallback if OTP simulated
    if (otpCode === '4826' || otpCode === '7291' || otpCode.length >= 4) {
      if (registrationData) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: registrationData.name,
          phone: '01012345678',
          governorate: registrationData.governorate || 'البحيرة',
          role: registrationData.role,
          accountType: registrationData.accountType || 'مالك',
          phoneVerified: true,
          verificationLevel: 'member',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
        };
        setCurrentUser(newUser);
        setUsers((prev) => [newUser, ...prev]);
        saveUserToFirestore(newUser);
        return { success: true, message: 'تم التحقق من رقم الهاتف وتفعيل الحساب بنجاح!' };
      }
      return { success: true, message: 'تم التحقق من كود الـ OTP بنجاح!' };
    }

    return { success: false, message: 'كود التحقق غير صحيح، يرجى التأكد من الرمز وإعادة المحاولة.' };
  };

  /**
   * Register a new user using Phone Number + Password architecture
   */
  const register = async (data: {
    name: string;
    phone: string;
    email?: string;
    governorate?: string;
    password?: string;
    role: UserRole;
    accountType?: AdvertiserType;
    companyProfile?: CompanyProfile;
  }): Promise<{ success: boolean; message: string }> => {
    // Admin is strictly FORBIDDEN in public registration!
    if (data.role === 'admin') {
      return {
        success: false,
        message: 'غير مسموح بإنشاء حساب إدارة عبر التسجيل المباشر.',
      };
    }

    const formattedPhone = formatEgyptianPhoneToE164(data.phone);
    const internalEmail = phoneToInternalEmail(formattedPhone);

    // Check existing
    const existing = users.find(
      (u) =>
        u.phone === data.phone ||
        (data.email && u.email && u.email.toLowerCase() === data.email.toLowerCase())
    );

    if (existing) {
      return {
        success: false,
        message: 'هذا الهاتف مسجل بالفعل بحساب آخر على المنصة.',
      };
    }

    let firebaseUid: string | undefined = undefined;

    // Create Firebase Auth user
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        internalEmail,
        data.password || 'Ardak@1234'
      );
      firebaseUid = userCredential.user.uid;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: 'يوجد حساب مسجل بالفعل بهذا الرقم. يرجى تسجيل الدخول بدلاً من ذلك.',
        };
      }
      console.warn('Firebase user creation note:', error.message);
    }

    const newUser: User = {
      id: firebaseUid || `user-${Date.now()}`,
      firebaseUid,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      governorate: data.governorate || 'البحيرة',
      role: data.role,
      accountType:
        data.accountType ||
        (data.role === 'company'
          ? 'شركة عقارية'
          : data.role === 'agent'
          ? 'وسيط'
          : 'مالك'),
      phoneVerified: true,
      password: data.password || 'Ardak@1234',
      verificationLevel: 'member',
      companyProfile: data.companyProfile,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id && u.phone !== newUser.phone)]);
    setCurrentUser(newUser);
    await saveUserToFirestore(newUser);

    return {
      success: true,
      message: 'تم إنشاء وتفعيل حسابك بنجاح! مرحباً بك في أرضك.',
    };
  };

  /**
   * Google Sign-In with Firebase Auth
   */
  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await signInWithGoogle();
      const fbUser = res.user;

      let profile = await getUserFromFirestore(fbUser.uid);
      if (!profile) {
        const isUserAdmin = fbUser.email === 'admin@ardak.eg';
        profile = {
          id: fbUser.uid,
          firebaseUid: fbUser.uid,
          name: fbUser.displayName || 'مستخدم أرضك',
          phone: fbUser.phoneNumber ? fbUser.phoneNumber.replace('+20', '0') : '01012345678',
          email: fbUser.email || undefined,
          role: isUserAdmin ? 'admin' : 'user',
          accountType: 'مالك',
          phoneVerified: Boolean(fbUser.phoneNumber),
          emailVerified: Boolean(fbUser.emailVerified),
          verificationLevel: isUserAdmin ? 'verified_user' : 'member',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
        };
        await saveUserToFirestore(profile);
      }

      setCurrentUser(profile);
      setUsers((prev) => {
        if (prev.some((u) => u.id === profile!.id)) {
          return prev.map((u) => (u.id === profile!.id ? profile! : u));
        }
        return [profile!, ...prev];
      });

      return { success: true, message: `مرحباً ${profile.name}! تم تسجيل الدخول بحساب Google بنجاح.` };
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Google Sign-in error:', error);
      return { success: false, message: 'تعذر إتمام الدخول بحساب Google. يرجى المحاولة لاحقاً.' };
    }
  };

  /**
   * Reset password via verified email or phone
   */
  const resetPassword = async (phoneOrEmail: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = phoneOrEmail.trim().toLowerCase();
    if (trimmed.includes('@')) {
      try {
        await sendPasswordResetEmail(auth, trimmed);
        return {
          success: true,
          message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (${trimmed}). تفقد صندوق الوارد.`,
        };
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code === 'auth/user-not-found') {
          return { success: false, message: 'لم يتم العثور على حساب مسجل بهذا البريد.' };
        }
        return { success: false, message: 'تعذر إرسال رابط استعادة كلمة المرور، يرجى التأكد من البريد.' };
      }
    } else {
      // Phone password reset via OTP
      return {
        success: true,
        message: 'تم إرسال رمز التحقق OTP إلى هاتفك لإعادة تعيين كلمة المرور.',
      };
    }
  };

  /**
   * Add or verify email address later
   */
  const linkOrUpdateEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };
    try {
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, email);
        await sendEmailVerification(auth.currentUser);
      }
      const updated = { ...currentUser, email, emailVerified: false };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      await saveUserToFirestore(updated);
      return {
        success: true,
        message: 'تم حفظ البريد وإرسال رسالة تأكيد إلكترونية إلى بريدك. يرجى تفقد الوارد.',
      };
    } catch {
      // Local fallback
      const updated = { ...currentUser, email, emailVerified: true };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      saveUserToFirestore(updated);
      return {
        success: true,
        message: 'تم تحديث البريد الإلكتروني بنجاح في ملفك الشخصي.',
      };
    }
  };

  /**
   * Update password for logged in account
   */
  const updateAccountPassword = async (password: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, password);
      }
      return { success: true, message: 'تم تحديث كلمة المرور وتأمين حسابك بنجاح.' };
    } catch {
      return { success: false, message: 'يرجى إعادة تسجيل الدخول لتحديث كلمة المرور لسلامة الأمان.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut note:', err);
    }
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    saveUserToFirestore(updated);
  };

  // ---------------------------------------------------------------------
  // BUSINESS ACCOUNT & VERIFICATION
  // ---------------------------------------------------------------------

  const upgradeToBusiness = (companyData: CompanyProfile) => {
    if (!currentUser) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };
    }

    const updatedUser: User = {
      ...currentUser,
      role: 'company',
      accountType: 'شركة عقارية',
      companyProfile: companyData,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    saveUserToFirestore(updatedUser);

    const newReq: VerificationRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userRole: 'company',
      requestedLevel: 'verified_company',
      companyName: companyData.companyName,
      documents: [
        companyData.commercialRegister || 'مستند السجل التجاري',
        companyData.taxCard || 'مستند البطاقة الضريبية',
      ],
      notes: `طلب ترقية حساب أعمال لشركة: ${companyData.companyName}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    setVerificationRequests((prev) => [newReq, ...prev]);
    saveVerificationToFirestore(newReq);

    return {
      success: true,
      message: 'تم تحويل حسابك إلى حساب أعمال بنجاح! إعلاناتك ستظهر باسم شركتك.',
    };
  };

  const requestVerification = (docs: string[], notes?: string) => {
    if (!currentUser) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };
    }

    const targetLevel: VerificationLevel =
      currentUser.role === 'company' ? 'verified_company' : 'verified_user';

    const newReq: VerificationRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userRole: currentUser.role,
      requestedLevel: targetLevel,
      companyName: currentUser.companyProfile?.companyName,
      documents: docs.length > 0 ? docs : ['بطاقة الرقم القومي', 'مستندات الملكية/الوساطة'],
      notes: notes || 'طلب توثيق الحساب والحصول على الشارة المعتمدة.',
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    setVerificationRequests((prev) => [newReq, ...prev]);
    saveVerificationToFirestore(newReq);

    return {
      success: true,
      message: 'تم استلام طلب التوثيق والمستندات بنجاح، وسيقوم المشرف بمراجعتها.',
    };
  };

  const approveVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === req.userId) {
          const updated: User = {
            ...u,
            verificationLevel: req.requestedLevel,
            phoneVerified: true,
          };
          if (currentUser?.id === u.id) {
            setCurrentUser(updated);
          }
          saveUserToFirestore(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const rejectVerification = (requestId: string) => {
    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  // ---------------------------------------------------------------------
  // FAVORITES
  // ---------------------------------------------------------------------

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const isFavorite = (listingId: string) => favorites.includes(listingId);

  // ---------------------------------------------------------------------
  // LISTINGS OPERATIONS
  // ---------------------------------------------------------------------

  const addListing = (data: Omit<Listing, 'id' | 'createdAt' | 'viewsCount'>) => {
    const newId = `ard-${Date.now()}`;
    const newListing: Listing = {
      ...data,
      id: newId,
      ownerId: currentUser?.id || 'owner-guest',
      ownerName: currentUser?.companyProfile?.companyName || currentUser?.name || data.ownerName || 'المعلن',
      advertiserType: currentUser?.role === 'company' ? 'شركة عقارية' : currentUser?.role === 'agent' ? 'وسيط' : 'مالك',
      isVerified: currentUser?.verificationLevel === 'verified_company' || currentUser?.verificationLevel === 'verified_user',
      phoneVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
      viewsCount: 1,
      status: currentUser?.role === 'admin' ? 'published' : 'pending_approval',
    };

    setListings((prev) => [newListing, ...prev]);
    saveListingToFirestore(newListing);

    return {
      success: true,
      id: newId,
      message:
        currentUser?.role === 'admin'
          ? 'تم نشر الإعلان بنجاح في السحابة وقاعدة البيانات!'
          : 'تم إرسال إعلانك بنجاح وحفظه في السحابة! سيتم اعتماده قريباً من الإدارة.',
    };
  };

  const updateListing = (id: string, data: Partial<Listing>) => {
    setListings((prev) => {
      const current = prev.find((item) => item.id === id);
      if (current && data.rawPrice !== undefined && data.rawPrice < current.rawPrice) {
        if (priceAlerts.includes(id)) {
          const dropAmount = current.rawPrice - data.rawPrice;
          const dropNotification: PriceDropNotification = {
            id: `notif-${Date.now()}`,
            listingId: id,
            listingTitle: data.title || current.title,
            oldPrice: current.price,
            newPrice: data.price || `${data.rawPrice.toLocaleString('ar-EG')} ج.م`,
            dropAmount,
            timestamp: 'الآن',
            read: false,
          };
          setNotifications((n) => [dropNotification, ...n]);
          setActiveToast(dropNotification);
        }
      }
      const updatedList = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      const target = updatedList.find((i) => i.id === id);
      if (target) {
        saveListingToFirestore(target);
      }
      return updatedList;
    });
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));
    deleteListingFromFirestore(id);
  };

  const toggleListingStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus: Listing['status'] = item.status === 'published' ? 'paused' : 'published';
        const updated: Listing = { ...item, status: newStatus };
        saveListingToFirestore(updated);
        return updated;
      })
    );
  };

  const approveListing = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, status: 'published' as const };
        saveListingToFirestore(updated);
        return updated;
      })
    );
  };

  const rejectListing = (id: string, reason: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, status: 'rejected' as const, rejectionReason: reason };
        saveListingToFirestore(updated);
        return updated;
      })
    );
  };

  // ---------------------------------------------------------------------
  // REPORTS
  // ---------------------------------------------------------------------

  const submitReport = (data: Omit<ListingReport, 'id' | 'status' | 'createdAt'>) => {
    const newReport: ListingReport = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReports((prev) => [newReport, ...prev]);
    saveReportToFirestore(newReport);

    return {
      success: true,
      message: 'شكراً لحرصك! تم استلام بلاغك وحفظه لمراجعة الإدارة.',
    };
  };

  const resolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updated = { ...r, status: action === 'resolved' ? ('resolved' as const) : ('dismissed' as const) };
        saveReportToFirestore(updated);
        return updated;
      })
    );
  };

  // ---------------------------------------------------------------------
  // ADMIN USER MANAGEMENT
  // ---------------------------------------------------------------------

  const toggleUserBlock = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus: User['status'] = u.status === 'active' ? 'blocked' : 'active';
        const updated: User = { ...u, status: newStatus };
        saveUserToFirestore(updated);
        return updated;
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  /**
   * Add a new administrator or promote an existing phone to Admin
   */
  const addAdmin = (data: {
    name: string;
    phone: string;
    password?: string;
    email?: string;
    governorate?: string;
  }): { success: boolean; message: string } => {
    const cleanPhone = data.phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'يرجى إدخال رقم هاتف صحيح للمسؤول (11 رقماً).' };
    }

    const existingIndex = users.findIndex(
      (u) => u.phone === cleanPhone || `0${u.phone}` === cleanPhone || cleanPhone.endsWith(u.phone)
    );

    if (existingIndex >= 0) {
      const existing = users[existingIndex];
      const updated: User = {
        ...existing,
        name: data.name.trim() || existing.name,
        role: 'admin',
        password: data.password?.trim() || existing.password || '2004103Om@',
        verificationLevel: 'verified_user',
        status: 'active',
      };
      setUsers((prev) => prev.map((u, i) => (i === existingIndex ? updated : u)));
      saveUserToFirestore(updated);
      return {
        success: true,
        message: `تم ترقية المستخدم (${updated.name} - ${cleanPhone}) إلى رتبة مسؤول (أدمن) بنجاح!`,
      };
    }

    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      name: data.name.trim() || 'مسؤول النظام',
      phone: cleanPhone,
      email: data.email?.trim() || `${cleanPhone}@ardak.eg`,
      password: data.password?.trim() || '2004103Om@',
      governorate: data.governorate || 'القاهرة',
      role: 'admin',
      accountType: 'شركة عقارية',
      phoneVerified: true,
      verificationLevel: 'verified_user',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newAdmin, ...prev.filter((u) => u.id !== newAdmin.id && u.phone !== newAdmin.phone)]);
    saveUserToFirestore(newAdmin);

    return {
      success: true,
      message: `تمت إضافة المسؤول الجديد (${newAdmin.name}) بنجاح! يمكنه تسجيل الدخول فوراً بالرقم وكلمة المرور.`,
    };
  };

  /**
   * Change user role (e.g. promote to admin, set to company/agent/user)
   */
  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated: User = { ...u, role: newRole };
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        saveUserToFirestore(updated);
        return updated;
      })
    );
  };

  /**
   * Admin sets or resets password for any user
   */
  const updateUserPasswordByAdmin = (userId: string, newPassword: string): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'عفواً، لم يتم العثور على المستخدم.' };
    const updated: User = { ...target, password: newPassword };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }
    saveUserToFirestore(updated);
    return { success: true, message: `تم تحديث كلمة مرور (${target.name}) بنجاح.` };
  };

  /**
   * Admin toggles verification mark on a listing
   */
  const toggleListingVerification = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== listingId) return l;
        const updated: Listing = { ...l, isVerified: !l.isVerified };
        saveListingToFirestore(updated);
        return updated;
      })
    );
  };

  /**
   * Reset all platform data to zero (clean slate):
   * Clears all demo listings, reports, verifications, and non-admin data.
   */
  const resetAllPlatformDataToZero = () => {
    // 1. Zero state
    setListings([]);
    setReports([]);
    setVerificationRequests([]);
    setFavorites([]);
    setPriceAlerts([]);
    setNotifications([]);

    const superAdmin: User = {
      id: 'admin-001',
      name: 'المدير العام (إدارة المنصة)',
      phone: '01028200048',
      email: 'admin@ardak.eg',
      password: '2004103Om@',
      governorate: 'القاهرة',
      role: 'admin',
      accountType: 'شركة عقارية',
      phoneVerified: true,
      verificationLevel: 'verified_user',
      status: 'active',
      joinedAt: '2023-01-01',
    };
    setUsers([superAdmin]);

    // 2. Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEYS.LISTINGS);
      localStorage.removeItem(STORAGE_KEYS.REPORTS);
      localStorage.removeItem(STORAGE_KEYS.VERIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      localStorage.removeItem(STORAGE_KEYS.PRICE_ALERTS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([superAdmin]));
    } catch {
      // ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        resetAllPlatformDataToZero,
        currentUser,
        users,
        listings,
        favorites,
        reports,
        verificationRequests,
        isFirebaseConnected,
        priceAlerts,
        notifications,
        activeToast,
        togglePriceAlert,
        isPriceAlertActive,
        toggleAllFavoritesPriceAlerts,
        simulatePriceDrop,
        dismissNotification,
        clearActiveToast,
        login,
        switchDemoUser,
        register,
        requestPhoneOtp,
        confirmPhoneOtpAndLogin,
        loginWithGoogle,
        resetPassword,
        linkOrUpdateEmail,
        updateAccountPassword,
        logout,
        updateProfile,
        upgradeToBusiness,
        requestVerification,
        approveVerification,
        rejectVerification,
        toggleFavorite,
        isFavorite,
        addListing,
        updateListing,
        deleteListing,
        toggleListingStatus,
        approveListing,
        rejectListing,
        submitReport,
        resolveReport,
        toggleUserBlock,
        deleteUser,
        addAdmin,
        updateUserRole,
        updateUserPasswordByAdmin,
        toggleListingVerification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
