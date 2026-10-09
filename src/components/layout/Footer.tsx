import React from 'react';
import { Sprout, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#10271a] text-[#cfe1d5] pt-14 pb-8 border-t border-[#1b3d2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#16a34a] flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">Ardak | أرضك</span>
                <span className="block text-xs text-[#9eb4a5]">سوق الأراضي والمزارع في مصر</span>
              </div>
            </div>
            <p className="text-sm text-[#9eb4a5] leading-relaxed">
              منصة مصرية متخصصة للأراضي الزراعية والمزارع للبيع والإيجار. نربط أصحاب الأراضي والمستثمرين والمزارعين مباشرة وبكل شفافية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-10 after:h-0.5 after:bg-[#16a34a]">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm text-[#a8bcae]">
              <li>
                <a href="#" className="hover:text-white hover:translate-x-[-2px] transition-all inline-block">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#search-section" className="hover:text-white hover:translate-x-[-2px] transition-all inline-block">
                  البحث في الأراضي
                </a>
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
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span dir="ltr">0100 000 0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>info@ardak.eg</span>
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
