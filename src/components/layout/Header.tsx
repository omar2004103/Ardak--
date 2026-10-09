import React, { useState } from 'react';
import {
  Sprout,
  Menu,
  X,
  PlusCircle,
  Search,
  Home,
  LogIn,
  Heart,
  Shield,
  Layers,
  User as UserIcon,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/listing.ts';

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
  const { currentUser, favorites, switchDemoUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (route: AppRoute) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <>
      {/* Top utility bar with quick persona switch */}
      <div className="bg-[#14532d] text-[#e2f0e6] text-xs py-1.5 px-4" dir="rtl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span className="truncate">سوق الأراضي والمزارع في مصر (نسخة الـMVP المعتمدة)</span>
          </div>

          {/* Quick Demo Switcher in Top Bar */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-white/60 hidden sm:inline">تبديل الدور:</span>
            <button
              type="button"
              onClick={() => switchDemoUser('owner')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                currentUser?.role === 'owner'
                  ? 'bg-white text-[#166534] font-bold'
                  : 'text-white/80 hover:bg-white/10'
              }`}
              title="دخول كمالك أرض"
            >
              مالك أرض
            </button>
            <button
              type="button"
              onClick={() => switchDemoUser('user')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                currentUser?.role === 'user'
                  ? 'bg-white text-[#166534] font-bold'
                  : 'text-white/80 hover:bg-white/10'
              }`}
              title="دخول كمشتري"
            >
              مشتري
            </button>
            <button
              type="button"
              onClick={() => switchDemoUser('admin')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                currentUser?.role === 'admin'
                  ? 'bg-white text-[#dc2626] font-bold'
                  : 'text-white/80 hover:bg-white/10'
              }`}
              title="دخول كمشرف (Admin)"
            >
              مشرف أدمن
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2eae5] shadow-xs" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-3 group focus:outline-hidden cursor-pointer text-right"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#166534] to-[#16a34a] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#166534]">
                    Ardak
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#14281d]">
                    | أرضك
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-[#527963] font-medium leading-none">
                  سوق الأراضي والمزارع الزراعية
                </span>
              </div>
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
                <button
                  type="button"
                  onClick={() => handleNavigate('profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e2eae5] hover:border-[#166534] bg-white transition-colors cursor-pointer text-right"
                  title="الملف الشخصي"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center font-bold text-xs">
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
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-xs font-bold text-[#166534] hover:bg-[#f0fdf4] px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
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

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e2eae5] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200 text-right">
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
              <span>البحث عن أرض</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('compare')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'compare' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <Scale className="w-4 h-4 text-[#16a34a]" />
              <span>قارن الأراضي ⚖️</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('sold-deals')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'sold-deals' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#16a34a]" />
              <span>مؤشر الصفقات المنفذة</span>
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

            <button
              type="button"
              onClick={() => handleNavigate('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-right transition-colors cursor-pointer ${
                currentRoute === 'profile' ? 'text-[#166534] bg-[#f0fdf4]' : 'text-[#374151]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>الملف الشخصي ({currentUser?.name || 'زائر'})</span>
            </button>

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
