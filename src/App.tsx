import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Layout } from './components/layout/Layout.tsx';
import { AppRoute } from './components/layout/Header.tsx';
import { HeroSection } from './components/home/HeroSection.tsx';
import { LatestListingsSection } from './components/listings/LatestListingsSection.tsx';
import { CategoriesSection } from './components/home/CategoriesSection.tsx';
import { WhyUsSection } from './components/home/WhyUsSection.tsx';
import { CtaBanner } from './components/home/CtaBanner.tsx';
import { SearchPage } from './components/search/SearchPage.tsx';
import { MyListingsPage } from './components/listings/MyListingsPage.tsx';
import { FavoritesPage } from './components/favorites/FavoritesPage.tsx';
import { ProfilePage } from './components/profile/ProfilePage.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { ListingDetailsModal } from './components/listings/ListingDetailsModal.tsx';
import { AddListingModal } from './components/modals/AddListingModal.tsx';
import { EditListingModal } from './components/modals/EditListingModal.tsx';
import { ReportModal } from './components/modals/ReportModal.tsx';
import { AuthModal } from './components/modals/AuthModal.tsx';
import { ComparisonBar } from './components/compare/ComparisonBar.tsx';
import { ComparisonModal } from './components/compare/ComparisonModal.tsx';
import { ComparePage } from './components/compare/ComparePage.tsx';
import { UserDashboard } from './components/dashboard/UserDashboard.tsx';
import { SeoManager } from './components/seo/SeoManager.tsx';
import { SeoDirectory } from './components/seo/SeoDirectory.tsx';
import { SoldDealsSection } from './components/deals/SoldDealsSection.tsx';
import { ComparableEngineModal } from './components/valuation/ComparableEngineModal.tsx';
import { PriceDropToast } from './components/notifications/PriceDropToast.tsx';
import { Listing, SearchFilters } from './types/listing.ts';
import { AlertCircle } from 'lucide-react';

const defaultFilters: SearchFilters = {
  operationType: '',
  governorate: '',
  city: '',
  minArea: '',
  maxArea: '',
  maxPrice: '',
  propertyType: '',
};

// Helper to resolve SEO paths to search filters
function resolveSeoRoute(rawPath: string): { route: AppRoute; filters: SearchFilters; cleanPath: string } {
  const p = rawPath.toLowerCase();

  if (p === 'lands/beheira' || p.includes('lands/beheira') && !p.includes('wadi-el-natrun')) {
    return {
      route: 'lands',
      cleanPath: 'lands/beheira',
      filters: { ...defaultFilters, governorate: 'البحيرة' },
    };
  }

  if (p.includes('wadi-el-natrun') || p === 'lands/beheira/wadi-el-natrun') {
    return {
      route: 'lands',
      cleanPath: 'lands/beheira/wadi-el-natrun',
      filters: { ...defaultFilters, governorate: 'البحيرة', city: 'وادي النطرون' },
    };
  }

  if (p.includes('alexandria') || p === 'lands/alexandria') {
    return {
      route: 'lands',
      cleanPath: 'lands/alexandria',
      filters: { ...defaultFilters, governorate: 'الإسكندرية' },
    };
  }

  if (p === 'farms') {
    return {
      route: 'lands',
      cleanPath: 'farms',
      filters: { ...defaultFilters, propertyType: 'مزرعة' },
    };
  }

  if (p === 'rent') {
    return {
      route: 'lands',
      cleanPath: 'rent',
      filters: { ...defaultFilters, operationType: 'إيجار' },
    };
  }

  if (p === 'lands') {
    return {
      route: 'lands',
      cleanPath: 'lands',
      filters: defaultFilters,
    };
  }

  const validRoutes: AppRoute[] = [
    'home',
    'lands',
    'compare',
    'sold-deals',
    'my-listings',
    'favorites',
    'profile',
    'admin',
  ];
  if (validRoutes.includes(p as AppRoute)) {
    return {
      route: p as AppRoute,
      cleanPath: p,
      filters: defaultFilters,
    };
  }

  return {
    route: 'home',
    cleanPath: 'home',
    filters: defaultFilters,
  };
}

function MainApp() {
  const { listings, currentUser } = useApp();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
      return p || 'home';
    }
    return 'home';
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
      return resolveSeoRoute(p).route;
    }
    return 'home';
  });

  // Search filters (auto-populated by SEO route if applicable)
  const [searchPageFilters, setSearchPageFilters] = useState<SearchFilters>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
      return resolveSeoRoute(p).filters;
    }
    return defaultFilters;
  });

  // Modal states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [reportingListing, setReportingListing] = useState<Listing | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Property comparison state
  const [comparedListings, setComparedListings] = useState<Listing[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  // Comparable Engine state
  const [isComparableEngineOpen, setIsComparableEngineOpen] = useState(false);
  const [valuationListing, setValuationListing] = useState<Listing | null>(null);

  const handleOpenValuation = (listing?: Listing) => {
    setValuationListing(listing || null);
    setIsComparableEngineOpen(true);
  };

  // Toggle land in comparison list (up to 4 lands)
  const handleToggleCompare = (listing: Listing) => {
    setComparedListings((prev) => {
      const exists = prev.some((item) => item.id === listing.id);
      if (exists) {
        return prev.filter((item) => item.id !== listing.id);
      }
      if (prev.length >= 4) {
        setCompareNotice('الحد الأقصى للمقارنة هو 4 أراضي في وقت واحد.');
        setTimeout(() => setCompareNotice(null), 3500);
        return prev;
      }
      return [...prev, listing];
    });
  };

  const handleRemoveComparedListing = (id: string) => {
    setComparedListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllCompared = () => {
    setComparedListings([]);
    setIsComparisonOpen(false);
  };

  // Sync route on browser navigation (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
      const resolved = resolveSeoRoute(p);
      setCurrentRoute(resolved.route);
      setCurrentPath(resolved.cleanPath);
      setSearchPageFilters(resolved.filters);
    };

    const handleQuota = () => setMapsQuotaExceeded(true);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  // Safe navigation handler supporting both HTML5 pushState and URL hash
  const navigateTo = (route: AppRoute, newFilters?: SearchFilters) => {
    setCurrentRoute(route);
    setCurrentPath(route);
    if (newFilters) {
      setSearchPageFilters(newFilters);
    }
    const targetUrl = route === 'home' ? '/' : `/${route}`;
    try {
      window.history.pushState({}, '', targetUrl);
    } catch {
      window.location.hash = route === 'home' ? '' : `/${route}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SEO Destination Links handler
  const handleSeoDestinationSelect = (destPath: string, destFilters: SearchFilters) => {
    setCurrentPath(destPath);
    setCurrentRoute('lands');
    setSearchPageFilters(destFilters);
    const targetUrl = `/${destPath}`;
    try {
      window.history.pushState({}, '', targetUrl);
    } catch {
      window.location.hash = targetUrl;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When search is submitted from Hero section on Home page
  const handleHeroSearchSubmit = (filters: SearchFilters) => {
    navigateTo('lands', filters);
  };

  // When a category card is clicked on Home page
  const handleCategorySelect = (propertyType: string) => {
    navigateTo('lands', {
      ...defaultFilters,
      propertyType,
    });
  };

  const comparedIds = comparedListings.map((l) => l.id);

  // Active public listings visible to general buyers (published status)
  // Or if owner is logged in, their own listings are also included
  const publicListings = listings.filter((item) => {
    if (item.status === 'published') return true;
    if (currentUser && item.ownerId === currentUser.id) return true;
    if (currentUser?.role === 'admin') return true;
    return false;
  });

  return (
    <Layout
      currentRoute={currentRoute}
      onNavigate={(route) => navigateTo(route)}
      onAddListingClick={() => setIsAddListingOpen(true)}
      onLoginClick={() => setIsAuthModalOpen(true)}
    >
      {/* Dynamic SEO Manager for Title, Meta Description, OpenGraph & JSON-LD */}
      <SeoManager currentPath={currentPath} filters={searchPageFilters} />

      {/* Toast Notice when hitting compare limit */}
      {compareNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1f2937] text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <AlertCircle className="w-4 h-4 text-[#facc15]" />
          <span>{compareNotice}</span>
        </div>
      )}

      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Views by Route */}
      {currentRoute === 'lands' && (
        <>
          <SearchPage
            allListings={publicListings}
            initialFilters={searchPageFilters}
            onNavigateHome={() => navigateTo('home')}
            onViewDetails={(listing) => setSelectedListing(listing)}
            comparedIds={comparedIds}
            onToggleCompare={handleToggleCompare}
          />
          <SeoDirectory onSelectDestination={handleSeoDestinationSelect} />
        </>
      )}

      {(currentRoute === 'my-listings' || currentRoute === 'profile') && (
        <UserDashboard
          onNavigateHome={() => navigateTo('home')}
          onNavigateToLands={() => navigateTo('lands')}
          onOpenAddListing={() => setIsAddListingOpen(true)}
          onViewListingDetails={(listing) => setSelectedListing(listing)}
          onEditListing={(listing) => setEditingListing(listing)}
        />
      )}

      {currentRoute === 'favorites' && (
        <FavoritesPage
          onViewDetails={(listing) => setSelectedListing(listing)}
          onNavigateToSearch={() => navigateTo('lands')}
          onNavigateHome={() => navigateTo('home')}
          comparedIds={comparedIds}
          onToggleCompare={handleToggleCompare}
          onOpenLogin={() => setIsAuthModalOpen(true)}
        />
      )}

      {currentRoute === 'admin' && (
        <AdminDashboard
          onNavigateHome={() => navigateTo('home')}
          onViewDetails={(listing) => setSelectedListing(listing)}
          onEditListing={(listing) => setEditingListing(listing)}
        />
      )}

      {currentRoute === 'compare' && (
        <ComparePage
          allListings={publicListings}
          initialLandA={comparedListings[0] || null}
          initialLandB={comparedListings[1] || null}
          onNavigateHome={() => navigateTo('home')}
          onNavigateToSearch={() => navigateTo('lands')}
          onViewDetails={(listing) => setSelectedListing(listing)}
        />
      )}

      {currentRoute === 'sold-deals' && (
        <SoldDealsSection
          onNavigateHome={() => navigateTo('home')}
          onExploreLands={() => navigateTo('lands')}
          onOpenValuationEngine={() => handleOpenValuation()}
        />
      )}

      {currentRoute === 'home' && (
        <>
          <HeroSection onSearchSubmit={handleHeroSearchSubmit} />

          <LatestListingsSection
            listings={publicListings.slice(0, 6)}
            onViewDetails={(listing) => setSelectedListing(listing)}
            onNavigateToSearch={() => navigateTo('lands')}
            comparedIds={comparedIds}
            onToggleCompare={handleToggleCompare}
          />

          <CategoriesSection onSelectCategory={handleCategorySelect} />

          {/* Real Market Sold Deals Benchmark */}
          <SoldDealsSection
            onExploreLands={() => navigateTo('lands')}
            onOpenValuationEngine={() => handleOpenValuation()}
          />

          <WhyUsSection />

          <CtaBanner onAddListingClick={() => setIsAddListingOpen(true)} />

          {/* Crawlable SEO Directory of Top Regions */}
          <SeoDirectory onSelectDestination={handleSeoDestinationSelect} />
        </>
      )}

      {/* Floating Comparison Dock Bar when 1 or more items selected */}
      <ComparisonBar
        comparedListings={comparedListings}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenComparePage={() => navigateTo('compare')}
        onRemoveListing={handleRemoveComparedListing}
        onClearAll={handleClearAllCompared}
      />

      {/* Side-by-Side Comparison Modal Table */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        listings={comparedListings}
        onRemoveListing={handleRemoveComparedListing}
        onClearAll={handleClearAllCompared}
        onViewDetails={(listing) => {
          setIsComparisonOpen(false);
          setSelectedListing(listing);
        }}
      />

      {/* Interactive Modal for viewing Listing Details */}
      <ListingDetailsModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onOpenReport={(listing) => setReportingListing(listing)}
        onEditListing={(listing) => setEditingListing(listing)}
        onEvaluateListing={(listing) => handleOpenValuation(listing)}
      />

      {/* Comparable Valuation Engine Modal */}
      <ComparableEngineModal
        isOpen={isComparableEngineOpen}
        onClose={() => setIsComparableEngineOpen(false)}
        initialListing={valuationListing}
        allListings={publicListings}
      />

      {/* Add Listing Modal */}
      <AddListingModal
        isOpen={isAddListingOpen}
        onClose={() => setIsAddListingOpen(false)}
        onListingCreated={(newId) => {
          navigateTo('my-listings');
          const created = listings.find((l) => l.id === newId);
          if (created) setSelectedListing(created);
        }}
      />

      {/* Edit Listing Modal */}
      <EditListingModal
        listing={editingListing}
        isOpen={Boolean(editingListing)}
        onClose={() => setEditingListing(null)}
      />

      {/* Report Modal */}
      <ReportModal
        listing={reportingListing}
        isOpen={Boolean(reportingListing)}
        onClose={() => setReportingListing(null)}
      />

      {/* Auth Modal (Login / Register / Quick Demo Roles) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Floating Price Drop Toast Notification */}
      <PriceDropToast
        onViewListing={(id) => {
          const found = listings.find((l) => l.id === id);
          if (found) setSelectedListing(found);
        }}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
