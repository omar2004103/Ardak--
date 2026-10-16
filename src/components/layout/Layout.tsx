import React from 'react';
import { Header, AppRoute } from './Header.tsx';
import { Footer } from './Footer.tsx';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute?: AppRoute;
  onNavigate?: (route: AppRoute) => void;
  onAddListingClick?: () => void;
  onLoginClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentRoute = 'home',
  onNavigate,
  onAddListingClick,
  onLoginClick,
}) => {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen flex flex-col bg-[#f7f9f8] text-[#14281d]">
      <Header
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onAddListingClick={onAddListingClick}
        onLoginClick={onLoginClick}
      />
      <main className="flex-1">{children}</main>
      <Footer onLoginClick={onLoginClick} onNavigate={onNavigate} />
    </div>
  );
};
