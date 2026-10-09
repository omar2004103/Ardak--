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
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onViewDetails: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

export type AdminTab =
  | 'listings'
  | 'pending'
  | 'sold-deals'
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
    approveListing,
    rejectListing,
    deleteListing,
    toggleListingStatus,
    resolveReport,
    approveVerification,
    rejectVerification,
    toggleUserBlock,
    deleteUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Sold Transactions confidential view toggle
  const [showConfidentialDetails, setShowConfidentialDetails] = useState(true);

  // Calculations
  const pendingListings = listings.filter((item) => item.status === 'pending_approval');
  const publishedListings = listings.filter((item) => item.status === 'published');
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter((v) => v.status === 'pending');
  const companyUsers = users.filter((u) => u.role === 'company' || u.companyProfile);

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
      admin: 'م. عادل إبراهيم',
      time: 'منذ 15 دقيقة',
      status: 'نجاح',
    },
    {
      id: 'log-2',
      action: 'توثيق شركة أعمال (🔵 شركة موثقة)',
      target: 'شركة النيل للاستثمار الزراعي',
      admin: 'م. عادل إبراهيم',
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
      admin: 'م. عادل إبراهيم',
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
            <div className="w-12 h-12 rounded-2xl bg-[#166534] text-white flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6" />
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#527963]">
              المسؤول الحالي: <strong>م. عادل إبراهيم</strong>
            </span>
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
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>المستخدمون ({users.length})</span>
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetails(l)}
                      className="px-2.5 py-1 rounded bg-[#f0fdf4] text-[#166534] font-bold cursor-pointer"
                    >
                      معاينة
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditListing(l)}
                      className="px-2.5 py-1 rounded bg-white border border-[#d1d5db] font-bold cursor-pointer"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleListingStatus(l.id)}
                      className="px-2.5 py-1 rounded bg-[#f3f4f6] font-bold cursor-pointer"
                    >
                      {l.status === 'published' ? 'إيقاف' : 'نشر'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteListing(l.id)}
                      className="p-1 text-[#dc2626] hover:bg-[#fee2e2] rounded cursor-pointer"
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

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
              <div>
                <h2 className="text-base font-black text-[#14281d]">
                  قائمة المستخدمين المسجلين ({users.length})
                </h2>
                <p className="text-xs text-[#527963]">
                  إدارة أدوار المستخدمين وتجميد الحسابات المخالفة.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-xl border border-[#e2eae5] bg-[#fcfdfc] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#14281d]">{u.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f3f6f4] text-[#374151]">
                        {u.role === 'admin'
                          ? '🛡️ Admin'
                          : u.role === 'company'
                          ? '🏗️ شركة'
                          : u.role === 'agent'
                          ? '🏢 وكيل'
                          : '👤 مستخدم'}
                      </span>
                      <span className="text-[10px] font-bold text-[#166534]">
                        {u.verificationLevel === 'verified_company'
                          ? '🔵 شركة موثقة'
                          : u.verificationLevel === 'verified_user'
                          ? '🔵 حساب موثق'
                          : '🟢 عضو عادي'}
                      </span>
                    </div>
                    <span className="text-[#527963] text-[11px]">
                      الهاتف: {u.phone} · المحافظة: {u.governorate || 'البحيرة'} · انضم في: {u.joinedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {u.role !== 'admin' && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleUserBlock(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            u.status === 'blocked'
                              ? 'bg-[#dcfce7] text-[#166534]'
                              : 'bg-[#fee2e2] text-[#dc2626]'
                          }`}
                        >
                          {u.status === 'blocked' ? 'إلغاء الحظر' : 'حظر الحساب'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(u.id)}
                          className="p-1 text-[#dc2626] hover:bg-[#fee2e2] rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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
