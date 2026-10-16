import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Shield,
  User as UserIcon,
  Building,
  CheckCircle2,
  AlertCircle,
  Phone,
  Lock,
  MapPin,
  Smartphone,
  ArrowRight,
  Sparkles,
  Info,
  KeyRound,
  Mail,
  Loader2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole, AdvertiserType } from '../../types/listing.ts';
import { egyptianGovernorates } from '../../data/listings.ts';
import { isValidEgyptianPhone } from '../../lib/firebase.ts';
import { ArdakLogoIcon } from '../common/ArdakLogo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    currentUser,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    linkOrUpdateEmail,
    updateAccountPassword,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'settings'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Login form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState('البحيرة');
  const [password, setPassword] = useState('');
  // 4 Roles rule: Admin is strictly FORBIDDEN in registration!
  const [selectedRole, setSelectedRole] = useState<'user' | 'agent' | 'company'>('user');
  const [companyName, setCompanyName] = useState('');

  // Forgot password state
  const [forgotInput, setForgotInput] = useState('');

  // Account Settings state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Handle Login Submit (Direct Phone + Password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!loginPhone.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني.' });
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginPhone, loginPassword);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 800);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة ثانية.' });
    } finally {
      setLoading(false);
    }
  };

  // Direct Registration (Instant Account Activation - No OTP)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسمك بالكامل.' });
      return;
    }

    if (!phone || phone.length < 10 || !isValidEgyptianPhone(phone)) {
      setMessage({
        type: 'error',
        text: 'يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015).',
      });
      return;
    }

    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.' });
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        governorate,
        password: password.trim(),
        role: selectedRole,
        accountType:
          selectedRole === 'company'
            ? 'شركة عقارية'
            : selectedRole === 'agent'
            ? 'وسيط'
            : 'مالك',
        companyProfile:
          selectedRole === 'company'
            ? {
                companyName: companyName.trim() || name.trim(),
                phone: phone.trim(),
                whatsapp: phone.trim(),
                bio: `شركة استثمار وتسويق أراضي زراعية في محافظة ${governorate}`,
                governorate,
                operatingGovernorates: [governorate],
                listingsCount: 0,
              }
            : undefined,
      });

      if (res.success) {
        setMessage({ type: 'success', text: `تم إنشاء حسابك وتفعيله بنجاح! مرحباً بك يا ${name.trim()}.` });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 900);
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'تعذر إتمام التسجيل. يرجى التأكد من البيانات والمحاولة ثانية.' });
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-in Handler
  const handleGoogleSignIn = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1000);
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال رقم هاتفك أو بريدك الإلكتروني.' });
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(forgotInput);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
    } finally {
      setLoading(false);
    }
  };

  // Account Settings: Add Email
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'يرجى إدخال بريد إلكتروني صالح.' });
      return;
    }
    setLoading(true);
    try {
      const res = await linkOrUpdateEmail(newEmail);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
    } finally {
      setLoading(false);
    }
  };

  // Account Settings: Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' });
      return;
    }
    setLoading(true);
    try {
      const res = await updateAccountPassword(newPassword);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
      setNewPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#f7f9f8] p-1 flex items-center justify-center border border-[#e2eae5] shrink-0 shadow-2xs">
              <ArdakLogoIcon className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#14281d]">
                {mode === 'login'
                  ? 'تسجيل الدخول إلى أرضك'
                  : mode === 'register'
                  ? 'إنشاء حساب جديد على أرضك'
                  : mode === 'forgot'
                  ? 'استعادة كلمة المرور'
                  : 'إعدادات وأمان الحساب'}
              </h2>
              <p className="text-[11px] text-[#527963]">
                {mode === 'login'
                  ? 'سجل دخولك برقم الموبايل وكلمة المرور'
                  : mode === 'register'
                  ? 'أدخل بياناتك للتسجيل والتفعيل الفوري لحسابك'
                  : mode === 'forgot'
                  ? 'استرجع حسابك بأمان عبر البريد أو الهاتف'
                  : 'تأكيد البريد الإلكتروني وتحديث كلمة المرور'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 p-1 bg-[#f3f6f4] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-[#6b7280] hover:text-[#14281d]'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-[#6b7280] hover:text-[#14281d]'
              }`}
            >
              حساب جديد
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMode('settings');
                  setMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'settings'
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-[#6b7280] hover:text-[#14281d]'
                }`}
              >
                إعدادات الحساب
              </button>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className="px-6 pt-4">
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                  : 'bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16a34a]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  رقم الموبايل أو البريد
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="01012345671 أو البريد"
                    className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2.5 text-xs outline-hidden font-sans font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#374151]">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotInput(loginPhone);
                      setMessage(null);
                    }}
                    className="text-[11px] font-bold text-[#166534] hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2.5 text-xs outline-hidden font-sans font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>تسجيل الدخول الآن</span>
              </button>

              {/* Google Sign-in Divider & Button */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2eae5]"></div>
                </div>
                <span className="relative bg-white px-3 text-[11px] text-[#6b7280]">
                  أو الدخول بضغطة واحدة
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#f9fafb] border border-[#d1d5db] text-[#374151] font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>الدخول السريع بحساب Google</span>
              </button>
            </form>
          ) : mode === 'register' ? (
            /* DIRECT INSTANT REGISTER FORM (NO OTP) */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  الاسم بالكامل (أو اسم المعلن)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمود عبد الله"
                  className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2 text-xs outline-hidden"
                />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#374151]">
                    رقم الموبايل المصري
                  </label>
                  <span className="text-[10px] text-[#166534] font-bold">
                    تفعيل فوري ودخول مباشر ✓
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2 text-xs outline-hidden font-sans font-medium"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  كلمة المرور (مشفرة بأمان)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 خانات أو أرقام على الأقل"
                    className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2 text-xs outline-hidden font-sans"
                  />
                </div>
              </div>

              {/* Governorate */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  المحافظة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                >
                  {egyptianGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  نوع الحساب والنشاط على المنصة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('user')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'user'
                        ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] ring-1 ring-[#166534]'
                        : 'bg-white border-[#e2eae5] text-[#374151] hover:bg-[#f9fafb]'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mx-auto mb-1 text-[#16a34a]" />
                    <span className="block text-xs font-bold">👤 مستخدم</span>
                    <span className="text-[10px] text-[#6b7280] block">مشتري/بائع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('agent')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'agent'
                        ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] ring-1 ring-[#166534]'
                        : 'bg-white border-[#e2eae5] text-[#374151] hover:bg-[#f9fafb]'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-1 text-[#0284c7]" />
                    <span className="block text-xs font-bold">🏢 وكيل</span>
                    <span className="text-[10px] text-[#6b7280] block">مسوق نيابة عن ملاك</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('company')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'company'
                        ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] ring-1 ring-[#166534]'
                        : 'bg-white border-[#e2eae5] text-[#374151] hover:bg-[#f9fafb]'
                    }`}
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-[#854d0e]" />
                    <span className="block text-xs font-bold">🏗️ شركة</span>
                    <span className="text-[10px] text-[#6b7280] block">شركة عقارية/زراعية</span>
                  </button>
                </div>
              </div>

              {/* Company Profile input if company role selected */}
              {selectedRole === 'company' && (
                <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] space-y-2">
                  <label className="block text-xs font-bold text-[#166534]">
                    اسم الشركة التجاري
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="مثال: شركة النيل للتنمية الزراعية"
                    className="w-full bg-white border border-[#86efac] focus:border-[#166534] rounded-xl px-3 py-1.5 text-xs outline-hidden"
                  />
                </div>
              )}

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2 text-xs outline-hidden font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>إنشاء الحساب والدخول مباشرة ✓</span>
              </button>
            </form>
          ) : mode === 'forgot' ? (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  رقم الموبايل أو البريد المسجل
                </label>
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="01012345678 أو example@email.com"
                  className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3.5 py-2.5 text-xs outline-hidden font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>إرسال رابط / رمز استعادة الحساب</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs font-bold text-[#6b7280] hover:text-[#166534] pt-1 block cursor-pointer"
              >
                العودة لصفحة تسجيل الدخول
              </button>
            </form>
          ) : (
            /* ACCOUNT SETTINGS FORM */
            <div className="space-y-5">
              <div className="p-3.5 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] space-y-1">
                <span className="text-xs font-bold text-[#166534] block">
                  الحساب الحالي: {currentUser?.name}
                </span>
                <span className="text-[11px] text-[#527963] block font-sans">
                  الهاتف: {currentUser?.phone} · الرتبة: {currentUser?.role}
                </span>
                {currentUser?.email && (
                  <span className="text-[11px] text-[#527963] block font-sans">
                    البريد: {currentUser.email} {currentUser.emailVerified ? '✓ موثق' : '(قيد التأكيد)'}
                  </span>
                )}
              </div>

              {/* Add / Verify Email */}
              <form onSubmit={handleSaveEmail} className="space-y-2 border-t border-[#edf3ef] pt-3">
                <label className="block text-xs font-bold text-[#374151]">
                  إضافة أو تأكيد البريد الإلكتروني
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="flex-1 bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden font-sans"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] cursor-pointer shrink-0"
                  >
                    حفظ وتأكيد
                  </button>
                </div>
              </form>

              {/* Update Password */}
              <form onSubmit={handleUpdatePassword} className="space-y-2 border-t border-[#edf3ef] pt-3">
                <label className="block text-xs font-bold text-[#374151]">
                  تحديث كلمة المرور
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="كلمة مرور جديدة (6 خانات+)"
                    className="flex-1 bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden font-sans"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] cursor-pointer shrink-0"
                  >
                    تحديث
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
