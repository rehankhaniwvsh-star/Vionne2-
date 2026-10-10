import React from 'react';
import { ShieldCheck, Lock, Zap, CheckCircle2, CreditCard, Smartphone, Building, Wallet, Sparkles } from 'lucide-react';

interface RazorpayCheckoutCardProps {
  amount: number;
  isLoading: boolean;
  onPay: () => void;
  disabled?: boolean;
}

export const RazorpayCheckoutCard: React.FC<RazorpayCheckoutCardProps> = ({
  amount,
  isLoading,
  onPay,
  disabled = false,
}) => {
  return (
    <div className="w-full rounded-2xl border-2 border-[#0c2340] bg-gradient-to-b from-[#0c2340]/[0.03] to-[#0c2340]/[0.08] p-5 sm:p-6 text-zinc-900 transition-all shadow-xs">
      {/* Header with Razorpay Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200/90 gap-3">
        <div className="flex items-center gap-3">
          {/* Razorpay Brand Mark */}
          <div className="w-10 h-10 rounded-xl bg-[#0c2340] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg
              className="w-6 h-6 fill-current text-[#3395FF]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.076 2.002H6.973L3 13.924h6.052l-2.074 8.074 14.022-12.022H14.95l2.126-7.974z" fill="#3395FF"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0c2340] tracking-tight font-sans">
                Razorpay Standard Checkout
              </span>
              <span className="bg-[#0c2340] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Official
              </span>
            </div>
            <p className="text-[11px] text-zinc-600">
              India&apos;s most trusted secure payment gateway
            </p>
          </div>
        </div>

        {/* Security / Test Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/90 border border-zinc-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-800 shadow-2xs">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>256-Bit SSL Secured</span>
        </div>
      </div>

      {/* Accepted Payment Methods Showcase */}
      <div className="py-4 space-y-3">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
          All Payment Methods Supported in Modal
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* UPI */}
          <div className="p-2.5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Smartphone size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">UPI &amp; QR</p>
              <p className="text-[10px] text-zinc-500 truncate">GPay, PhonePe, Paytm</p>
            </div>
          </div>

          {/* Cards */}
          <div className="p-2.5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0c2340] flex items-center justify-center shrink-0">
              <CreditCard size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">Cards</p>
              <p className="text-[10px] text-zinc-500 truncate">Visa, Master, RuPay</p>
            </div>
          </div>

          {/* Netbanking */}
          <div className="p-2.5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Building size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">Net Banking</p>
              <p className="text-[10px] text-zinc-500 truncate">50+ Indian Banks</p>
            </div>
          </div>

          {/* Wallets */}
          <div className="p-2.5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Wallet size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">Wallets</p>
              <p className="text-[10px] text-zinc-500 truncate">Mobikwik, Freecharge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="bg-[#0c2340]/5 rounded-xl p-3 border border-[#0c2340]/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[#3395FF] fill-[#3395FF]" />
          <span className="font-medium text-zinc-800">
            Instant 1-Click Verification • Zero Manual UTR Entry
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Razorpay Official Gateway</span>
        </div>
      </div>

      {/* Primary Razorpay Action Button */}
      <button
        type="button"
        onClick={onPay}
        disabled={disabled || isLoading}
        className="w-full bg-[#0c2340] hover:bg-[#14325a] active:bg-[#08182b] text-white py-3.5 px-6 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Connecting to Razorpay...</span>
          </div>
        ) : (
          <>
            <svg
              className="w-4 h-4 fill-current text-[#3395FF] group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.076 2.002H6.973L3 13.924h6.052l-2.074 8.074 14.022-12.022H14.95l2.126-7.974z" fill="#3395FF"/>
            </svg>
            <span>Proceed to Pay ₹{amount.toLocaleString('en-IN')} with Razorpay</span>
          </>
        )}
      </button>

      {/* Footer guarantees */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Lock size={11} className="text-emerald-600" />
          PCI-DSS Compliant
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={11} className="text-emerald-600" />
          Cryptographic HMAC-SHA256 Verified
        </span>
      </div>
    </div>
  );
};
