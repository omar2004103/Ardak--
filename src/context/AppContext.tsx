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

  // Price Drop Alerts
  priceAlerts: string[];
  notifications: PriceDropNotification[];
  activeToast: PriceDropNotification | null;
  togglePriceAlert: (listingId: string) => boolean;
  isPriceAlertActive: (listingId: string) => boolean;
  dismissNotification: (id: string) => void;
  clearActiveToast: () => void;

  // Auth & Profile
  login: (phoneOrEmail: string, passwordOrOtp?: string) => { success: boolean; message: string };
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
  }) => {
    success: boolean;
    message: string;
  };
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

  // Admin User Management
  toggleUserBlock: (userId: string) => void;
  deleteUser: (userId: string) => void;
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

const initialVerificationRequests: VerificationRequest[] = [
  {
    id: 'req-01',
    userId: 'agent-001',
    userName: 'سامي التميمي',
    userPhone: '01098765432',
    userRole: 'agent',
    requestedLevel: 'verified_user',
    documents: ['صورة بطاقة الرقم القومي سارية', 'عقد إيجار مكتب التسويق الزراعي بحوش عيسى'],
    notes: 'أعمل وسيطاً زراعياً معتمداً بالبحيرة منذ 8 سنوات ولدي تفويضات رسمية من الملاك.',
    status: 'pending',
    submittedAt: '2024-09-25',
  },
  {
    id: 'req-02',
    userId: 'company-001',
    userName: 'شركة النيل للاستثمار الزراعي',
    userPhone: '01234567890',
    userRole: 'company',
    requestedLevel: 'verified_company',
    companyName: 'شركة النيل للاستثمار الزراعي واستصلاح الأراضي',
    documents: [
      'السجل التجاري رقم 48921 إسكندرية',
      'البطاقة الضريبية المميكنة',
      'عضوية الغرفة التجارية الزراعية',
    ],
    notes: 'طلب ترقية وتوثيق ملف الشركة الرسمي للعلامة الزرقاء.',
    status: 'approved',
    submittedAt: '2024-09-18',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Current logged in user (defaults to Demo User: أحمد محمود)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers[0];
      }
    }
    return initialUsers[0];
  });

  // Listings
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return saved ? JSON.parse(saved) : initialListings;
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return saved ? JSON.parse(saved) : ['ard-001', 'ard-002'];
  });

  // Reports
  const [reports, setReports] = useState<ListingReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : initialReports;
  });

  // Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VERIFICATIONS);
    return saved ? JSON.parse(saved) : initialVerificationRequests;
  });

  // Price Drop Alerts subscriptions
  const [priceAlerts, setPriceAlerts] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE_ALERTS);
    return saved ? JSON.parse(saved) : ['ard-001'];
  });

  // Notifications
  const [notifications, setNotifications] = useState<PriceDropNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'notif-welcome',
            listingId: 'ard-001',
            listingTitle: 'أرض زراعية 10 فدان في وادي النطرون',
            oldPrice: '4,800,000 ج.م',
            newPrice: '4,500,000 ج.م',
            dropAmount: 300000,
            timestamp: 'منذ ساعتين',
            read: false,
          },
        ];
  });

  const [activeToast, setActiveToast] = useState<PriceDropNotification | null>(null);

  // Sync to localStorage
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
      if (prev.includes(listingId)) {
        isActive = false;
        return prev.filter((id) => id !== listingId);
      } else {
        isActive = true;
        return [...prev, listingId];
      }
    });
    return isActive;
  };

  const isPriceAlertActive = (listingId: string): boolean => {
    return priceAlerts.includes(listingId);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearActiveToast = () => {
    setActiveToast(null);
  };

  // Auth Operations
  const login = (phoneOrEmail: string, _passwordOrOtp?: string) => {
    const trimmed = phoneOrEmail.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.phone === trimmed ||
        (u.email && u.email.toLowerCase() === trimmed) ||
        `0${u.phone}` === trimmed ||
        trimmed.endsWith(u.phone)
    );

    if (!found) {
      return {
        success: false,
        message: 'عفواً، لم نجد حساباً مسجلاً بهذا الهاتف أو البريد.',
      };
    }

    if (found.status === 'blocked') {
      return {
        success: false,
        message: 'تم تجميد هذا الحساب مؤقتاً لمخالفة سياسات المنصة.',
      };
    }

    setCurrentUser(found);
    return {
      success: true,
      message: `أهلاً بك يا ${found.name}! تم تسجيل الدخول بنجاح.`,
    };
  };

  const switchDemoUser = (role: UserRole) => {
    const demo = users.find((u) => u.role === role);
    if (demo) {
      setCurrentUser(demo);
    }
  };

  const register = (data: {
    name: string;
    phone: string;
    email?: string;
    governorate?: string;
    password?: string;
    role: UserRole;
    accountType?: AdvertiserType;
    companyProfile?: CompanyProfile;
  }) => {
    // STRICT RULE: Admin is forbidden in registration!
    if (data.role === 'admin') {
      return {
        success: false,
        message: 'غير مسموح بإنشاء حساب إدارة عبر التسجيل المباشر.',
      };
    }

    const existing = users.find(
      (u) => u.phone === data.phone || (data.email && u.email && u.email.toLowerCase() === data.email.toLowerCase())
    );

    if (existing) {
      return {
        success: false,
        message: 'هذا الهاتف مسجل بالفعل بحساب آخر على المنصة.',
      };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.phone}@ardak.eg`,
      governorate: data.governorate || 'البحيرة',
      role: data.role,
      accountType: data.accountType || (data.role === 'company' ? 'شركة عقارية' : data.role === 'agent' ? 'وسيط' : 'مالك'),
      phoneVerified: true,
      verificationLevel: 'member', // Starts as regular member, never auto verified
      companyProfile: data.companyProfile,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    return {
      success: true,
      message: 'تم التحقق من رقم الهاتف وتأكيد الحساب بنجاح! مرحباً بك في أرضك.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Upgrade to Business Account
  const upgradeToBusiness = (companyData: CompanyProfile) => {
    if (!currentUser) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };
    }

    const updatedUser: User = {
      ...currentUser,
      role: 'company',
      accountType: 'شركة عقارية',
      companyProfile: companyData,
      // Rule: "لكن الحساب لا يتحول تلقائياً لموثق" -> stays as whatever it was, pending docs review
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Create a verification request automatically for admin review
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

    return {
      success: true,
      message: 'تم تحويل حسابك إلى حساب أعمال بنجاح! إعلاناتك ستظهر باسم شركتك.',
    };
  };

  // Request Verification
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

    // Update user's verification level
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

  // Favorites
  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const isFavorite = (listingId: string) => favorites.includes(listingId);

  // Listings Operations
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

    return {
      success: true,
      id: newId,
      message:
        currentUser?.role === 'admin'
          ? 'تم نشر الإعلان بنجاح!'
          : 'تم إرسال إعلانك بنجاح! سيتم مراجعته واعتماده من قبل الإدارة في أقرب وقت.',
    };
  };

  const updateListing = (id: string, data: Partial<Listing>) => {
    setListings((prev) => {
      const current = prev.find((item) => item.id === id);
      if (current && data.rawPrice !== undefined && data.rawPrice < current.rawPrice) {
        // Price dropped!
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
      return prev.map((item) => (item.id === id ? { ...item, ...data } : item));
    });
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));
  };

  const toggleListingStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus = item.status === 'published' ? 'paused' : 'published';
        return { ...item, status: newStatus };
      })
    );
  };

  const approveListing = (id: string) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'published' } : item))
    );
  };

  const rejectListing = (id: string, reason: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'rejected', rejectionReason: reason }
          : item
      )
    );
  };

  // Reports
  const submitReport = (data: Omit<ListingReport, 'id' | 'status' | 'createdAt'>) => {
    const newReport: ListingReport = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReports((prev) => [newReport, ...prev]);

    return {
      success: true,
      message: 'شكراً لحرصك! تم استلام بلاغك وسيقوم فريق المراجعة بفحص الإعلان.',
    };
  };

  const resolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: action === 'resolved' ? 'resolved' : 'dismissed' }
          : r
      )
    );
  };

  const toggleUserBlock = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'active' ? 'blocked' : 'active';
        return { ...u, status: newStatus };
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        listings,
        favorites,
        reports,
        verificationRequests,
        priceAlerts,
        notifications,
        activeToast,
        togglePriceAlert,
        isPriceAlertActive,
        dismissNotification,
        clearActiveToast,
        login,
        switchDemoUser,
        register,
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
