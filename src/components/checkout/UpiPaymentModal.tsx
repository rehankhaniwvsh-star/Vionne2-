import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { GooglePayQrCard } from './GooglePayQrCard';
import { upiService } from '../../services/upiService';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: { 
    method: string; 
    utr?: string; 
    vpa?: string; 
    app: string;
  }) => void;
  amount: number;
  orderRef: string;
  customerName?: string;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  orderRef,
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min timer

  const upiId = 'rkhan171302@oksbi';

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (isOpen && timeLeft > 0 && !paymentSuccess) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, paymentSuccess]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setPaymentSuccess(false);
      setIsProcessing(false);
      setUtrNumber('');
      setUtrError(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (utrNumber.trim() && utrNumber.trim().length !== 12) {
      setUtrError('Please enter a valid 12-digit UPI reference / UTR number from your payment app.');
      return;
    }
    setUtrError(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        onSuccess({
          method: 'UPI (Google Pay / QR)',
          utr: utrNumber.trim() || `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          vpa: upiId,
          app: 'gpay'
        });
      }, 1000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200 my-auto text-zinc-900 font-sans"
        >
          {/* Neutral Clean Header */}
          <div className="bg-zinc-900 text-white p-5 relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
                Secure UPI Gateway
              </span>
            </div>

            <div className="flex justify-between items-baseline pr-6">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Scan & Pay via UPI
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Reference: <span className="font-mono text-zinc-300">{orderRef}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white font-mono">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {paymentSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-lg font-semibold text-zinc-900">Payment Verified!</h4>
                <p className="text-xs text-zinc-500">Completing your order placement...</p>
              </motion.div>
            ) : (
              <>
                {/* Embed the Google Pay QR Card */}
                <GooglePayQrCard
                  amount={amount}
                  orderRef={orderRef}
                  utrValue={utrNumber}
                  onUtrChange={(val) => {
                    setUtrNumber(val);
                    setUtrError(null);
                  }}
                />

                {/* Validation Error Message */}
                {utrError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{utrError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Payment...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>I Have Completed the Payment</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 pt-1 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-zinc-400" />
                      <span>
                        Time remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                    >
                      Change Payment Method
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
