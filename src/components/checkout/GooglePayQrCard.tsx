import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GooglePayQrCardProps {
  amount?: number;
  orderRef?: string;
  onUtrChange?: (utr: string) => void;
  utrValue?: string;
}

export const GooglePayQrCard: React.FC<GooglePayQrCardProps> = ({
  amount,
  orderRef,
  onUtrChange,
  utrValue = '',
}) => {
  const [copied, setCopied] = useState(false);
  const upiId = 'rkhan171302@oksbi';
  const payeeName = 'rehan khan';

  // Build standard UPI URL
  const upiUrl = amount && amount > 0
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderRef ? `Order ${orderRef}` : 'Store Payment')}`
    : `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'generic') => {
    let targetUri = upiUrl;
    const query = upiUrl.replace('upi://pay?', '');
    
    if (app === 'gpay') {
      targetUri = `gpay://upi/pay?${query}`;
    } else if (app === 'phonepe') {
      targetUri = `phonepe://pay?${query}`;
    } else if (app === 'paytm') {
      targetUri = `paytmmp://pay?${query}`;
    }

    window.location.href = targetUri;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#F0F4F9] border border-zinc-200/80 rounded-3xl p-6 sm:p-7 shadow-sm text-zinc-800 font-sans">
      {/* Payee Profile Header matching the user's uploaded Google Pay QR */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-[#EA580C] text-white font-semibold flex items-center justify-center text-xl shadow-sm">
          r
        </div>
        <div className="text-left">
          <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 tracking-tight lowercase">
            {payeeName}
          </h3>
        </div>
      </div>

      {/* Main QR Code Card Container */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col items-center relative">
        <div className="relative p-2 bg-white rounded-2xl flex items-center justify-center">
          <QRCodeSVG
            value={upiUrl}
            size={220}
            level="H"
            marginSize={0}
            className="rounded-lg"
          />

          {/* Centered Google Pay Emblem Badge */}
          <div className="absolute inset-0 m-auto w-11 h-11 bg-white rounded-full shadow-md border border-zinc-200 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
              <path
                d="M14 17C14 13.6863 16.6863 11 20 11C23.3137 11 26 13.6863 26 17"
                stroke="#4285F4"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M26 23C26 26.3137 23.3137 29 20 29C16.6863 29 14 26.3137 14 23"
                stroke="#34A853"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M14 23V17"
                stroke="#FBBC04"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M26 17V23"
                stroke="#EA4335"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Amount Tag if dynamic */}
        {amount && amount > 0 && (
          <div className="mt-4 px-3.5 py-1 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-semibold text-zinc-700">
            Payable: ₹{amount.toLocaleString('en-IN')}
          </div>
        )}

        {/* UPI ID with 1-click copy */}
        <div className="mt-4 flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100/80 transition-colors border border-zinc-200/90 rounded-xl px-3.5 py-2 w-full max-w-[280px]">
          <span className="text-xs font-medium text-zinc-700 font-mono select-all">
            UPI ID: <strong className="text-zinc-900">{upiId}</strong>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy UPI ID"
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors ml-auto shrink-0"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Subtext matching uploaded image */}
      <p className="text-center text-xs font-medium text-zinc-500 mt-5 mb-4">
        Scan to pay with any UPI app
      </p>

      {/* UPI Apps supported pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 pb-3">
        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map((app) => (
          <span
            key={app}
            className="text-[11px] font-medium bg-white text-zinc-600 border border-zinc-200/90 px-2.5 py-1 rounded-lg shadow-2xs"
          >
            {app}
          </span>
        ))}
      </div>

      {/* Mobile 1-Tap Intent Launcher */}
      <div className="mt-2 pt-3 border-t border-zinc-200/80">
        <div className="text-[11px] font-medium text-zinc-500 text-center mb-2.5">
          Paying on this mobile device?
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleOpenApp('gpay')}
            className="bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-medium py-2 px-2.5 rounded-xl border border-zinc-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>Google Pay</span>
            <ExternalLink size={11} className="text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenApp('phonepe')}
            className="bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-medium py-2 px-2.5 rounded-xl border border-zinc-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>PhonePe</span>
            <ExternalLink size={11} className="text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenApp('paytm')}
            className="bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-medium py-2 px-2.5 rounded-xl border border-zinc-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>Paytm</span>
            <ExternalLink size={11} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* 12-digit UTR Input for Payment Confirmation */}
      {onUtrChange && (
        <div className="mt-4 pt-3 border-t border-zinc-200/80">
          <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">
            After paying, enter the 12-digit UTR / UPI Ref ID:
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={12}
              value={utrValue}
              onChange={(e) => onUtrChange(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 427918239014"
              className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
            />
            {utrValue.length === 12 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 text-[11px] font-medium">
                <CheckCircle2 size={15} />
                <span>Valid</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Found in your UPI app payment receipt or bank SMS alert.
          </p>
        </div>
      )}

      {/* Security note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>Direct NPCI Bank-to-Bank Transfer — 100% Encrypted</span>
      </div>
    </div>
  );
};
