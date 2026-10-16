import React, { useState } from 'react';
import { X, LogIn, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e2eae5] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-6 py-4 border-b border-[#edf3ef] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#166534] flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#14281d]">تسجيل الدخول إلى أرضك</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#14281d] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#14281d]">تم تسجيل الدخول بنجاح</h3>
              <p className="text-xs text-[#527963]">
                مرحباً بك في منصة أرضك.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  رقم الهاتف أو البريد الإلكتروني
                </label>
                <input
                  type="text"
                  required
                  placeholder="01xxxxxxxxx أو yourname@mail.com"
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2 text-xs sm:text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#fbfdfb] border border-[#d1d5db] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 rounded-lg px-3 py-2 text-xs sm:text-sm outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#6b7280] hover:text-[#14281d] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
