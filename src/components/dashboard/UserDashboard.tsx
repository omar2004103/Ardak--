import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Listing, CompanyProfile } from '../../types/listing.ts';
import {
  Heart,
  FileText,
  Eye,
  PlusCircle,
  Building,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Bell,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  Pause,
  Play,
  Lock,
  Sparkles,
  Info,
  Briefcase,
  Share2,
} from 'lucide-react';
import { egyptianGovernorates } from '../../data/listings.ts';

interface UserDashboardProps {
  onNavigateHome: () => void;
  onNavigateToLands: () => void;
  onOpenAddListing: () => void;
  onViewListingDetails: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onNavigateHome,
  onNavigateToLands,
  onOpenAddListing,
  onViewListingDetails,
  onEditListing,
}) => {
  const {
    currentUser,
    listings,
    favorites,
    priceAlerts,
    upgradeToBusiness,
    requestVerification,
    toggleListingStatus,
    deleteListing,
    updateProfile,
    toggleFavorite,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'my-listings' | 'favorites' | 'alerts' | 'business' | 'verification' | 'settings'
  >('overview');

  // Business Upgrade Form
  const [companyName, setCompanyName] = useState(
    currentUser?.companyProfile?.companyName || ''
  );
  const [companyBio, setCompanyBio] = useState(
    currentUser?.companyProfile?.bio || ''
  );
  const [companyPhone, setCompanyPhone] = useState(
    currentUser?.companyProfile?.phone || currentUser?.phone || ''
  );
  const [companyWhatsapp, setCompanyWhatsapp] = useState(
    currentUser?.companyProfile?.whatsapp || currentUser?.phone || ''
  );
  const [companyGov, setCompanyGov] = useState(
    currentUser?.companyProfile?.governorate || currentUser?.governorate || 'البحيرة'
  );
  const [operatingGovs, setOperatingGovs] = useState<string[]>(
    currentUser?.companyProfile?.operatingGovernorates || ['البحيرة', 'الإسكندرية', 'مطروح']
  );
  const [commRegister, setCommRegister] = useState(
    currentUser?.companyProfile?.commercialRegister || ''
  );
  const [taxCard, setTaxCard] = useState(currentUser?.companyProfile?.taxCard || '');

  // Verification request form
  const [verificationNotes, setVerificationNotes] = useState('');
  const [docUpload1, setDocUpload1] = useState('بطاقة الرقم القومي سارية');
  const [docUpload2, setDocUpload2] = useState('عقد ملكية أو تفويض رسمي');

  // Settings form
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileGov, setProfileGov] = useState(currentUser?.governorate || 'البحيرة');

  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!currentUser) {
    return (
      <div className="py-20 text-center text-right" dir="rtl">
        <h2 className="text-xl font-bold">يرجى تسجيل الدخول لعرض لوحة التحكم.</h2>
      </div>
    );
  }

  // User's listings
  const myListings = listings.filter(
    (l) => l.ownerId === currentUser.id || l.ownerName === currentUser.name
  );

  // Favorite listings
  const myFavoriteListings = listings.filter((l) => favorites.includes(l.id));

  // Total views
  const totalViews = myListings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);

  // Handle Business Upgrade Submit
  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionNotice(null);
    const result = upgradeToBusiness({
      companyName: companyName.trim() || `${currentUser.name} للتطوير الزراعي`,
      phone: companyPhone,
      whatsapp: companyWhatsapp,
      bio: companyBio.trim() || 'شركة وساطة واستثمار زراعي متخصصة.',
      governorate: companyGov,
      operatingGovernorates: operatingGovs,
      commercialRegister: commRegister,
      taxCard: taxCard,
      listingsCount: myListings.length,
      isVerified: false,
    });
    if (result.success) {
      setActionNotice({ type: 'success', text: result.message });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Handle Verification Request
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionNotice(null);
    const docs = [docUpload1, docUpload2].filter(Boolean);
    const result = requestVerification(docs, verificationNotes);
    if (result.success) {
      setActionNotice({ type: 'success', text: result.message });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      email: profileEmail,
      governorate: profileGov,
    });
    setActionNotice({ type: 'success', text: 'تم حفظ تعديلات الحساب بنجاح!' });
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Render Verification Badge with Disclaimer
  const renderVerificationBadge = () => {
    if (currentUser.verificationLevel === 'verified_company') {
      return (
        <div className="group relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#dbeafe] text-[#1d4ed8] border border-[#93c5fd]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>🔵 شركة موثقة</span>
          {/* Detailed tooltip/disclaimer badge */}
          <div className="hidden group-hover:block absolute top-full right-0 mt-1.5 w-64 p-2.5 bg-[#1e293b] text-white text-[10px] rounded-xl shadow-xl z-30 leading-relaxed font-normal">
            تم التحقق من بيانات الشركة وسجلها التجاري وفق المستندات المطلوبة. لا يمثل التوثيق ضماناً بأن كل أرض يعرضها الحساب سليمة قانونياً.
          </div>
        </div>
      );
    }

    if (currentUser.verificationLevel === 'verified_user') {
      return (
        <div className="group relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#dbeafe] text-[#1d4ed8] border border-[#93c5fd]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>🔵 حساب موثق</span>
          <div className="hidden group-hover:block absolute top-full right-0 mt-1.5 w-64 p-2.5 bg-[#1e293b] text-white text-[10px] rounded-xl shadow-xl z-30 leading-relaxed font-normal">
            تم التحقق من بعض بيانات الهوية والهاتف وفق متطلبات المنصة. التوثيق له نطاق محدد ولا يعد ضماناً قانونياً شاملاً.
          </div>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
        <span>🟢 عضو عادي</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] py-8 sm:py-10 text-right" dir="rtl">
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
            <li className="text-[#14281d] font-bold">لوحة التحكم</li>
          </ol>
        </nav>

        {/* WELCOME BANNER (Requested Exact Layout) */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[#14281d]">
                مرحبًا، {currentUser.name}
              </h1>
              {renderVerificationBadge()}
              <span className="text-xs font-bold text-[#527963] bg-[#f3f6f4] px-2 py-0.5 rounded-md">
                {currentUser.role === 'company'
                  ? 'حساب شركة'
                  : currentUser.role === 'agent'
                  ? 'حساب وكيل'
                  : 'حساب مستخدم (مشتري / بائع)'}
              </span>
            </div>
            <p className="text-xs text-[#527963]">
              رقم الهاتف: <span className="font-sans font-bold">{currentUser.phone}</span> · محافظة{' '}
              {currentUser.governorate || 'البحيرة'}
            </p>
          </div>

          {/* Primary Action Button: [+ اعرض أرضك] */}
          <button
            type="button"
            onClick={onOpenAddListing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-[#86efac]" />
            <span>+ اعرض أرضك</span>
          </button>
        </div>

        {/* 3 SUMMARY CARDS (Requested Exact 3 Boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: الأراضي المحفوظة */}
          <div
            onClick={() => setActiveTab('favorites')}
            className="bg-white p-5 rounded-2xl border border-[#e2eae5] shadow-2xs hover:border-[#166534] transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#e11d48] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-[#e11d48]" />
            </div>
            <span className="text-xs font-bold text-[#6b7280] block mb-1">
              ❤️ الأراضي المحفوظة
            </span>
            <span className="text-3xl font-black text-[#14281d] font-sans">
              {favorites.length}
            </span>
          </div>

          {/* Card 2: إعلاناتي */}
          <div
            onClick={() => setActiveTab('my-listings')}
            className="bg-white p-5 rounded-2xl border border-[#e2eae5] shadow-2xs hover:border-[#166534] transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#6b7280] block mb-1">
              📋 إعلاناتي
            </span>
            <span className="text-3xl font-black text-[#166534] font-sans">
              {myListings.length}
            </span>
          </div>

          {/* Card 3: مشاهدات إعلاناتي */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2eae5] shadow-2xs text-center">
            <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center mx-auto mb-2">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#6b7280] block mb-1">
              👁️ مشاهدات إعلاناتي
            </span>
            <span className="text-3xl font-black text-[#0284c7] font-sans">
              {totalViews.toLocaleString('ar-EG')}
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionNotice && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              actionNotice.type === 'success'
                ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                : 'bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* DASHBOARD TABS & CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl border border-[#e2eae5] p-3 shadow-2xs space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>لوحة التحكم الرئيسية</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('my-listings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'my-listings'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>إعلاناتي المعروضة</span>
                </div>
                <span className="font-sans text-[11px] px-1.5 py-0.5 rounded-full bg-white/20">
                  {myListings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>الأراضي المحفوظة</span>
                </div>
                <span className="font-sans text-[11px] px-1.5 py-0.5 rounded-full bg-white/20">
                  {favorites.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('alerts')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>تنبيهات الأسعار المحفوظة</span>
                </div>
                <span className="font-sans text-[11px] px-1.5 py-0.5 rounded-full bg-white/20">
                  {priceAlerts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('business')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'business'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>
                    {currentUser.role === 'company'
                      ? '🏢 صفحة الشركة وبيانات الأعمال'
                      : '🏢 تحويل إلى حساب أعمال'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'verification'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>🛡️ طلب توثيق الحساب</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>الملف الشخصي وإعدادات الحساب</span>
                </div>
              </button>
            </div>

            {/* Quick notice box */}
            <div className="bg-[#f0fdf4] p-3 rounded-2xl border border-[#bbf7d0] text-xs text-[#166534] space-y-1">
              <span className="font-bold block">💡 لا حاجة لحساب منفصل:</span>
              <p className="text-[11px] text-[#527963] leading-relaxed">
                يمكنك التبديل بين البحث عن أراضٍ وعرض أراضيك للبيع مباشرة من نفس الحساب بنقرة واحدة.
              </p>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* TAB: Overview / Default */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Company card if user has business account */}
                {currentUser.companyProfile && (
                  <div className="bg-white rounded-2xl border border-[#86efac] p-5 shadow-xs space-y-3 bg-gradient-to-l from-white to-[#f0fdf4]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-lg">
                          🏢
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-[#14281d]">
                              {currentUser.companyProfile.companyName}
                            </h3>
                            <span className="text-[10px] font-bold bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded-full border border-[#93c5fd]">
                              ملف شركة أعمال
                            </span>
                          </div>
                          <span className="text-xs text-[#527963]">
                            {myListings.length} إعلانات معروضة ·{' '}
                            {currentUser.companyProfile.operatingGovernorates?.join(' – ')}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('business')}
                        className="text-xs font-bold text-[#166534] bg-white border border-[#bbf7d0] px-3 py-1.5 rounded-xl hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                      >
                        إدارة ملف الشركة
                      </button>
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed">
                      {currentUser.companyProfile.bio}
                    </p>
                  </div>
                )}

                {/* Recent My Listings */}
                <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
                    <h3 className="text-sm font-black text-[#14281d] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#16a34a]" />
                      <span>آخر إعلاناتك</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('my-listings')}
                      className="text-xs text-[#166534] font-bold hover:underline cursor-pointer"
                    >
                      عرض الكل ({myListings.length})
                    </button>
                  </div>

                  {myListings.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs text-[#6b7280]">ليس لديك إعلانات منشورة بعد.</p>
                      <button
                        type="button"
                        onClick={onOpenAddListing}
                        className="text-xs font-bold text-[#166534] bg-[#f0fdf4] px-4 py-2 rounded-xl border border-[#bbf7d0] hover:bg-[#dcfce7] cursor-pointer"
                      >
                        + اعرض أرضك الآن
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myListings.slice(0, 3).map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#fcfdfc] border border-[#edf3ef] hover:border-[#86efac] transition-all text-xs"
                        >
                          <div>
                            <h4 className="font-bold text-[#14281d]">{listing.title}</h4>
                            <span className="text-[#527963] text-[11px]">
                              {listing.area} {listing.areaUnit} · {listing.price} · {listing.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onViewListingDetails(listing)}
                              className="px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#166534] font-bold text-[11px] hover:bg-[#dcfce7] cursor-pointer"
                            >
                              معاينة
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditListing(listing)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#d1d5db] text-[#374151] font-bold text-[11px] hover:bg-[#f3f4f6] cursor-pointer"
                            >
                              تعديل
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: My Listings */}
            {activeTab === 'my-listings' && (
              <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#14281d]">إعلاناتي ({myListings.length})</h3>
                    <p className="text-xs text-[#527963]">
                      إدارة الإعلانات التي قمت بعرضها، وتعديل الأسعار وحالة النشر.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAddListing}
                    className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] transition-colors cursor-pointer"
                  >
                    + إضافة إعلان جديد
                  </button>
                </div>

                {myListings.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-xs text-[#6b7280]">لم تقم بإضافة أي أراضٍ حتى الآن.</p>
                    <button
                      type="button"
                      onClick={onOpenAddListing}
                      className="px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] cursor-pointer"
                    >
                      + اعرض أول أرض لك
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#14281d]">{listing.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                listing.status === 'published'
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : listing.status === 'pending_approval'
                                  ? 'bg-[#fef9c3] text-[#854d0e]'
                                  : 'bg-[#fee2e2] text-[#dc2626]'
                              }`}
                            >
                              {listing.status === 'published'
                                ? 'منشور ✓'
                                : listing.status === 'pending_approval'
                                ? 'قيد المراجعة'
                                : 'متوقف مؤقتاً'}
                            </span>
                          </div>
                          <div className="text-[#527963] text-[11px]">
                            {listing.area} {listing.areaUnit} · {listing.governorate} ({listing.city}) ·{' '}
                            <strong className="text-[#166534] font-sans font-bold">{listing.price}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => onViewListingDetails(listing)}
                            className="px-3 py-1.5 rounded-lg bg-[#f0fdf4] text-[#166534] font-bold hover:bg-[#dcfce7] cursor-pointer"
                          >
                            معاينة
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditListing(listing)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#d1d5db] text-[#374151] font-bold hover:bg-[#f3f4f6] cursor-pointer"
                          >
                            تعديل السعر/البيانات
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleListingStatus(listing.id)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#d1d5db] text-[#374151] font-bold hover:bg-[#f3f4f6] cursor-pointer"
                            title={listing.status === 'published' ? 'إيقاف مؤقت' : 'تفعيل النشر'}
                          >
                            {listing.status === 'published' ? (
                              <Pause className="w-3.5 h-3.5 text-[#854d0e]" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-[#16a34a]" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteListing(listing.id)}
                            className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] cursor-pointer"
                            title="حذف الإعلان"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Favorites */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#14281d]">
                      الأراضي المحفوظة ({myFavoriteListings.length})
                    </h3>
                    <p className="text-xs text-[#527963]">
                      قائمة الأراضي والمزارع التي قمت بحفظها للرجوع إليها في أي وقت.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToLands}
                    className="text-xs text-[#166534] font-bold hover:underline cursor-pointer"
                  >
                    تصفح أراضٍ إضافية
                  </button>
                </div>

                {myFavoriteListings.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-xs text-[#6b7280]">لم تقم بحفظ أي أرض في المفضلة بعد.</p>
                    <button
                      type="button"
                      onClick={onNavigateToLands}
                      className="px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] cursor-pointer"
                    >
                      تصفح الأراضي المتاحة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myFavoriteListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-[#fcfdfc] p-4 rounded-xl border border-[#e2eae5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-[#14281d]">{listing.title}</h4>
                          <span className="text-[#527963] text-[11px]">
                            {listing.area} {listing.areaUnit} · {listing.governorate} ({listing.city}) ·{' '}
                            <strong className="text-[#166534] font-sans font-bold">{listing.price}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewListingDetails(listing)}
                            className="px-3 py-1.5 rounded-lg bg-[#f0fdf4] text-[#166534] font-bold hover:bg-[#dcfce7] cursor-pointer"
                          >
                            معاينة الأرض
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(listing.id)}
                            className="p-1.5 text-[#dc2626] hover:bg-[#fee2e2] rounded-lg cursor-pointer"
                            title="إزالة من المفضلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Price Drop Alerts */}
            {activeTab === 'alerts' && (
              <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-[#edf3ef] pb-3">
                  <h3 className="text-base font-black text-[#14281d]">
                    تنبيهات انخفاض الأسعار المفعّلة ({priceAlerts.length})
                  </h3>
                  <p className="text-xs text-[#527963]">
                    الأراضي التي قمت بتفعيل تنبيه لها؛ سيصلك إشعار فوري عند قيام المالك بخفض السعر.
                  </p>
                </div>

                <div className="space-y-3">
                  {priceAlerts.map((listingId) => {
                    const found = listings.find((l) => l.id === listingId);
                    if (!found) return null;
                    return (
                      <div
                        key={listingId}
                        className="bg-[#fcfdfc] p-4 rounded-xl border border-[#bbf7d0] flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-[#16a34a]" />
                            <h4 className="font-bold text-[#14281d]">{found.title}</h4>
                          </div>
                          <span className="text-[#527963] text-[11px] block">
                            السعر الحالي: <strong>{found.price}</strong> · {found.city}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onViewListingDetails(found)}
                          className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-bold text-xs hover:bg-[#14532d] cursor-pointer"
                        >
                          معاينة
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: Business Account Upgrade / Company Profile */}
            {activeTab === 'business' && (
              <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#16a34a]" />
                    <h3 className="text-base font-black text-[#14281d]">
                      {currentUser.role === 'company'
                        ? 'إدارة الحساب التجاري وملف الشركة'
                        : 'تحويل الحساب إلى حساب أعمال (مكتب أو شركة)'}
                    </h3>
                  </div>
                  <p className="text-xs text-[#527963] mt-1">
                    لو عندك مكتب تسويق أو شركة استثمار زراعي وتعرض أراضي كثيرة، فعّل حساب الأعمال لتظهر علامتك التجارية ومحافظات نشاطك.
                  </p>
                </div>

                <div className="bg-[#f0fdf4] p-3.5 rounded-xl border border-[#bbf7d0] text-xs text-[#166534] flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>تنويه التوثيق:</strong> تحويل الحساب إلى حساب أعمال لا يجعله موثقاً تلقائياً. يتم منح شارة 🔵 شركة موثقة بعد مراجعة السجل التجاري والبطاقة الضريبية من قبل الإدارة.
                  </span>
                </div>

                <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        اسم الشركة أو المكتب
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="مثال: شركة XYZ للتطوير الزراعي"
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        المحافظة الرئيسية
                      </label>
                      <select
                        value={companyGov}
                        onChange={(e) => setCompanyGov(e.target.value)}
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                      >
                        {egyptianGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        رقم هاتف العمل
                      </label>
                      <input
                        type="tel"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        رقم WhatsApp الرسمي
                      </label>
                      <input
                        type="tel"
                        value={companyWhatsapp}
                        onChange={(e) => setCompanyWhatsapp(e.target.value)}
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      نبذة عن الشركة ومجال عملها
                    </label>
                    <textarea
                      rows={3}
                      value={companyBio}
                      onChange={(e) => setCompanyBio(e.target.value)}
                      placeholder="اكتب نبذة تعريفية مختصرة عن خبرتكم في الأراضي والمزارع..."
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl p-3 text-xs outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        رقم السجل التجاري (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={commRegister}
                        onChange={(e) => setCommRegister(e.target.value)}
                        placeholder="س.ت: 48921"
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        رقم البطاقة الضريبية (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={taxCard}
                        onChange={(e) => setTaxCard(e.target.value)}
                        placeholder="ب.ض: 782-190"
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    حفظ وتفعيل الحساب التجاري ✓
                  </button>
                </form>
              </div>
            )}

            {/* TAB: Request Verification */}
            {activeTab === 'verification' && (
              <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
                    <h3 className="text-base font-black text-[#14281d]">
                      طلب توثيق الحساب (الحصول على الشارة المعتمدة 🔵)
                    </h3>
                  </div>
                  <p className="text-xs text-[#527963] mt-1">
                    التوثيق يمنح إعلاناتك أولوية في الظهور وثقة أعلى لدى المشترين والباحثين.
                  </p>
                </div>

                {/* Levels Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#fcfdfc] p-3 rounded-xl border border-[#e2eae5] space-y-1">
                    <span className="font-bold text-[#1d4ed8] block">🔵 حساب موثق (للأفراد والوكلاء):</span>
                    <p className="text-[11px] text-[#527963] leading-relaxed">
                      يتم التحقق من بطاقة الرقم القومي ورقم الموبايل وتوكيل أو تفويض المالك.
                    </p>
                  </div>
                  <div className="bg-[#fcfdfc] p-3 rounded-xl border border-[#e2eae5] space-y-1">
                    <span className="font-bold text-[#1d4ed8] block">🔵 شركة موثقة (للشركات والمكاتب):</span>
                    <p className="text-[11px] text-[#527963] leading-relaxed">
                      يتم التحقق من بيانات السجل التجاري والبطاقة الضريبية الرسمية.
                    </p>
                  </div>
                </div>

                {/* Scope Disclaimer */}
                <div className="bg-[#fefce8] p-3.5 rounded-xl border border-[#fef08a] text-xs text-[#854d0e] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ca8a04]" />
                  <span>
                    <strong>تنبيه قانوني هام:</strong> شارة التوثيق تعني مطابقة هوية المعلن وفق المستندات المرفوعة، ولا تمثل بأي حال من الأحوال ضماناً بأن كل أرض يعرضها الحساب خالية من أي نزاع قانوني مستقبلي.
                  </span>
                </div>

                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      المستند الأول (إثبات الهوية أو السجل التجاري)
                    </label>
                    <input
                      type="text"
                      value={docUpload1}
                      onChange={(e) => setDocUpload1(e.target.value)}
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      المستند الثاني (تفويض أو عقد ملكية أو بطاقة ضريبية)
                    </label>
                    <input
                      type="text"
                      value={docUpload2}
                      onChange={(e) => setDocUpload2(e.target.value)}
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      ملاحظات إضافية لإدارة المراجعة
                    </label>
                    <textarea
                      rows={3}
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="اذكر أي تفاصيل إضافية تدعم طلب توثيق حسابك..."
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl p-3 text-xs outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    إرسال طلب التوثيق للمراجعة 🛡️
                  </button>
                </form>
              </div>
            )}

            {/* TAB: Settings & Profile */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-[#e2eae5] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-[#edf3ef] pb-3">
                  <h3 className="text-base font-black text-[#14281d]">الملف الشخصي وإعدادات الحساب</h3>
                  <p className="text-xs text-[#527963]">
                    تحديث بياناتك الشخصية وبيانات التواصل الأساسية.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        الاسم بالكامل
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        رقم الموبايل المسجل (مؤكد بـ OTP)
                      </label>
                      <input
                        type="tel"
                        disabled
                        value={currentUser.phone}
                        className="w-full bg-[#f3f4f6] text-[#6b7280] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs font-sans cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        المحافظة
                      </label>
                      <select
                        value={profileGov}
                        onChange={(e) => setProfileGov(e.target.value)}
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                      >
                        {egyptianGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    حفظ التغييرات ✓
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
