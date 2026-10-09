import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  Home,
  Heart,
  Save,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { UserRole, AdvertiserType } from '../../types/listing.ts';

interface ProfilePageProps {
  onNavigate: (route: 'home' | 'lands' | 'my-listings' | 'favorites' | 'admin') => void;
  onOpenLogin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { currentUser, updateProfile, switchDemoUser, logout } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [accountType, setAccountType] = useState<AdvertiserType>(currentUser?.accountType || 'مالك');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-16 bg-[#f7f9f8] min-h-[60vh] flex items-center justify-center text-right" dir="rtl">
        <div className="bg-white p-8 rounded-2xl border border-[#e2eae5] text-center max-w-md w-full shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#14281d]">يرجى تسجيل الدخول أولاً</h2>
          <p className="text-xs text-[#527963]">
            قم بتسجيل الدخول إلى حسابك لعرض وتعديل ملفك الشخصي وإدارة إعلاناتك.
          </p>
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            تسجيل الدخول / إنشاء حساب
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || currentUser.name,
      phone: phone.trim() || currentUser.phone,
      email: email.trim() || currentUser.email,
      accountType,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const roleLabel =
    currentUser.role === 'admin'
      ? 'مشرف عام (Admin)'
      : currentUser.role === 'owner'
      ? 'مالك أرض / معلن'
      : 'مشتري / باحث عن أرض';

  return (
    <div className="py-8 sm:py-12 bg-[#f7f9f8] min-h-screen text-right" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="mb-4">
          <ol className="flex items-center gap-2 text-xs text-[#527963]">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hover:text-[#166534] font-medium transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
            </li>
            <li>
              <ChevronLeft className="w-3.5 h-3.5 text-[#9ca3af]" />
            </li>
            <li className="text-[#14281d] font-bold">الملف الشخصي</li>
          </ol>
        </nav>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] p-6 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#166534] to-[#15803d] text-white flex items-center justify-center text-2xl font-black shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#14281d]">
                    {currentUser.name}
                  </h1>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]'
                        : currentUser.role === 'owner'
                        ? 'bg-[#dcfce7] text-[#166534] border border-[#86efac]'
                        : 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#527963] mt-1.5 font-sans">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span dir="ltr">{currentUser.phone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>{currentUser.email}</span>
                  </span>
                  <span className="flex items-center gap-1 hidden md:flex">
                    <Calendar className="w-3.5 h-3.5 text-[#9ca3af]" />
                    <span>عضو منذ: {currentUser.joinedAt}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#dc2626] hover:bg-[#fee2e2]/40 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Quick Testing Switcher Card */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#166534] mb-2">
            <RefreshCw className="w-4 h-4 text-[#16a34a]" />
            <span>التبديل السريع بين الأدوار لاختبار وظائف المنصة:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                switchDemoUser('owner');
                setName('الحاج محمود عبد الله');
                setPhone('01012345671');
                setEmail('mahmoud@ardak.eg');
              }}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                currentUser.role === 'owner'
                  ? 'bg-white border-[#166534] shadow-xs ring-2 ring-[#166534]/30'
                  : 'bg-white/80 border-[#d1d5db] hover:bg-white'
              }`}
            >
              <span className="text-xs font-bold text-[#14281d] block">🏡 دور مالك الأرض</span>
              <span className="text-[11px] text-[#527963] block mt-0.5">
                إضافة أرض، تعديل، حذف، وإيقاف النشر
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                switchDemoUser('user');
                setName('المهندس أحمد سمير');
                setPhone('01098765432');
                setEmail('ahmed@ardak.eg');
              }}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                currentUser.role === 'user'
                  ? 'bg-white border-[#0284c7] shadow-xs ring-2 ring-[#0284c7]/30'
                  : 'bg-white/80 border-[#d1d5db] hover:bg-white'
              }`}
            >
              <span className="text-xs font-bold text-[#14281d] block">🔎 دور المشتري</span>
              <span className="text-[11px] text-[#527963] block mt-0.5">
                البحث، حفظ المفضلة، والمقارنة
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                switchDemoUser('admin');
                setName('إدارة المنصة (المشرف العام)');
                setPhone('01000000000');
                setEmail('admin@ardak.eg');
              }}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                currentUser.role === 'admin'
                  ? 'bg-white border-[#dc2626] shadow-xs ring-2 ring-[#dc2626]/30'
                  : 'bg-white/80 border-[#d1d5db] hover:bg-white'
              }`}
            >
              <span className="text-xs font-bold text-[#14281d] block">🛠️ دور الإدارة (Admin)</span>
              <span className="text-[11px] text-[#527963] block mt-0.5">
                قبول ورفض الإعلانات، المستخدمين والبلاغات
              </span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => onNavigate('my-listings')}
            className="p-4 bg-white rounded-xl border border-[#e2eae5] hover:border-[#166534] transition-colors text-right shadow-xs cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#14281d]">إعلاناتي ومعروضاتي</h3>
            <span className="text-[10px] text-[#527963]">إدارة أراضيك وتعديلها</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('favorites')}
            className="p-4 bg-white rounded-xl border border-[#e2eae5] hover:border-[#e11d48] transition-colors text-right shadow-xs cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#fee2e2] text-[#e11d48] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#14281d]">الأراضي المفضلة</h3>
            <span className="text-[10px] text-[#527963]">قائمتك المحفوظة</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="p-4 bg-white rounded-xl border border-[#fee2e2] hover:border-[#dc2626] transition-colors text-right shadow-xs cursor-pointer group col-span-2 sm:col-span-1"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#14281d]">لوحة الإدارة والمراجعة</h3>
              <span className="text-[10px] text-[#527963]">اعتماد ورفض الإعلانات والبلاغات</span>
            </button>
          )}
        </div>

        {/* Profile Edit Form */}
        <div className="bg-white rounded-2xl border border-[#e2eae5] p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#14281d] border-b border-[#edf3ef] pb-3 mb-4 flex items-center justify-between">
            <span>تعديل بيانات الحساب ورقم الهاتف</span>
            {savedSuccess && (
              <span className="text-xs text-[#16a34a] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم الحفظ بنجاح</span>
              </span>
            )}
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  الاسم بالكامل
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2.5 text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  رقم الهاتف المحمول (لتواصل المشترين)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2.5 text-xs outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2.5 text-xs outline-hidden"
                />
              </div>

              {/* Account Type Selector: مالك، وسيط، شركة عقارية */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  نوع الحساب والصفة المهنية:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('مالك')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      accountType === 'مالك'
                        ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] ring-2 ring-[#166534]/30 shadow-xs'
                        : 'border-[#d1d5db] text-[#4b6354] hover:bg-[#f9fbf9]'
                    }`}
                  >
                    🏡 مالك
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('وسيط')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      accountType === 'وسيط'
                        ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] ring-2 ring-[#166534]/30 shadow-xs'
                        : 'border-[#d1d5db] text-[#4b6354] hover:bg-[#f9fbf9]'
                    }`}
                  >
                    🤝 وسيط
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('شركة عقارية')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      accountType === 'شركة عقارية'
                        ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] ring-2 ring-[#166534]/30 shadow-xs'
                        : 'border-[#d1d5db] text-[#4b6354] hover:bg-[#f9fbf9]'
                    }`}
                  >
                    🏢 شركة عقارية
                  </button>
                </div>
                <span className="text-[11px] text-[#527963] mt-1 block">
                  تظهر هذه الشارة بجوار اسمك على جميع إعلاناتك لتعزيز ثقة المشترين.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
