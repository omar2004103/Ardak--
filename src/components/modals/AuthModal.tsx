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
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole, AdvertiserType } from '../../types/listing.ts';
import { egyptianGovernorates } from '../../data/listings.ts';

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
  const { login, register, switchDemoUser } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Register form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('البحيرة');
  const [password, setPassword] = useState('');
  // 4 Roles rule: Admin is strictly FORBIDDEN in registration!
  const [selectedRole, setSelectedRole] = useState<'user' | 'agent' | 'company'>('user');

  // Company specific optional fields if company role chosen
  const [companyName, setCompanyName] = useState('');

  // OTP Step in Registration
  const [regStep, setRegStep] = useState<'details' | 'otp'>('details');
  const [otpCode, setOtpCode] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (loginMethod === 'otp' && !loginOtpSent) {
      if (!loginPhone || loginPhone.length < 10) {
        setMessage({ type: 'error', text: 'يرجى إدخال رقم هاتف صحيح.' });
        return;
      }
      setLoginOtpSent(true);
      setLoginOtpCode('7291'); // Auto simulation
      setMessage({ type: 'success', text: 'تم إرسال كود التحقق OTP إلى هاتفك عبر WhatsApp/SMS.' });
      return;
    }

    const result = login(loginPhone, loginMethod === 'otp' ? loginOtpCode : loginPassword);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  // Step 1: Submit Details & Request OTP
  const handleRequestRegOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم المستخدم أو اسم المسؤول.' });
      return;
    }
    if (!phone || phone.length < 10) {
      setMessage({ type: 'error', text: 'يرجى إدخال رقم هاتف مصري صالح (مثال: 01012345678).' });
      return;
    }

    // Move to OTP confirmation step
    setRegStep('otp');
    setOtpCode('4826'); // Simulated Egyptian OTP code
    setMessage({
      type: 'success',
      text: `تم إرسال رمز التحقق OTP إلى الرقم ${phone} عبر WhatsApp / رسالة نصية.`,
    });
  };

  // Step 2: Confirm OTP & Finalize Registration
  const handleConfirmOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!otpCode || otpCode.length < 4) {
      setMessage({ type: 'error', text: 'يرجى إدخال كود التحقق المكون من 4 أرقام.' });
      return;
    }

    const result = register({
      name,
      phone,
      governorate,
      password,
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
              companyName: companyName.trim() || name,
              phone,
              whatsapp: phone,
              bio: `شركة استثمار وتسويق أراضي زراعية في محافظة ${governorate}`,
              governorate,
              operatingGovernorates: [governorate],
              listingsCount: 0,
            }
          : undefined,
    });

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1200);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleQuickDemoSwitch = (role: UserRole) => {
    switchDemoUser(role);
    setMessage({
      type: 'success',
      text: `تم تسجيل الدخول السريع كـ: ${
        role === 'admin'
          ? '🛡️ إدارة المنصة (أدمن بصلاحية خاصة)'
          : role === 'company'
          ? '🏗️ شركة زراعية معتمدة (37 إعلاناً)'
          : role === 'agent'
          ? '🏢 وكيل/مسوق عقاري'
          : '👤 مستخدم عادي (أحمد محمود)'
      }`,
    });
    setTimeout(() => {
      onClose();
      setMessage(null);
    }, 900);
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
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center border border-[#bbf7d0]">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-[#14281d]">
                {mode === 'login' ? 'تسجيل الدخول إلى أرضك' : 'إنشاء حساب جديد على أرضك'}
              </h2>
              <p className="text-[11px] text-[#527963]">
                {mode === 'login'
                  ? 'سجل دخولك برقم الموبايل أو كود التحقق OTP'
                  : 'أدخل بياناتك وسيتم تأكيد رقم الموبايل عبر OTP'}
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
          <div className="grid grid-cols-2 p-1 bg-[#f3f6f4] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
                setRegStep('details');
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
                setRegStep('details');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-[#6b7280] hover:text-[#14281d]'
              }`}
            >
              حساب جديد
            </button>
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
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
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
                  رقم الموبايل
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="01012345671"
                    className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2.5 text-xs outline-hidden font-sans font-medium"
                  />
                </div>
              </div>

              {/* Login Method Toggle: Password vs OTP */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6b7280]">طريقة تسجيل الدخول:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('password');
                      setLoginOtpSent(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      loginMethod === 'password'
                        ? 'bg-[#166534] text-white'
                        : 'bg-[#f3f4f6] text-[#6b7280]'
                    }`}
                  >
                    كلمة المرور
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      loginMethod === 'otp'
                        ? 'bg-[#166534] text-white'
                        : 'bg-[#f3f4f6] text-[#6b7280]'
                    }`}
                  >
                    كود الهاتف OTP
                  </button>
                </div>
              </div>

              {loginMethod === 'password' ? (
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9ca3af] absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl pr-10 pl-3 py-2.5 text-xs outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#374151]">
                    كود التحقق السريع OTP
                  </label>
                  {loginOtpSent ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={loginOtpCode}
                        onChange={(e) => setLoginOtpCode(e.target.value)}
                        placeholder="7291"
                        className="w-full text-center tracking-widest text-lg font-bold bg-[#fcfdfc] border border-[#166534] rounded-xl py-2 font-sans"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#527963] bg-[#f0fdf4] p-2.5 rounded-xl border border-[#bbf7d0]">
                      سنرسل كود تحقق فوري مكون من 4 أرقام لهاتفك.
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {loginMethod === 'otp' && !loginOtpSent ? 'إرسال كود OTP' : 'تسجيل الدخول'}
              </button>
            </form>
          ) : (
            /* REGISTER FLOW WITH OTP */
            <div className="space-y-4">
              {regStep === 'details' ? (
                <form onSubmit={handleRequestRegOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: أحمد محمود"
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1">
                        رقم الموبايل (واتساب)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden font-sans font-medium"
                      />
                    </div>

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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#fcfdfc] border border-[#d1d5db] focus:border-[#166534] rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  {/* 4 Roles Selection: Strictly NO ADMIN in registration! */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-[#14281d]">
                      نوع الحساب الاختياري:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('user')}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedRole === 'user'
                            ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] shadow-2xs'
                            : 'bg-white border-[#e2eae5] text-[#374151]'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-xs mb-0.5">
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>👤 مستخدم</span>
                        </div>
                        <span className="text-[10px] text-[#6b7280] block leading-tight">
                          مشتري/باحث، ويمكنه عرض أرضه
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('agent')}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedRole === 'agent'
                            ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] shadow-2xs'
                            : 'bg-white border-[#e2eae5] text-[#374151]'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-xs mb-0.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>🏢 وكيل/مسوق</span>
                        </div>
                        <span className="text-[10px] text-[#6b7280] block leading-tight">
                          يعرض أراضي نيابة عن الملاك
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('company')}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedRole === 'company'
                            ? 'bg-[#f0fdf4] border-[#166534] text-[#166534] shadow-2xs'
                            : 'bg-white border-[#e2eae5] text-[#374151]'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-xs mb-0.5">
                          <Shield className="w-3.5 h-3.5" />
                          <span>🏗️ شركة</span>
                        </div>
                        <span className="text-[10px] text-[#6b7280] block leading-tight">
                          شركة عقارية أو زراعية
                        </span>
                      </button>
                    </div>

                    {selectedRole === 'company' && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-[#374151] mb-1">
                          اسم الشركة أو المكتب العقاري
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="مثال: شركة النيل للاستثمار الزراعي"
                          className="w-full bg-[#fcfdfc] border border-[#d1d5db] rounded-xl px-3 py-2 text-xs outline-hidden"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer mt-3"
                  >
                    تأكيد رقم الموبايل والمتابعة →
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Confirmation */
                <form onSubmit={handleConfirmOtpAndRegister} className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto border border-[#bbf7d0]">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#14281d]">
                      تأكيد رقم الموبايل عبر رمز OTP
                    </h3>
                    <p className="text-xs text-[#527963] mt-1">
                      تم إرسال كود التأكيد المكون من 4 أرقام عبر SMS / WhatsApp إلى الرقم:{' '}
                      <strong className="text-[#14281d] font-sans">{phone}</strong>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="4826"
                      className="w-48 mx-auto text-center tracking-widest text-2xl font-black bg-[#fcfdfc] border-2 border-[#166534] rounded-xl py-2.5 font-sans outline-hidden"
                    />
                    <span className="text-[10px] text-[#6b7280] block mt-1">
                      (رمز التحقق التجريبي الجاهز: 4826)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRegStep('details')}
                      className="flex-1 py-2 rounded-xl bg-white border border-[#d1d5db] text-[#374151] font-bold text-xs hover:bg-[#f3f4f6] cursor-pointer"
                    >
                      تعديل البيانات
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      تأكيد وإنشاء الحساب ✓
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Switcher (Testing all 4 roles) */}
          <div className="pt-4 border-t border-[#edf3ef] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6b7280] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>تجربة الأدوار الأربعة المقترحة (بنقرة واحدة):</span>
              </span>
              <span className="text-[10px] text-[#15803d] font-semibold bg-[#f0fdf4] px-2 py-0.5 rounded">
                للاختبار والمراجعة
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('user')}
                className="p-2 rounded-xl bg-[#f9fbf9] hover:bg-[#f0fdf4] border border-[#e2eae5] text-right text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-[#14281d] block">👤 مستخدم User</span>
                <span className="text-[10px] text-[#6b7280]">أحمد محمود (مشتري/بائع)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('agent')}
                className="p-2 rounded-xl bg-[#f9fbf9] hover:bg-[#f0fdf4] border border-[#e2eae5] text-right text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-[#14281d] block">🏢 وكيل/مسوق Agent</span>
                <span className="text-[10px] text-[#6b7280]">سامي التميمي (وسيط زراعي)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('company')}
                className="p-2 rounded-xl bg-[#f9fbf9] hover:bg-[#f0fdf4] border border-[#e2eae5] text-right text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-[#14281d] block">🏗️ شركة Company</span>
                <span className="text-[10px] text-[#6b7280]">شركة النيل (37 إعلاناً)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('admin')}
                className="p-2 rounded-xl bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#86efac] text-right text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-[#166534] block">🛡️ Admin (مشرف عام)</span>
                <span className="text-[10px] text-[#15803d]">م. عادل (صلاحية خاصة بالنظام)</span>
              </button>
            </div>

            <div className="text-[10px] text-[#6b7280] flex items-center gap-1.5 bg-[#fcfdfc] p-2 rounded-lg border border-[#edf3ef]">
              <Info className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
              <span>
                <strong>قاعدة الأمان:</strong> خيار Admin غير متاح في التسجيل ويُمنح فقط من النظام وقاعدة البيانات.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
