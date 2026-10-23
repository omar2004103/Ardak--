import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  Sparkles,
  MapPin,
  Maximize2,
  Coins,
  ChevronLeft,
  PlusCircle,
  Edit,
  RefreshCw,
  XCircle,
  Bell,
  CheckCircle2,
  ArrowRight,
  Send,
  Building2,
  ExternalLink,
  LogIn,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { LandPurchaseRequest, LandOffer } from '../../types/purchaseRequest.ts';

interface MyRequestsPageProps {
  onOpenCreateRequest: () => void;
  onOpenRequestDetails: (request: LandPurchaseRequest) => void;
  onEditRequest: (request: LandPurchaseRequest) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onBackToRequests: () => void;
  onViewListing?: (listingId: string) => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = ({
  onOpenCreateRequest,
  onOpenRequestDetails,
  onEditRequest,
  onOpenAuthModal,
  onBackToRequests,
  onViewListing,
}) => {
  const {
    currentUser,
    userRequests,
    purchaseRequests,
    requestNotifications,
    closeRequest,
    renewRequest,
    dismissRequestNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'offers' | 'notifications'>('requests');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Offers submitted by the current user across all requests
  // To get offers made by this user, we can fetch from purchaseRequests or context
  // Let's also keep an array in local state if needed
  const [mySubmittedOffers, setMySubmittedOffers] = useState<LandOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // If not logged in
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">تسجيل الدخول مطلوب</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            يرجى تسجيل الدخول للوصول إلى لوحة طلباتك ومتابعة العروض التي استقبلتها أو قدمتها على أراضي الآخرين.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="w-full py-3 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => onOpenAuthModal('register')}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition-all"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate user KPI stats
  const totalRequests = userRequests.length;
  const activeRequests = userRequests.filter((r) => r.status === 'open').length;
  const totalReceivedOffers = userRequests.reduce((acc, r) => acc + (r.offerCount || 0), 0);
  const unreadNotifs = requestNotifications.filter((n) => !n.read).length;

  const handleClose = async (requestId: string) => {
    if (confirm('هل أنت متأكد من إغلاق هذا الطلب؟ لن تتلقى مزيداً من العروض عليه.')) {
      const res = await closeRequest(requestId);
      if (res.success) {
        setActionNotice('تم إغلاق الطلب بنجاح.');
        setTimeout(() => setActionNotice(null), 3000);
      }
    }
  };

  const handleRenew = async (requestId: string) => {
    const res = await renewRequest(requestId, 30);
    if (res.success) {
      setActionNotice('تم تجديد صلاحية الطلب لمدة 30 يوماً إضافية!');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] pb-16" dir="rtl">
      {/* Top Breadcrumb & Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                onClick={onBackToRequests}
                className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-1 mb-2 font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span>العودة إلى سوق طلبات الشراء</span>
              </button>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                لوحة طلباتي وعروضي
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                إدارة طلبات شراء الأراضي ومتابعة العروض الواردة والمقدمة
              </p>
            </div>

            <button
              onClick={onOpenCreateRequest}
              className="px-5 py-3 rounded-2xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>أضف طلب شراء جديد</span>
            </button>
          </div>

          {/* Quick KPI stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-xl font-black text-[#14532d] block">{totalRequests}</span>
              <span className="text-[11px] text-emerald-800 font-semibold">إجمالي طلباتي</span>
            </div>

            <div className="p-3.5 bg-green-50/60 rounded-2xl border border-green-100">
              <span className="text-xl font-black text-green-800 block">{activeRequests}</span>
              <span className="text-[11px] text-green-700 font-semibold">طلبات نشطة تقبل عروض</span>
            </div>

            <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100">
              <span className="text-xl font-black text-sky-900 block">{totalReceivedOffers}</span>
              <span className="text-[11px] text-sky-700 font-semibold">عروض واردة من البائعين</span>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
              <span className="text-xl font-black text-amber-900 block">{unreadNotifs}</span>
              <span className="text-[11px] text-amber-700 font-semibold">تنبيهات غير مقروءة</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'border-[#166534] text-[#166534]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>طلباتي المنشورة ({userRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 relative ${
                activeTab === 'notifications'
                  ? 'border-[#166534] text-[#166534]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>إشعارات العروض</span>
              {unreadNotifs > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {actionNotice && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab 1: User's Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {userRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-200 shadow-sm max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">لم تنشر أي طلبات شراء بعد</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    حدد مواصفات الأرض الزراعية أو المزرعة التي تبحث عنها ودع أصحاب العروض يتواصلون معك مباشرة.
                  </p>
                </div>
                <button
                  onClick={onOpenCreateRequest}
                  className="px-6 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>نشر أول طلب شراء</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userRequests.map((req) => {
                  const now = new Date().getTime();
                  const expiresAt = new Date(req.expiresAt).getTime();
                  const diffDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays <= 0 || req.status === 'expired';
                  const isClosed = req.status === 'closed';

                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-3xl p-5 border border-gray-200 hover:border-emerald-300 transition-all shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {req.category}
                          </span>

                          {isClosed ? (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                              مغلق
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              منتهي الصلاحية
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              نشط (متبقي {diffDays} يوم)
                            </span>
                          )}

                          {req.moderationStatus === 'hidden' && (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                              مخفي إدارياً
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-gray-900">{req.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {req.governorate} — {req.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                            المساحة: {req.areaMin} إلى {req.areaMax} {req.areaUnit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-gray-400" />
                            الميزانية:{' '}
                            {req.isBudgetUnspecified
                              ? 'مفتوحة للتفاوض'
                              : `${req.budgetMax?.toLocaleString('ar-EG')} ج.م`}
                          </span>
                        </div>
                      </div>

                      {/* Offer counter & Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                          <span className="text-base font-extrabold text-[#14532d] block">
                            {req.offerCount || 0}
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold">
                            عروض مستلمة
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenRequestDetails(req)}
                            className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition-all shadow-xs"
                          >
                            عرض العروض والتفاصيل
                          </button>

                          <button
                            onClick={() => onEditRequest(req)}
                            className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                            title="تعديل الطلب"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleRenew(req.id)}
                            className="p-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="تجديد الصلاحية 30 يوماً"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {req.status === 'open' && (
                            <button
                              onClick={() => handleClose(req.id)}
                              className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              title="إغلاق الطلب"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {requestNotifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 max-w-md mx-auto space-y-2">
                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">لا توجد إشعارات جديدة</h4>
                <p className="text-xs text-gray-500">
                  عند تقديم أي عرض جديد على طلباتك ستظهر لك التنبيهات هنا فورياً.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-w-2xl mx-auto">
                {requestNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      notif.read ? 'bg-white border-gray-200' : 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{notif.title}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 block pt-1">
                        {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <button
                      onClick={() => dismissRequestNotification(notif.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="حذف الإشعار"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
