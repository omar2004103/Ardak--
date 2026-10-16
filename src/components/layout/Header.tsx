import React, { useState } from 'react';
import {
  Sprout,
  Menu,
  X,
  PlusCircle,
  Search,
  Home,
  LogIn,
  LogOut,
  Heart,
  Shield,
  Layers,
  User as UserIcon,
  TrendingUp,
  Scale,
  Phone,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { ArdakLogo } from '../common/ArdakLogo.tsx';

export type AppRoute =
  | 'home'
  | 'lands'
  | 'compare'
  | 'sold-deals'
  | 'my-listings'
  | 'favorites'
  | 'profile'
  | 'admin';

interface HeaderProps {
  currentRoute?: AppRoute;
  onNavigate?: (route: AppRoute) => void;
  onAddListingClick?: () => void;
  onLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute = 'home',
  onNavigate,
  onAddListingClick,
  onLoginClick,
}) => {
  const { currentUser, favorites, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (route: AppRoute) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(route);
    }
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <>
      {/* Real Platform Utility Bar */}
      <div className="bg-[#14532d] text-[#e2f0e6] text-xs py-2 px-4 border-b border-[#166534]" dir="rtl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
              <span className="font-semibold text-white truncate text-[11px] sm:text-xs">
                المنصة الأولى للأراضي والمزارع في مصر
              </span>
            </div>
            <a
              href="https://mahsoulak.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#166534] hover:bg-[#15803d] text-[#86efac] hover:text-white transition-all text-[11px] font-bold border border-[#22c55e]/30 shadow-2xs"
            >
              <span>منصة محصولك (سوق المحاصيل) 🌾</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Quick Direct Contact & Hotline */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
            <a
              href="tel:01028200048"
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white font-medium hover:underline transition-colors"
              dir="ltr"
              title="اتصال مباشر بالدعم الفني والمبيعات"
            >
              <Phone className="w-3.5 h-3.5 text-[#4ade80]" />
              <span className="font-sans font-bold text-xs">01028200048</span>
            </a>
            <span className="text-white/30 hidden sm:inline">|</span>
            <a
              href="https://wa.me/201028200048"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#25D366]/20 hover:bg-[#25D366] text-[#4ade80] hover:text-white transition-colors border border-[#25D366]/40 font-bold"
              title="محادثة واتساب سريعة"
            >
              <MessageCircle className="w-3 h-3" />
              <span>واتساب</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2eae5] shadow-xs" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Official Brand Logo */}
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="flex items-center group focus:outline-hidden cursor-pointer text-right transition-opacity hover:opacity-95"
              title="أرضك - الصفحة الرئيسية"
            >
              <ArdakLogo variant="horizontal" size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-semibold text-[#374151]">
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer ${
                  currentRoute === 'home'
                    ? 'text-[#166534] border-[#166534]'
                    : 'text-[#4b6354] hover:text-[#166534] border-transparent hover:border-[#166534]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('lands')}
                className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer ${
                  currentRoute === 'lands'
                    ? 'text-[#166534] border-[#166534]'
                    : 'text-[#4b6354] hover:text-[#166534] border-transparent hover:border-[#166534]'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>البحث عن أرض</span>
              </button>

              {/* Compare Lands ⚖️ */}
              <button
                type="button"
                onClick={() => handleNavigate('compare')}
                className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer ${
                  currentRoute === 'compare'
                    ? 'text-[#166534] border-[#166534]'
                    : 'text-[#4b6354] hover:text-[#166534] border-transparent hover:border-[#166534]'
                }`}
              >
                <Scale className="w-4 h-4 text-[#16a34a]" />
                <span>قارن الأراضي</span>
              </button>

              {/* Sold Deals Market Benchmark */}
              <button
                type="button"
                onClick={() => handleNavigate('sold-deals')}
                className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer ${
                  currentRoute === 'sold-deals'
                    ? 'text-[#166534] border-[#166534]'
                    : 'text-[#4b6354] hover:text-[#166534] border-transparent hover:border-[#166534]'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#16a34a]" />
                <span>مؤشر الصفقات</span>
              </button>

              {/* My Listings (Owner / Admin) */}
              <button
                type="button"
                onClick={() => handleNavigate('my-listings')}
                className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer ${
                  currentRoute === 'my-listings'
                    ? 'text-[#166534] border-[#166534]'
                    : 'text-[#4b6354] hover:text-[#166534] border-transparent hover:border-[#166534]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>إعلاناتي</span>
              </button>

              {/* Favorites */}
              <button
                type="button"
                onClick={() => handleNavigate('favorites')}
                className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer ${
                  currentRoute === 'favorites'
                    ? 'text-[#166534] border-[#166534]'
                    : 'text-[#4b6354] hover:text-[#166534] border-transparent hover:border-[#166534]'
                }`}
              >
                <Heart className="w-4 h-4 text-[#e11d48]" />
                <span>المفضلة</span>
                {favorites.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white text-[10px] flex items-center justify-center font-sans font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Admin Link if role is admin */}
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleNavigate('admin')}
                  className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 cursor-pointer font-bold ${
                    currentRoute === 'admin'
                      ? 'text-[#dc2626] border-[#dc2626]'
                      : 'text-[#dc2626] hover:text-[#b91c1c] border-transparent hover:border-[#dc2626]'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>لوحة الإدارة</span>
                </button>
              )}
            </nav>

            {/* Profile / Login Button & Add Listing */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate('profile')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e2eae5] hover:border-[#166534] bg-white transition-colors cursor-pointer text-right group"
                    title="الملف الشخصي"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center font-bold text-xs group-hover:bg-[#166534] group-hover:text-white transition-colors">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs font-bold text-[#14281d] block leading-none">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-[#527963] leading-none">
                        {currentUser.role === 'admin'
                          ? 'مشرف'
                          : currentUser.role === 'owner'
                          ? 'مالك'
                          : 'مشتري'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-transparent hover:border-[#fee2e2] text-[#dc2626] hover:bg-[#fee2e2]/40 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="تسجيل الخروج من الحساب"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-xs font-bold text-[#166534] hover:bg-[#f0fdf4] px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-[#166534]/20 shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>دخول / تسجيل</span>
                </button>
              )}

              <button
                type="button"
                onClick={onAddListingClick}
                className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ أضف أرضك</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#374151] hover:text-[#166534] hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                aria-label="القائمة الرئيسية"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#e2eae5] px-4 pt-3 pb-6 space-y-2 text-right">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'home' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('lands')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'lands' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>البحث في الأراضي</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('compare')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'compare' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <Scale className="w-4 h-4 text-[#16a34a]" />
              <span>مقارنة الأراضي</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('sold-deals')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'sold-deals' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#16a34a]" />
              <span>مؤشر الصفقات الزراعية</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('my-listings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'my-listings' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>إعلاناتي ومعروضاتي</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'favorites' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#e11d48]" />
                <span>المفضلة</span>
              </div>
              {favorites.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#e11d48] font-bold text-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate('profile')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                    currentRoute === 'profile' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>الملف الشخصي ({currentUser.name})</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer text-[#dc2626] hover:bg-[#fee2e2]/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm text-right transition-colors cursor-pointer text-[#166534] bg-[#f0fdf4]"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => handleNavigate('admin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer text-[#dc2626] ${
                  currentRoute === 'admin' ? 'bg-[#fee2e2]/60' : ''
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>لوحة التحكم الإدارية (Admin)</span>
              </button>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onAddListingClick) onAddListingClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#166534] text-white font-bold text-sm shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ أضف أرضك الآن</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
