import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Listing, User, VerificationRequest, SoldTransaction } from '../../types/listing.ts';
import { initialSoldTransactions } from '../../data/soldDeals.ts';
import { egyptianGovernorates } from '../../data/listings.ts';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Flag,
  Users,
  Layers,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  ChevronLeft,
  Search,
  Check,
  Ban,
  UserCheck,
  Building,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  FileCheck,
  History,
  Activity,
  BarChart3,
  Sliders,
  Sparkles,
  UserPlus,
  Key,
  Crown,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { ArdakLogoIcon } from '../common/ArdakLogo.tsx';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onViewDetails: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

export type AdminTab =
  | 'listings'
  | 'pending'
  | 'sold-deals'
  | 'purchase-requests'
  | 'users'
  | 'companies'
  | 'reports'
  | 'verifications'
  | 'locations'
  | 'market-stats'
  | 'price-benchmarks'
  | 'audit-logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  onViewDetails,
  onEditListing,
}) => {
  const {
    listings,
    reports,
    users,
    verificationRequests,
    isFirebaseConnected,
    currentUser,
    approveListing,
    rejectListing,
    deleteListing,
    toggleListingStatus,
    resolveReport,
    approveVerification,
    rejectVerification,
    toggleUserBlock,
    deleteUser,
    addAdmin,
    updateUserRole,
    updateUserPasswordByAdmin,
    toggleListingVerification,
    resetAllPlatformDataToZero,
    purchaseRequests,
    adminModerateRequestAction,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Purchase Requests Moderation State
  const [requestModerationFilter, setRequestModerationFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'open' | 'closed' | 'expired'>('all');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [moderatingRequestId, setModeratingRequestId] = useState<string | null>(null);
  const [moderatingAction, setModeratingAction] = useState<'hide' | 'restore' | 'close'>('hide');
  const [moderatingReason, setModeratingReason] = useState('');
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  // Sold Transactions confidential view toggle
  const [showConfidentialDetails, setShowConfidentialDetails] = useState(true);

  // User Management State
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user' | 'agent' | 'company'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('2004103Om@');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminGov, setNewAdminGov] = useState('القاهرة');
  const [adminActionNotice, setAdminActionNotice] = useState<string | null>(null);

  // Password Reset Modal State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');

  // Calculations
  const pendingListings = listings.filter((item) => item.status === 'pending_approval');
  const publishedListings = listings.filter((item) => item.status === 'published');
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter((v) => v.status === 'pending');
  const companyUsers = users.filter((u) => u.role === 'company' || u.companyProfile);
  const adminUsers = users.filter((u) => u.role === 'admin');
  const agentUsers = users.filter((u) => u.role === 'agent');
  const regularUsers = users.filter((u) => u.role === 'user' || (!u.role && !u.companyProfile));

  const seenUserIds = new Set<string>();
  const filteredUsers = users.filter((u) => {
    if (!u || !u.id) return false;
    if (seenUserIds.has(u.id)) return false;
    seenUserIds.add(u.id);

    if (userRoleFilter === 'admin') {
      if (u.role !== 'admin') return false;
    } else if (userRoleFilter === 'company') {
      if (u.role !== 'company' && !u.companyProfile) return false;
    } else if (userRoleFilter === 'agent') {
      if (u.role !== 'agent') return false;
    } else if (userRoleFilter === 'user') {
      if (u.role === 'admin' || u.role === 'company' || u.role === 'agent') return false;
    }

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.trim().toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchPhone = u.phone.includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q) || false;
      return matchName || matchPhone || matchEmail;
    }
    return true;
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPhone || newAdminPhone.length < 10) {
      setAdminActionNotice('يرجى إدخال رقم هاتف صحيح للمسؤول (11 رقماً).');
      return;
    }
    const res = addAdmin({
      name: newAdminName.trim() || 'مسؤول المنصة',
      phone: newAdminPhone.trim(),
      password: newAdminPassword.trim() || '2004103Om@',
      email: newAdminEmail.trim() || undefined,
      governorate: newAdminGov,
    });
    setAdminActionNotice(res.message);
    if (res.success) {
      setIsAddAdminOpen(false);
      setNewAdminName('');
      setNewAdminPhone('');
      setNewAdminPassword('2004103Om@');
      setNewAdminEmail('');
      setTimeout(() => setAdminActionNotice(null), 4500);
    }
  };

  const handlePromoteToAdmin = (targetUser: User) => {
    if (window.confirm(`هل أنت متأكد من ترقية "${targetUser.name}" (${targetUser.phone}) إلى رتبة مسؤول (أدمن)؟ سيكون له كامل الصلاحيات لإدارة الموقع.`)) {
      updateUserRole(targetUser.id, 'admin');
      setAdminActionNotice(`تمت ترقية "${targetUser.name}" إلى مسؤول (أدمن) بنجاح.`);
      setTimeout(() => setAdminActionNotice(null), 4500);
    }
  };

  const handleDemoteAdmin = (targetUser: User) => {
    if (targetUser.phone === '01028200048') {
      alert('لا يمكن إلغاء صلاحية المدير العام الرئيسي للحساب 01028200048.');
      return;
    }
    if (window.confirm(`هل أنت متأكد من سحب صلاحية الأدمن من "${targetUser.name}" وتحويله لمستخدم عادي؟`)) {
      updateUserRole(targetUser.id, 'user');
      setAdminActionNotice(`تم سحب صلاحيات الأدمن من "${targetUser.name}".`);
      setTimeout(() => setAdminActionNotice(null), 4500);
    }
  };

  const handleSavePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (!customPasswordInput || customPasswordInput.length < 6) {
      alert('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }
    const res = updateUserPasswordByAdmin(resetTargetUser.id, customPasswordInput);
    setAdminActionNotice(res.message);
    setResetTargetUser(null);
    setCustomPasswordInput('');
    setTimeout(() => setAdminActionNotice(null), 4500);
  };

  const handleConfirmReject = (id: string) => {
    rejectListing(id, rejectReason.trim() || 'بيانات أو أوراق غير مطابقة لشروط النشر');
    setRejectingListingId(null);
    setRejectReason('');
  };

  // Mock audit logs
  const auditLogs = [
    {
      id: 'log-1',
      action: 'اعتماد ونشر إعلان',
      target: 'أرض زراعية 10 فدان بوادي النطرون',
      admin: 'المدير العام (01028200048)',
      time: 'منذ 15 دقيقة',
      status: 'نجاح',
    },
    {
      id: 'log-2',
      action: 'توثيق شركة أعمال (🔵 شركة موثقة)',
      target: 'شركة النيل للاستثمار الزراعي',
      admin: 'المدير العام (01028200048)',
      time: 'منذ ساعتين',
      status: 'نجاح',
    },
    {
      id: 'log-3',
      action: 'تسجيل صفقة بيع فعلية مع التحقق من المشهر',
      target: 'صفقة 2 فدان بالشعراوية بحوش عيسى',
      admin: 'النظام التحليلي للأراضي',
      time: 'منذ يوم',
      status: 'موثق',
    },
    {
      id: 'log-4',
      action: 'تجميد حساب لمخالفة سياسة الاتصال',
      target: 'مستخدم هاتف 01155443322',
      admin: 'المدير العام (01028200048)',
      time: 'منذ يومين',
      status: 'محظور',
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-[#f7f9f8] min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل">
          <ol className="flex items-center gap-2 text-xs text-[#527963]">
            <li>
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-[#166534] transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
            </li>
            <li>
              <ChevronLeft className="w-3.5 h-3.5 text-[#9ca3af]" />
            </li>
            <li className="text-[#14281d] font-bold">لوحة تحكم الإدارة (Admin Dashboard)</li>
          </ol>
        </nav>

        {/* Admin Header */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-[#f7f9f8] p-1.5 flex items-center justify-center border border-[#e2eae5] shadow-xs shrink-0 relative">
              <ArdakLogoIcon className="w-10 h-10" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] shadow-xs">
                <Shield className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#14281d]">
                  لوحة إدارة منصة أرضك (Admin Control)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                  صلاحية إدارة عليا
                </span>
              </div>
              <p className="text-xs text-[#527963] mt-0.5">
                مراجعة الإعلانات والصفقات والشركات والتوثيق والبيانات التحليلية للأسعار.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs text-[#527963]">
              المسؤول الحالي:{' '}
              <strong className="text-[#14281d]">
                {currentUser?.name || 'المدير العام'} ({currentUser?.phone || '01028200048'})
              </strong>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                isFirebaseConnected
                  ? 'bg-[#f0fdf4] text-[#166534] border-[#86efac]'
                  : 'bg-[#fefce8] text-[#854d0e] border-[#fde047]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-[#16a34a]' : 'bg-[#eab308] animate-ping'}`} />
              <span>{isFirebaseConnected ? 'السحابة متصلة ونشطة ✓' : 'جاري المزامنة السحابية'}</span>
            </span>

            {/* Zero Platform Data Action */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في تصفير الموقع وحذف كافة البيانات التجريبية؟')) {
                  resetAllPlatformDataToZero();
                  setAdminActionNotice('تم تصفير الموقع بالكامل وحذف كافة البيانات التجريبية! المنصة الآن نظيفة وجاهزة تماماً.');
                  setTimeout(() => setAdminActionNotice(null), 5000);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-[#dc2626] border border-red-200 text-xs font-bold transition-colors cursor-pointer"
              title="تصفير وحذف كافة البيانات التجريبية"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تصفير البيانات التجريبية</span>
            </button>
          </div>
        </div>

        {/* 11 TABS NAVIGATION BAR (Tree structure requested) */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] p-2 shadow-2xs overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>الإعلانات المعلقة</span>
              {pendingListings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#dc2626] text-white font-sans">
                  {pendingListings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'listings'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الإعلانات ({listings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sold-deals')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sold-deals'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>الصفقات المباعة (البيانات الداخلية)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('purchase-requests')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'purchase-requests'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>طلبات الشراء ({purchaseRequests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>المستخدمون والمسؤولون ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>الشركات ({companyUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verifications')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>التوثيق</span>
              {pendingVerifications.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#2563eb] text-white font-sans">
                  {pendingVerifications.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>البلاغات ({pendingReports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>المحافظات والمراكز</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('market-stats')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'market-stats'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>إحصائيات السوق</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('price-benchmarks')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'price-benchmarks'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>الأسعار والبيانات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit-logs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit-logs'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل العمليات</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PENDING APPROVAL LISTINGS */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
              <div>
                <h2 className="text-base font-black text-[#14281d]">
                  الإعلانات بانتظار المراجعة والاعتماد ({pendingListings.length})
                </h2>
                <p className="text-xs text-[#527963]">
                  قم بفحص البيانات ومستندات الملكية قبل الموافقة على نشر الإعلان للعامة.
                </p>
              </div>
            </div>

            {pendingListings.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#527963] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16a34a] mx-auto" />
                <p className="font-bold">رائع! لا توجد إعلانات معلقة بانتظار المراجعة حالياً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 rounded-xl border border-[#fef08a] bg-[#fefce8]/60 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold bg-[#ca8a04] text-white px-2 py-0.5 rounded">
                          طلب نشر جديد
                        </span>
                        <h3 className="font-bold text-sm text-[#14281d] mt-1">{listing.title}</h3>
                        <span className="text-xs text-[#527963]">
                          المعلن: {listing.ownerName} ({listing.advertiserType}) · هاتف: {listing.contactPhone}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onViewDetails(listing)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#d1d5db] text-xs font-bold text-[#374151] hover:bg-[#f3f4f6] cursor-pointer"
                        >
                          معاينة كاملة
                        </button>
                        <button
                          type="button"
                          onClick={() => approveListing(listing.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          اعتماد ونشر ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingListingId(listing.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#fee2e2] text-[#dc2626] text-xs font-bold hover:bg-[#fecaca] cursor-pointer"
                        >
                          رفض
                        </button>
                      </div>
                    </div>

                    {rejectingListingId === listing.id && (
                      <div className="p-3 bg-white rounded-xl border border-[#fca5a5] space-y-2 text-xs">
                        <label className="font-bold text-[#dc2626]">سبب الرفض للمعلن:</label>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="مثال: يرجى إرفاق سند الملكية أو توضيح مصدر المياه بدقة"
                          className="w-full border border-[#d1d5db] rounded-lg p-2 text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRejectingListingId(null)}
                            className="px-3 py-1 rounded bg-[#f3f4f6]"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmReject(listing.id)}
                            className="px-3 py-1 rounded bg-[#dc2626] text-white font-bold"
                          >
                            تأكيد الرفض
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL LISTINGS */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                كافة إعلانات المنصة ({listings.length})
              </h2>
            </div>
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-xl border border-[#e2eae5] bg-[#fcfdfc] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#14281d]">{l.title}</h4>
                    <span className="text-[#527963]">
                      {l.area} {l.areaUnit} · {l.governorate} ({l.city}) · {l.price} · المعلن: {l.ownerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onViewDetails(l)}
                      className="px-2.5 py-1 rounded bg-[#f0fdf4] text-[#166534] font-bold cursor-pointer hover:bg-[#dcfce7]"
                    >
                      معاينة
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleListingVerification(l.id)}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                        l.isVerified
                          ? 'bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe]'
                          : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                      }`}
                      title={l.isVerified ? 'إلغاء علامة التوثيق' : 'توثيق الإعلان رسمياً'}
                    >
                      {l.isVerified ? 'موثق ✓' : 'توثيق'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditListing(l)}
                      className="px-2.5 py-1 rounded bg-white border border-[#d1d5db] font-bold cursor-pointer hover:bg-[#f9fafb]"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleListingStatus(l.id)}
                      className="px-2.5 py-1 rounded bg-[#f3f4f6] font-bold cursor-pointer hover:bg-[#e5e7eb]"
                    >
                      {l.status === 'published' ? 'إيقاف' : 'نشر'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteListing(l.id)}
                      className="p-1 text-[#dc2626] hover:bg-[#fee2e2] rounded cursor-pointer"
                      title="حذف الإعلان"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SOLD TRANSACTIONS & CONFIDENTIAL ANALYTICS */}
        {activeTab === 'sold-deals' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf3ef] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#16a34a]" />
                  <h2 className="text-base font-black text-[#14281d]">
                    سجل الصفقات المباعة والبيانات الداخلية السرية (Sold Transactions)
                  </h2>
                </div>
                <p className="text-xs text-[#527963] mt-0.5">
                  المستخدم العادي يرى الملخص العام؛ الإدارة والنظام التحليلي يريان أسماء الأطراف وسندات التوثيق.
                </p>
              </div>

              {/* Confidential view toggle */}
              <button
                type="button"
                onClick={() => setShowConfidentialDetails(!showConfidentialDetails)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showConfidentialDetails
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'bg-[#f3f4f6] text-[#374151]'
                }`}
              >
                {showConfidentialDetails ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{showConfidentialDetails ? 'البيانات الداخلية السرية مفعلة' : 'عرض ملخص العامة فقط'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {initialSoldTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-[#fcfdfc] rounded-2xl border border-[#e2eae5] p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded border border-[#86efac]">
                        صفقة منفذة رسمياً ✓
                      </span>
                      <h3 className="font-bold text-sm text-[#14281d] mt-1">{tx.title}</h3>
                      <span className="text-xs text-[#527963]">
                        {tx.governorate} · {tx.city} ({tx.village || ''}) · تاريخ الصفقة: {tx.saleDate}
                      </span>
                    </div>

                    <div className="text-left font-sans">
                      <span className="text-[10px] text-[#6b7280] block">سعر التنفيذ الفعلي</span>
                      <span className="text-base font-black text-[#166534]">
                        {tx.soldPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                      <span className="text-[10px] text-[#dc2626] block line-through">
                        المطلوب: {tx.askingPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  </div>

                  {/* CONFIDENTIAL INTERNAL TRANSACTION CARD (ADMIN ONLY) */}
                  {showConfidentialDetails && (
                    <div className="bg-[#f0f9ff] rounded-xl p-3.5 border border-[#bae6fd] space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#0369a1]">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-[#0284c7]" />
                          <span>بيانات الصفقة الداخلية السرية (Admin Only):</span>
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#93c5fd]">
                          درجة الثقة: {tx.confidentialData?.confidenceScore || 98}% ({tx.confidentialData?.confidenceLevel || 'عالية جداً'})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-[#374151]">
                        <div>
                          <span className="text-[#6b7280] block">البائع:</span>
                          <strong className="text-[#14281d]">{tx.confidentialData?.sellerName || 'مالك معتمد'}</strong>
                        </div>
                        <div>
                          <span className="text-[#6b7280] block">المشتري:</span>
                          <strong className="text-[#14281d]">{tx.confidentialData?.buyerName || 'مشتري مسجل'}</strong>
                        </div>
                        <div>
                          <span className="text-[#6b7280] block">المصدر:</span>
                          <strong className="text-[#14281d]">{tx.confidentialData?.source || 'مأمورية الشهر العقاري'}</strong>
                        </div>
                        <div>
                          <span className="text-[#6b7280] block">طريقة التحقق:</span>
                          <strong className="text-[#14281d]">{tx.confidentialData?.verificationMethod || 'مطابقة العقد المشهر'}</strong>
                        </div>
                      </div>

                      {tx.confidentialData?.documentsAttached && (
                        <div className="pt-1 border-t border-[#bae6fd]/60 text-[10px] text-[#527963] flex items-center gap-2">
                          <span className="font-bold">المستندات المحققة:</span>
                          <span>{tx.confidentialData.documentsAttached.join(' · ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: LAND PURCHASE REQUESTS MANAGEMENT */}
        {activeTab === 'purchase-requests' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf3ef] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#166534]" />
                  <h2 className="text-base sm:text-lg font-black text-[#14281d]">
                    إدارة طلبات شراء الأراضي والبلاغات ({purchaseRequests.length})
                  </h2>
                </div>
                <p className="text-xs text-[#527963] mt-0.5">
                  مراقبة طلبات الشراء المنشورة تلقائياً، إخفاء المخالفات الإدارية، وإيقاف أو إعادة فتح الطلبات.
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-[#f0fdf4] text-[#166534] font-bold rounded-lg border border-[#86efac]">
                  النشطة: {purchaseRequests.filter((r) => r.status === 'open' && r.moderationStatus === 'visible').length}
                </span>
                <span className="px-2.5 py-1 bg-[#fee2e2] text-[#dc2626] font-bold rounded-lg border border-[#fca5a5]">
                  المخفية إدارياً: {purchaseRequests.filter((r) => r.moderationStatus === 'hidden').length}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  placeholder="ابحث بالعنوان، المشتري، رقم الهاتف، المحافظة..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={requestModerationFilter}
                  onChange={(e) => setRequestModerationFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                >
                  <option value="all">جميع حالات الإشراف</option>
                  <option value="visible">ظاهر للعامة (Visible)</option>
                  <option value="hidden">مخفي إدارياً (Hidden)</option>
                </select>

                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="open">مفتوح (Open)</option>
                  <option value="closed">مغلق (Closed)</option>
                  <option value="expired">منتهي (Expired)</option>
                </select>
              </div>
            </div>

            {/* Requests List */}
            {purchaseRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#527963] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16a34a] mx-auto" />
                <p className="font-bold">لا توجد طلبات شراء مسجلة في المنصة حالياً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchaseRequests
                  .filter((req) => {
                    if (requestModerationFilter !== 'all' && req.moderationStatus !== requestModerationFilter) {
                      return false;
                    }
                    if (requestStatusFilter !== 'all' && req.status !== requestStatusFilter) {
                      return false;
                    }
                    if (requestSearchQuery.trim()) {
                      const q = requestSearchQuery.trim().toLowerCase();
                      const matchTitle = req.title.toLowerCase().includes(q);
                      const matchBuyer = req.buyerName.toLowerCase().includes(q);
                      const matchPhone = req.buyerPhone.includes(q);
                      const matchGov = req.governorate.toLowerCase().includes(q);
                      const matchCity = req.city.toLowerCase().includes(q);
                      if (!matchTitle && !matchBuyer && !matchPhone && !matchGov && !matchCity) {
                        return false;
                      }
                    }
                    return true;
                  })
                  .map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                        req.moderationStatus === 'hidden'
                          ? 'border-red-200 bg-red-50/50'
                          : 'border-gray-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#14281d]">{req.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {req.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.moderationStatus === 'visible'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {req.moderationStatus === 'visible' ? 'ظاهر للعامة' : 'مخفي إدارياً'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === 'open'
                                  ? 'bg-sky-100 text-sky-800'
                                  : req.status === 'closed'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              الحالة: {req.status === 'open' ? 'مفتوح' : req.status === 'closed' ? 'مغلق' : 'منتهي'}
                            </span>
                          </div>

                          <p className="text-[#527963] text-[11px]">
                            المشتري: <strong>{req.buyerName}</strong> ({req.buyerPhone}) · المحافظة: {req.governorate} — {req.city}
                          </p>

                          <p className="text-gray-600 text-[11px]">
                            المساحة: {req.areaMin} إلى {req.areaMax} {req.areaUnit} · الميزانية:{' '}
                            {req.isBudgetUnspecified ? 'مفتوحة للتفاوض' : `${req.budgetMax?.toLocaleString('ar-EG')} ج.م`} · العروض المقدمة: {req.offerCount || 0}
                          </p>

                          {req.moderationReason && (
                            <p className="text-red-700 bg-red-100/70 p-2 rounded-lg text-[11px]">
                              سبب الإجراء الإداري: {req.moderationReason}
                            </p>
                          )}
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          {req.moderationStatus === 'visible' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setModeratingRequestId(req.id);
                                setModeratingAction('hide');
                                setModeratingReason('مخالفة معايير وسياسات النشر على منصة أرضك');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#fee2e2] text-[#dc2626] font-bold hover:bg-[#fecaca] transition-colors"
                            >
                              إخفاء الطلب
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                await adminModerateRequestAction(req.id, 'restore', 'إلغاء الإخفاء وإعادة النشر للعامة');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#f0fdf4] text-[#166534] border border-[#86efac] font-bold hover:bg-emerald-100 transition-colors"
                            >
                              إلغاء الإخفاء ونشر ✓
                            </button>
                          )}

                          {req.status === 'open' && (
                            <button
                              type="button"
                              onClick={() => {
                                setModeratingRequestId(req.id);
                                setModeratingAction('close');
                                setModeratingReason('إغلاق إداري للطلب لاكتمال الغرض أو المخالفة');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                            >
                              إغلاق نهائي
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Moderation Reason Modal */}
            {moderatingRequestId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">
                    {moderatingAction === 'hide' ? 'إخفاء طلب الشراء عن العامة' : 'إغلاق طلب الشراء نهائياً'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    يرجى كتابة سبب اتخاذ هذا الإجراء الإداري ليتم تسجيله في سجل التدقيق (Audit Logs).
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">سبب الإجراء:</label>
                    <textarea
                      rows={3}
                      value={moderatingReason}
                      onChange={(e) => setModeratingReason(e.target.value)}
                      placeholder="اكتب سبب الإخفاء أو الإغلاق..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#166534]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModeratingRequestId(null)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingModeration || !moderatingReason.trim()}
                      onClick={async () => {
                        setIsSubmittingModeration(true);
                        await adminModerateRequestAction(moderatingRequestId, moderatingAction, moderatingReason.trim());
                        setIsSubmittingModeration(false);
                        setModeratingRequestId(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#dc2626] text-white text-xs font-bold hover:bg-[#b91c1c] disabled:opacity-50"
                    >
                      {isSubmittingModeration ? 'جاري التنفيذ...' : 'تأكيد الإجراء'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS & ADMINS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-5">
            {/* Action Notice Alert */}
            {adminActionNotice && (
              <div className="p-3.5 bg-[#f0fdf4] border border-[#86efac] text-[#166534] rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span>{adminActionNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminActionNotice(null)}
                  className="text-xs text-[#527963] hover:text-[#166534] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header & Add Admin Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf3ef] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#166534]" />
                  <h2 className="text-base sm:text-lg font-black text-[#14281d]">
                    إدارة المستخدمين وطاقم الإدارة (Admins)
                  </h2>
                </div>
                <p className="text-xs text-[#527963] mt-0.5">
                  التحكم في كافة الحسابات، ترقية وتعيين مسؤولين جدد لمشاركة إدارة المنصة، وتعيين كلمات المرور.
                </p>
              </div>

              {/* Add New Admin Button */}
              <button
                type="button"
                onClick={() => setIsAddAdminOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ إضافة مسؤول جديد (أدمن)</span>
              </button>
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-[#fcfdfc] border border-[#e2eae5] p-3 rounded-xl">
                <span className="text-[11px] text-[#6b7280] block">إجمالي المسجلين</span>
                <span className="text-lg font-black text-[#14281d]">{users.length}</span>
              </div>
              <div className="bg-[#fef2f2] border border-[#fecaca] p-3 rounded-xl">
                <span className="text-[11px] text-[#b91c1c] block font-bold">المسؤولون (Admins)</span>
                <span className="text-lg font-black text-[#dc2626]">{adminUsers.length}</span>
              </div>
              <div className="bg-[#eff6ff] border border-[#bfdbfe] p-3 rounded-xl">
                <span className="text-[11px] text-[#1e40af] block">الشركات العقارية</span>
                <span className="text-lg font-black text-[#2563eb]">{companyUsers.length}</span>
              </div>
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-xl">
                <span className="text-[11px] text-[#166534] block">الوسطاء والوكلاء</span>
                <span className="text-lg font-black text-[#166534]">{agentUsers.length}</span>
              </div>
              <div className="bg-[#f9fafb] border border-[#e5e7eb] p-3 rounded-xl">
                <span className="text-[11px] text-[#4b5563] block">الملاك والباحثون</span>
                <span className="text-lg font-black text-[#374151]">{regularUsers.length}</span>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    userRoleFilter === 'all'
                      ? 'bg-[#166534] text-white'
                      : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                  }`}
                >
                  الكل ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    userRoleFilter === 'admin'
                      ? 'bg-[#dc2626] text-white'
                      : 'bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]'
                  }`}
                >
                  المسؤولون 🛡️ ({adminUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('company')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    userRoleFilter === 'company'
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#dbeafe]'
                  }`}
                >
                  الشركات ({companyUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('agent')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    userRoleFilter === 'agent'
                      ? 'bg-[#166534] text-white'
                      : 'bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7]'
                  }`}
                >
                  الوكلاء ({agentUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('user')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    userRoleFilter === 'user'
                      ? 'bg-[#374151] text-white'
                      : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                  }`}
                >
                  المستخدمون ({regularUsers.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم أو الهاتف..."
                  className="w-full pl-3 pr-8 py-1.5 text-xs border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>
            </div>

            {/* Users & Admins List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6b7280]">
                  لا توجد حسابات مطابقة لمعايير البحث.
                </div>
              ) : (
                filteredUsers.map((u, userIndex) => {
                  const isSuperAdmin = u.phone === '01028200048';
                  const isAdmin = u.role === 'admin';

                  return (
                    <div
                      key={`${u.id || 'usr'}-${userIndex}`}
                      className={`p-4 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isSuperAdmin
                          ? 'border-[#f59e0b] bg-[#fffbeb]/60 shadow-xs'
                          : isAdmin
                          ? 'border-[#fca5a5] bg-[#fef2f2]/40'
                          : 'border-[#e2eae5] bg-[#fcfdfc]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm text-[#14281d] flex items-center gap-1.5">
                            {isSuperAdmin && <Crown className="w-4 h-4 text-[#d97706]" />}
                            <span>{u.name}</span>
                          </h4>

                          {/* Role Badges */}
                          {isSuperAdmin ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#fef3c7] text-[#b45309] border border-[#fde68a] flex items-center gap-1">
                              <span>👑 المدير العام الرئيسي (سوبر أدمن)</span>
                            </span>
                          ) : isAdmin ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              <span>مسؤول معتمد (Admin)</span>
                            </span>
                          ) : u.role === 'company' || u.companyProfile ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8]">
                              🏗️ شركة استثمار
                            </span>
                          ) : u.role === 'agent' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f0fdf4] text-[#166534]">
                              🏢 وسيط معتمد
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f3f4f6] text-[#374151]">
                              👤 مستخدم / مالك
                            </span>
                          )}

                          {/* Verification Level Badge */}
                          <span className="text-[10px] font-bold text-[#166534]">
                            {u.verificationLevel === 'verified_company'
                              ? '🔵 شركة موثقة'
                              : u.verificationLevel === 'verified_user'
                              ? '🔵 حساب موثق'
                              : '🟢 عضو عادي'}
                          </span>

                          {/* Status Badge */}
                          {u.status === 'blocked' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fee2e2] text-[#dc2626]">
                              محظور
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[#527963] text-[11px] flex-wrap">
                          <span>الهاتف: <strong className="text-[#14281d] font-sans" dir="ltr">{u.phone}</strong></span>
                          {u.email && <span>البريد: {u.email}</span>}
                          <span>المحافظة: {u.governorate || 'القاهرة'}</span>
                          <span>تاريخ الانضمام: {u.joinedAt}</span>
                          {u.password && (
                            <span className="text-[#6b7280]">
                              كلمة المرور: <span className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">{u.password}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Management Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap self-start md:self-auto">
                        {/* Super Admin Tag vs Regular Admin Controls */}
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setResetTargetUser(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#d97706]/40 hover:bg-[#fef3c7] text-[#92400e] text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>تغيير كلمة المرور</span>
                            </button>
                            <span className="px-2.5 py-1 text-[11px] font-bold text-[#b45309] bg-[#fef3c7] rounded-lg border border-[#fde68a]">
                              حساب محمي دائم
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Promote / Demote Admin Buttons */}
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() => handleDemoteAdmin(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2] font-bold text-xs cursor-pointer transition-colors"
                                title="إلغاء صلاحية الأدمن وتحويله لمستخدم عادي"
                              >
                                سحب صلاحية الأدمن
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePromoteToAdmin(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7] border border-[#bbf7d0] font-bold text-xs cursor-pointer transition-colors flex items-center gap-1"
                                title="ترقية الحساب ليكون مسؤولاً في إدارة الموقع"
                              >
                                <Shield className="w-3.5 h-3.5" />
                                <span>ترقية إلى أدمن</span>
                              </button>
                            )}

                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => setResetTargetUser(u)}
                              className="px-2 py-1.5 rounded-lg bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#374151] font-bold text-xs cursor-pointer transition-colors flex items-center gap-1"
                              title="تحديد أو تغيير كلمة المرور للمستخدم"
                            >
                              <Key className="w-3.5 h-3.5 text-[#6b7280]" />
                              <span>كلمة المرور</span>
                            </button>

                            {/* Block / Unblock */}
                            <button
                              type="button"
                              onClick={() => toggleUserBlock(u.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                u.status === 'blocked'
                                  ? 'bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]'
                                  : 'bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]'
                              }`}
                            >
                              {u.status === 'blocked' ? 'إلغاء الحظر' : 'حظر'}
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف حساب "${u.name}" نهائياً من الموقع؟`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-[#dc2626] hover:bg-[#fee2e2] rounded-lg cursor-pointer transition-colors"
                              title="حذف الحساب نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW ADMIN */}
        {isAddAdminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200 p-6 space-y-4 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#14281d]">إضافة مسؤول جديد للمنصة (أدمن)</h3>
                    <p className="text-[11px] text-[#527963]">سيكون للمسؤول صلاحيات كاملة لإدارة المنصة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f3f4f6] text-[#6b7280] flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#14281d] mb-1">اسم المسؤول بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="مثال: م. محمود السيد (إدارة المنصة)"
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#14281d] mb-1">رقم الهاتف المصري * (اسم المستخدم للدخول)</label>
                  <input
                    type="tel"
                    required
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    placeholder="مثال: 010xxxxxxxx"
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] font-sans"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#14281d] mb-1">كلمة المرور للمسؤول *</label>
                  <input
                    type="text"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] font-mono"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-[#527963] mt-0.5 block">
                    يمكن استخدام كلمة المرور الافتراضية <strong>2004103Om@</strong> أو كتابة كلمة مرور جديدة.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#14281d] mb-1">المحافظة</label>
                  <select
                    value={newAdminGov}
                    onChange={(e) => setNewAdminGov(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  >
                    {egyptianGovernorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#14281d] mb-1">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin2@ardak.eg"
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    dir="ltr"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAdminOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#f3f4f6] text-[#4b5563] font-bold cursor-pointer hover:bg-[#e5e7eb]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold cursor-pointer shadow-sm"
                  >
                    إضافة المسؤول وتفعيله ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RESET PASSWORD */}
        {resetTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200 p-5 space-y-4 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#166534]" />
                  <h3 className="font-bold text-sm text-[#14281d]">
                    تعيين كلمة مرور لـ {resetTargetUser.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="w-7 h-7 rounded-lg hover:bg-[#f3f4f6] text-[#6b7280] flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePasswordReset} className="space-y-3 text-xs">
                <p className="text-[#527963] text-[11px]">
                  الهاتف: <strong className="font-sans" dir="ltr">{resetTargetUser.phone}</strong>
                </p>

                <div>
                  <label className="block font-bold text-[#14281d] mb-1">كلمة المرور الجديدة *</label>
                  <input
                    type="text"
                    required
                    value={customPasswordInput}
                    onChange={(e) => setCustomPasswordInput(e.target.value)}
                    placeholder="اكتب كلمة المرور الجديدة (6 خانات فأكثر)..."
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResetTargetUser(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f3f4f6] text-[#4b5563] font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold cursor-pointer"
                  >
                    حفظ كلمة المرور ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: COMPANIES & BUSINESS PROFILES */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                الشركات وحسابات الأعمال المسجلة ({companyUsers.length})
              </h2>
              <p className="text-xs text-[#527963]">
                ملفات المكاتب والشركات الزراعية ومحافظات النشاط وإعلانات كل شركة.
              </p>
            </div>

            <div className="space-y-4">
              {companyUsers.map((comp) => {
                const profile = comp.companyProfile;
                return (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl border border-[#e2eae5] bg-[#fcfdfc] space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-[#14281d]">
                            {profile?.companyName || comp.name}
                          </h3>
                          <span className="text-[10px] font-bold bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded-full">
                            {comp.verificationLevel === 'verified_company' ? '🔵 شركة موثقة' : 'قيد التدقيق'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#527963]">
                          المحافظات النشطة: {profile?.operatingGovernorates?.join(' – ') || comp.governorate} · هاتف: {comp.phone}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#166534] bg-[#f0fdf4] px-2.5 py-1 rounded-lg border border-[#bbf7d0]">
                        {profile?.listingsCount || 37} إعلاناً
                      </span>
                    </div>

                    <p className="text-[#374151] text-xs leading-relaxed">
                      {profile?.bio || 'شركة استثمار زراعي متخصصة.'}
                    </p>

                    <div className="pt-2 border-t border-[#edf3ef] flex items-center justify-between text-[11px] text-[#6b7280]">
                      <span>السجل التجاري: {profile?.commercialRegister || 'ساري ومقدم'}</span>
                      <span>البطاقة الضريبية: {profile?.taxCard || 'مسجلة'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: VERIFICATION REQUESTS */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                طلبات التوثيق ومراجعة الهوية ({verificationRequests.length})
              </h2>
              <p className="text-xs text-[#527963]">
                فحص مستندات الأفراد والشركات لمنح الشارة الزرقاء 🔵.
              </p>
            </div>

            <div className="space-y-3">
              {verificationRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    req.status === 'pending'
                      ? 'bg-[#fefce8]/60 border-[#fef08a]'
                      : req.status === 'approved'
                      ? 'bg-[#f0fdf4] border-[#86efac]'
                      : 'bg-[#fee2e2] border-[#fca5a5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#14281d]">{req.userName}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border">
                          المطلوب: {req.requestedLevel === 'verified_company' ? '🔵 شركة موثقة' : '🔵 حساب موثق'}
                        </span>
                      </div>
                      <span className="text-[#527963] text-[11px]">
                        هاتف: {req.userPhone} · تاريخ الطلب: {req.submittedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => approveVerification(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold cursor-pointer"
                          >
                            اعتماد التوثيق ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectVerification(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#fee2e2] text-[#dc2626] font-bold cursor-pointer"
                          >
                            رفض الطلب
                          </button>
                        </>
                      ) : (
                        <span className="font-bold text-[#166534]">
                          {req.status === 'approved' ? 'تم الاعتماد بنجاح ✓' : 'مرفوض'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-[#e2eae5] space-y-1">
                    <span className="font-bold text-[#374151] block">المستندات المرفقة:</span>
                    <p className="text-[11px] text-[#527963]">{req.documents.join(' · ')}</p>
                    {req.notes && <p className="text-[11px] text-[#6b7280]">ملاحظات: {req.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                بلاغات الإعلانات ({reports.length})
              </h2>
            </div>
            {reports.length === 0 ? (
              <p className="text-xs text-[#527963] py-8 text-center">لا توجد بلاغات مسجلة.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl border border-[#fee2e2] bg-[#fff5f5] text-xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#14281d]">{r.listingTitle}</h4>
                      <p className="text-[#dc2626] text-[11px]">
                        السبب: {r.reason} · المُبلغ: {r.reporterName} ({r.reporterPhone})
                      </p>
                      <p className="text-[#527963] text-[11px] mt-0.5">{r.details}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => resolveReport(r.id, 'resolved')}
                            className="px-3 py-1 rounded bg-[#166534] text-white font-bold cursor-pointer"
                          >
                            اتخاذ إجراء
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveReport(r.id, 'dismissed')}
                            className="px-3 py-1 rounded bg-[#f3f4f6] text-[#374151] font-bold cursor-pointer"
                          >
                            تجاهل
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: LOCATIONS & GOVERNORATES */}
        {activeTab === 'locations' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                المحافظات والمراكز والقرى الزراعية
              </h2>
              <p className="text-xs text-[#527963]">
                إدارة التقسيم الجغرافي الزراعي ومؤشرات كل حوض زراعي.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {egyptianGovernorates.map((gov) => (
                <div key={gov} className="p-3 rounded-xl bg-[#fcfdfc] border border-[#e2eae5] text-center font-bold text-[#14281d]">
                  {gov}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: MARKET STATS */}
        {activeTab === 'market-stats' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                إحصائيات السوق والأسعار ومؤشرات العرض والطلب
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                <span className="text-xs text-[#6b7280] block">إجمالي الإعلانات النشطة</span>
                <span className="text-2xl font-black text-[#166534] font-sans">{publishedListings.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f0f9ff] border border-[#bae6fd]">
                <span className="text-xs text-[#6b7280] block">الصفقات المحققة</span>
                <span className="text-2xl font-black text-[#0284c7] font-sans">{initialSoldTransactions.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#fefce8] border border-[#fef08a]">
                <span className="text-xs text-[#6b7280] block">إجمالي الشركات الموثقة</span>
                <span className="text-2xl font-black text-[#854d0e] font-sans">{companyUsers.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: PRICE BENCHMARKS */}
        {activeTab === 'price-benchmarks' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                الأسعار والبيانات ومحرك التثمين الاسترشادي
              </h2>
              <p className="text-xs text-[#527963]">
                معايير التقييم وأوزان التشابه الـ 7 لاحتساب النطاق السعري العادل.
              </p>
            </div>
            <div className="p-4 bg-[#f0fdf4] rounded-xl border border-[#86efac] text-xs text-[#166534] space-y-2">
              <span className="font-bold block">الأوزان المعتمدة:</span>
              <p>الموقع: 30% · المساحة: 15% · المياه والملوحة: 15% · الطريق: 10% · الكهرباء: 10% · الزراعة: 10% · البنية التحتية والملكية: 10%.</p>
            </div>
          </div>
        )}

        {/* TAB 11: AUDIT LOGS */}
        {activeTab === 'audit-logs' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#edf3ef] pb-3">
              <h2 className="text-base font-black text-[#14281d]">
                سجل العمليات الإدارية (Audit Logs)
              </h2>
              <p className="text-xs text-[#527963]">
                سجل زمني غير قابل للتعديل لجميع قرارات الإدارة والاعتمادات.
              </p>
            </div>
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#fcfdfc] border border-[#edf3ef] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#14281d]">{log.action}: {log.target}</span>
                    <span className="text-[#527963] text-[11px] block">
                      المسؤول: {log.admin} · {log.time}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dcfce7] text-[#15803d]">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
