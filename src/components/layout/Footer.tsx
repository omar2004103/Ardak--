import React from 'react';
import { Sprout, Phone, Mail, MapPin, ExternalLink, MessageCircle, LogIn, LogOut, User, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { ArdakLogo } from '../common/ArdakLogo.tsx';

interface FooterProps {
  onLoginClick?: () => void;
  onNavigate?: (route: 'home' | 'lands' | 'compare' | 'sold-deals' | 'my-listings' | 'favorites' | 'profile' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onLoginClick, onNavigate }) => {
  const { currentUser, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <footer className="bg-[#10271a] text-[#cfe1d5] pt-14 pb-8 border-t border-[#1b3d2b]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <ArdakLogo variant="footer" size="md" />
            </div>
            <p className="text-sm text-[#9eb4a5] leading-relaxed">
              منصة مصرية متخصصة للأراضي الزراعية والمزارع للبيع والإيجار. نربط أصحاب الأراضي والمستثمرين والمزارعين مباشرة وبكل شفافية.
            </p>

            {/* Quick Auth Status in Footer Brand Column */}
            <div className="pt-2">
              {currentUser ? (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#16a34a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                      <span className="text-[10px] text-[#86efac]">مسجل الدخول</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-red-800/40"
                    title="تسجيل الخروج من الحساب"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-[#22c55e]/30"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول / إنشاء حساب</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[#16a34a]">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm text-[#a8bcae]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('home') : window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white hover:translate-x-[-2px] transition-all inline-block cursor-pointer text-right"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('lands') : null}
                  className="hover:text-white hover:translate-x-[-2px] transition-all inline-block cursor-pointer text-right"
                >
                  البحث في الأراضي
                </button>
              </li>
              <li>
                <a href="#listings" className="hover:text-white hover:translate-x-[-2px] transition-all inline-block">
                  أحدث الأراضي المعروضة
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white hover:translate-x-[-2px] transition-all inline-block">
                  أنواع الأراضي والمزارع
                </a>
              </li>

              {/* Account Quick Links in Footer */}
              {currentUser ? (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('profile') : null}
                      className="hover:text-white hover:translate-x-[-2px] transition-all inline-flex items-center gap-1.5 cursor-pointer text-right text-[#86efac]"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>الملف الشخصي ولوحة التحكم</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('favorites') : null}
                      className="hover:text-white hover:translate-x-[-2px] transition-all inline-flex items-center gap-1.5 cursor-pointer text-right"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#f43f5e]" />
                      <span>المفضلة وتنبيهات الأسعار</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 hover:translate-x-[-2px] transition-all inline-flex items-center gap-1.5 cursor-pointer text-right font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج من الحساب</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="hover:text-white hover:translate-x-[-2px] transition-all inline-flex items-center gap-1.5 cursor-pointer text-right text-[#86efac] font-medium"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>تسجيل الدخول / إنشاء حساب</span>
                  </button>
                </li>
              )}

              {/* Mahsoulak Platform Highlight Link */}
              <li className="pt-2 border-t border-white/5">
                <a
                  href="https://mahsoulak.shop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#166534]/60 hover:bg-[#166534] text-[#86efac] hover:text-white transition-all font-bold text-xs border border-[#22c55e]/30 shadow-xs group"
                >
                  <span>منصة محصولك (سوق المحاصيل الزراعية) 🌾</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Information */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[#16a34a]">
              معلومات المنصة
            </h3>
            <ul className="space-y-2.5 text-sm text-[#a8bcae]">
              <li>
                <span className="text-[#8ba192]">نوع العمليات:</span> بيع وإيجار زراعي
              </li>
              <li>
                <span className="text-[#8ba192]">نطاق التغطية:</span> كافة محافظات جمهورية مصر العربية
              </li>
              <li>
                <span className="text-[#8ba192]">طرق السداد:</span> تواصل مباشر بدون عمولات خفية
              </li>
              <li>
                <span className="text-[#8ba192]">توثيق الملكية:</span> عقود مسجلة وحيازات زراعية
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[#16a34a]">
              تواصل معنا
            </h3>
            <ul className="space-y-3 text-sm text-[#a8bcae]">
              <li className="flex items-center gap-2.5 flex-wrap">
                <a
                  href="tel:01028200048"
                  className="flex items-center gap-2 hover:text-[#4ade80] transition-colors font-medium text-white group"
                  dir="ltr"
                  title="اتصال هاتفي مباشر"
                >
                  <Phone className="w-4 h-4 text-[#16a34a] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="font-sans font-semibold">01028200048</span>
                </a>
                <a
                  href="https://wa.me/201028200048"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#4ade80] hover:text-white border border-[#25D366]/40 text-xs font-bold transition-all shadow-xs"
                  title="محادثة واتساب مباشرة"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#16a34a] shrink-0" />
                <a
                  href="mailto:info@ardak.eg"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  info@ardak.eg
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>القاهرة - جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center text-xs text-[#8ba192] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 أرضك | Ardak. جميع الحقوق محفوظة.</p>
          <p className="text-[11px] text-[#6f8576]">
            سوق الأراضي والمزارع الزراعية في مصر
          </p>
        </div>
      </div>
    </footer>
  );
};
