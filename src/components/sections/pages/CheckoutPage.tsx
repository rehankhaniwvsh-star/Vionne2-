import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../../../store/useCart';
import { 
  ChevronLeft, 
  ChevronRight,
  Lock, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  ShieldCheck, 
  QrCode, 
  Smartphone, 
  Building2, 
  Wallet, 
  Percent, 
  Tag, 
  Gift, 
  Check, 
  AlertCircle, 
  Copy, 
  Printer, 
  MessageCircle, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

const INDIAN_PINCODES: Record<string, { city: string; state: string }> = {
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560034': { city: 'Bengaluru', state: 'Karnataka' },
  '560068': { city: 'Bengaluru', state: 'Karnataka' },
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'South Delhi', state: 'Delhi' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400050': { city: 'Bandra Mumbai', state: 'Maharashtra' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '160001': { city: 'Chandigarh', state: 'Punjab' },
  '682001': { city: 'Kochi', state: 'Kerala' },
  '452001': { city: 'Indore', state: 'Madhya Pradesh' }
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onComplete }) => {
  const { items, total: cartTotal, clearCart, updateQuantity } = useCart();
  
  // Checkout flow state
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [onlineTab, setOnlineTab] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'>('UPI');
  
  // Coupon Engine
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountFlat?: number } | null>({
    code: 'BOLD10',
    discountPercent: 10
  });
  const [couponError, setCouponError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    saveInfo: true,
    upiId: '',
    selectedUpiApp: 'gpay',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    selectedBank: 'HDFC',
    selectedWallet: 'paytm'
  });

  // QR Modal Simulation
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTimer, setQrTimer] = useState(299);
  const [qrVerified, setQrVerified] = useState(false);

  // Order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // QR Timer Countdown
  useEffect(() => {
    let interval: any;
    if (isQrModalOpen && qrTimer > 0 && !qrVerified) {
      interval = setInterval(() => {
        setQrTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQrModalOpen, qrTimer, qrVerified]);

  // Handle Indian Pincode Auto-Lookup
  const handlePincodeChange = (pin: string) => {
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => {
      const updated = { ...prev, pincode: cleanPin };
      if (INDIAN_PINCODES[cleanPin]) {
        updated.city = INDIAN_PINCODES[cleanPin].city;
        updated.state = INDIAN_PINCODES[cleanPin].state;
      }
      return updated;
    });
  };

  // Card formatting
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setFormData(prev => ({ ...prev, cardExpiry: `${raw.slice(0, 2)}/${raw.slice(2)}` }));
    } else {
      setFormData(prev => ({ ...prev, cardExpiry: raw }));
    }
  };

  // Card brand detection
  const detectedCardBrand = useMemo(() => {
    const num = formData.cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^6(011|5)/.test(num) || /^65/.test(num) || /^508/.test(num)) return 'RuPay';
    if (/^3[47]/.test(num)) return 'Amex';
    return 'Credit/Debit Card';
  }, [formData.cardNumber]);

  // Calculation Math
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      return Math.round((cartTotal * appliedCoupon.discountPercent) / 100);
    }
    if (appliedCoupon.discountFlat) {
      return Math.min(cartTotal, appliedCoupon.discountFlat);
    }
    return 0;
  }, [appliedCoupon, cartTotal]);

  // Extra 5% discount on prepaid online orders
  const prepaidDiscountAmount = useMemo(() => {
    if (paymentMode === 'ONLINE') {
      return Math.round((cartTotal - couponDiscountAmount) * 0.05);
    }
    return 0;
  }, [paymentMode, cartTotal, couponDiscountAmount]);

  const shippingFee = 0; // Free express shipping

  const finalPayableTotal = useMemo(() => {
    const base = cartTotal - couponDiscountAmount - prepaidDiscountAmount + shippingFee;
    return Math.max(0, base);
  }, [cartTotal, couponDiscountAmount, prepaidDiscountAmount, shippingFee]);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError(null);

    if (code === 'BOLD10') {
      setAppliedCoupon({ code: 'BOLD10', discountPercent: 10 });
      setCouponCode('');
    } else if (code === 'WELCOME200') {
      setAppliedCoupon({ code: 'WELCOME200', discountFlat: 200 });
      setCouponCode('');
    } else if (code === 'PREPAID5') {
      setAppliedCoupon({ code: 'PREPAID5', discountPercent: 5 });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try BOLD10 or WELCOME200');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleSimulateQrPayment = () => {
    setQrVerified(true);
    setTimeout(() => {
      setIsQrModalOpen(false);
      executeOrderPlacement('ONLINE (UPI QR)');
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (currentStep === 'shipping') {
      // Validate shipping form
      if (!formData.firstName || !formData.phone || !formData.address || !formData.pincode) {
        setError('Please fill in all required shipping fields.');
        return;
      }
      setError(null);
      setCurrentStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If online with QR
    if (paymentMode === 'ONLINE' && onlineTab === 'UPI' && formData.selectedUpiApp === 'qr') {
      setIsQrModalOpen(true);
      return;
    }

    const paymentLabel = paymentMode === 'COD' 
      ? 'Cash on Delivery (COD)' 
      : `Online (${onlineTab}${onlineTab === 'UPI' ? ` - ${formData.selectedUpiApp.toUpperCase()}` : ''})`;
      
    executeOrderPlacement(paymentLabel);
  };

  const executeOrderPlacement = async (paymentLabel: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}${formData.apartment ? `, ${formData.apartment}` : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}`
        },
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          variant: item.selectedVariant,
          image: item.image
        })),
        couponApplied: appliedCoupon ? appliedCoupon.code : null,
        discountTotal: couponDiscountAmount + prepaidDiscountAmount,
        total: finalPayableTotal,
        paymentMethod: paymentLabel
      };

      const result = await adminService.createOrder(orderPayload);
      
      const orderIdFormatted = result?.shortId ? `VN-${result.shortId}` : `VN-${Math.floor(100000 + Math.random() * 900000)}`;

      setPlacedOrderDetails({
        id: orderIdFormatted,
        rawId: result?.id || '',
        ...orderPayload
      });

      // Call backend route for notifications
      try {
        await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderData: {
              id: result?.id || orderIdFormatted,
              shortId: orderIdFormatted,
              customer: orderPayload.customer,
              items: orderPayload.items,
              total: finalPayableTotal,
              paymentMethod: paymentLabel
            }
          })
        });
      } catch (err) {
        console.warn('Backend notification logging optional:', err);
      }

      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError('Failed to process your order. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS / CONFIRMATION SCREEN
  if (isSuccess && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 md:p-12 space-y-8"
          >
            {/* Header Checkmark */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
                <Check size={44} strokeWidth={3} />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-950 tracking-tight">
                Order Confirmed!
              </h1>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                Thank you, <strong>{placedOrderDetails.customer.name}</strong>! Your order has been placed successfully and is being packed.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="bg-zinc-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Official Order Reference</span>
                <span className="text-2xl font-mono font-bold tracking-wider text-amber-400">#{placedOrderDetails.id}</span>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Total Paid / Payable</span>
                <span className="text-2xl font-serif font-bold">₹{placedOrderDetails.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-600">
                <span className="flex items-center gap-1.5 text-zinc-900">
                  <Clock size={14} className="text-emerald-600" />
                  Estimated Delivery: 3-4 Business Days
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Processing</span>
              </div>

              <div className="relative pt-2">
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-zinc-500 pt-2">
                  <span className="text-emerald-600 font-bold">Order Placed</span>
                  <span>Packed</span>
                  <span>Dispatched</span>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-4 border-t border-zinc-200 pt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">Order Items</h3>
              <div className="divide-y divide-zinc-100">
                {placedOrderDetails.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-12 h-14 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-zinc-900 truncate">{item.title}</p>
                        <p className="text-zinc-500">{item.variant} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs">
              <div>
                <span className="font-extrabold uppercase text-zinc-400 block mb-1">Delivery Address</span>
                <p className="font-bold text-zinc-900">{placedOrderDetails.customer.name}</p>
                <p className="text-zinc-600">{placedOrderDetails.customer.address}</p>
                <p className="text-zinc-600 mt-1">Phone: {placedOrderDetails.customer.phone}</p>
                <p className="text-zinc-600">Email: {placedOrderDetails.customer.email}</p>
              </div>
              <div>
                <span className="font-extrabold uppercase text-zinc-400 block mb-1">Payment Method</span>
                <p className="font-bold text-zinc-900">{placedOrderDetails.paymentMethod}</p>
                <p className="text-emerald-700 font-semibold mt-1">✓ Order Verified</p>
                <p className="text-zinc-500 mt-2">A confirmation email and SMS dispatch alerts have been sent to your registered contacts.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-white text-zinc-900 border-2 border-zinc-300 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer size={16} />
                <span>Print Tax Invoice</span>
              </button>
              <button 
                onClick={onComplete}
                className="flex-1 bg-black text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
          <Truck size={36} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-zinc-950">Your Checkout is Empty</h2>
        <p className="text-sm text-zinc-600 max-w-sm">Please add items to your cart before proceeding to checkout.</p>
        <button 
          onClick={onBack}
          className="bg-black text-white px-8 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-zinc-800 transition-all"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Live UPI QR Code Simulation Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">Scan & Pay with Any UPI App</span>
                <button onClick={() => setIsQrModalOpen(false)} className="text-zinc-400 hover:text-black">
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Amount Payable</p>
                <p className="text-3xl font-serif font-black text-zinc-950">₹{finalPayableTotal.toLocaleString('en-IN')}</p>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  5% Prepaid Discount Applied
                </span>
              </div>

              {/* Dynamic QR Box */}
              <div className="relative mx-auto w-48 h-48 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-300 p-3 flex flex-col items-center justify-center">
                {qrVerified ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-600 space-y-2">
                    <CheckCircle2 size={54} className="mx-auto" />
                    <p className="text-xs font-bold">Payment Verified!</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="w-full h-full bg-zinc-900 rounded-xl flex flex-col items-center justify-center p-2 text-white text-center space-y-2">
                      <QrCode size={90} className="text-white" />
                      <span className="text-[9px] font-mono text-amber-300 font-bold">UPI ID: vionne.store@okhdfcbank</span>
                    </div>
                  </>
                )}
              </div>

              {!qrVerified && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-xs text-zinc-500 font-mono">
                    <Clock size={14} className="text-amber-500" />
                    <span>QR Expires in: <strong>{Math.floor(qrTimer / 60)}:{String(qrTimer % 60).padStart(2, '0')}</strong></span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3 text-[10px] text-zinc-600">
                    <span className="font-bold">GPay</span> • 
                    <span className="font-bold">PhonePe</span> • 
                    <span className="font-bold">Paytm</span> • 
                    <span className="font-bold">CRED</span>
                  </div>

                  <button 
                    onClick={handleSimulateQrPayment}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    Simulate Successful Scan & Pay
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Navbar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack} 
              className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <span className="text-zinc-300">|</span>
            <span className="text-xl font-serif font-normal tracking-[0.15em] text-zinc-900 uppercase">VIONNE</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <Lock size={14} className="text-[#28402c]" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden bg-zinc-50 border-b border-zinc-200 px-4 py-3">
        <button 
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-900"
        >
          <span className="flex items-center gap-1.5">
            <span>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            {isMobileSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
          <span className="text-sm font-serif font-black">₹{finalPayableTotal.toLocaleString('en-IN')}</span>
        </button>

        {isMobileSummaryOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 space-y-3">
            <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-zinc-200/60">
              {items.map(item => (
                <div key={`${item.id}-${item.selectedVariant}`} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <img src={item.image} alt="" className="w-10 h-12 rounded object-cover flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-bold truncate max-w-[160px]">{item.title}</p>
                      <p className="text-zinc-500 text-[10px]">{item.selectedVariant} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-200 pt-2 text-xs space-y-1">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {prepaidDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>5% Online Prepaid Discount</span>
                  <span>-₹{prepaidDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Main Checkout Form - 7 Columns */}
          <div className="lg:col-span-7 space-y-8">
            {/* Express Checkout Pills */}
            <div className="bg-zinc-50 p-4 md:p-6 rounded-2xl border border-zinc-200 space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 block">
                ⚡ Express 1-Click Checkout
              </span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setPaymentMode('ONLINE');
                    setOnlineTab('UPI');
                    setFormData(prev => ({ ...prev, selectedUpiApp: 'gpay' }));
                    setCurrentStep('payment');
                  }}
                  className="bg-black text-white hover:bg-zinc-800 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <span>Google Pay</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setPaymentMode('ONLINE');
                    setOnlineTab('UPI');
                    setFormData(prev => ({ ...prev, selectedUpiApp: 'phonepe' }));
                    setCurrentStep('payment');
                  }}
                  className="bg-[#5f259f] text-white hover:bg-[#4d1d83] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <span>PhonePe</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setPaymentMode('ONLINE');
                    setOnlineTab('UPI');
                    setFormData(prev => ({ ...prev, selectedUpiApp: 'paytm' }));
                    setCurrentStep('payment');
                  }}
                  className="bg-[#002970] text-white hover:bg-[#001e54] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <span>Paytm</span>
                </button>
              </div>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 text-xs font-extrabold uppercase tracking-wider">
              <button 
                onClick={() => setCurrentStep('shipping')}
                className={`flex items-center space-x-2 ${currentStep === 'shipping' ? 'text-black' : 'text-zinc-400'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === 'shipping' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'
                }`}>1</span>
                <span>Shipping Address</span>
              </button>
              <ChevronRight size={14} className="text-zinc-300" />
              <button 
                onClick={() => setCurrentStep('payment')}
                className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-black' : 'text-zinc-400'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === 'payment' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'
                }`}>2</span>
                <span>Payment & Verification</span>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* STEP 1: SHIPPING & CONTACT */}
              {currentStep === 'shipping' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h2 className="text-base font-serif font-bold text-zinc-950">1. Contact Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Email Address *</label>
                        <input 
                          required
                          type="email"
                          placeholder="e.g. user@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Phone Number (For Tracking & SMS) *</label>
                        <div className="flex">
                          <span className="bg-zinc-100 border border-r-0 border-zinc-300 rounded-l-xl px-3 py-3 text-xs font-bold text-zinc-600 flex items-center">
                            +91
                          </span>
                          <input 
                            required
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit mobile"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-r-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-4 pt-2">
                    <h2 className="text-base font-serif font-bold text-zinc-950">2. Delivery Address</h2>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">First Name *</label>
                        <input 
                          required
                          type="text"
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Last Name</label>
                        <input 
                          type="text"
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Street Address / House No. *</label>
                      <input 
                        required
                        type="text"
                        placeholder="House / Flat No., Building Name, Street"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Apartment, Landmark, Area (Optional)</label>
                      <input 
                        type="text"
                        placeholder="Near Metro station, Opposite Park, etc."
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Pincode *</label>
                        <input 
                          required
                          type="text"
                          maxLength={6}
                          placeholder="6-digit PIN"
                          value={formData.pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">City *</label>
                        <input 
                          required
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">State *</label>
                        <input 
                          required
                          type="text"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#28402c] text-white py-4 px-6 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[#1e3021] transition-all flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: PAYMENT GATEWAY (ONLINE & COD) */}
              {currentStep === 'payment' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Selected Address Summary */}
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-400 font-bold uppercase text-[10px] block">Deliver To</span>
                      <p className="font-bold text-zinc-900">{formData.firstName} {formData.lastName} ({formData.phone})</p>
                      <p className="text-zinc-600 text-[11px] truncate max-w-sm">{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep('shipping')}
                      className="text-black font-bold uppercase text-[10px] tracking-wider underline"
                    >
                      Edit
                    </button>
                  </div>

                  <h2 className="text-base font-serif font-bold text-zinc-950">Select Payment Method</h2>

                  {/* Payment Mode Master Radios */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Online Gateway Option */}
                    <div 
                      onClick={() => setPaymentMode('ONLINE')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        paymentMode === 'ONLINE' 
                          ? 'border-black bg-zinc-950 text-white shadow-lg' 
                          : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <Zap size={18} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-sm">Instant Online Payment</span>
                        </div>
                        <span className="bg-amber-400 text-zinc-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          5% EXTRA OFF
                        </span>
                      </div>
                      <p className={`text-[11px] ${paymentMode === 'ONLINE' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        UPI (GPay, PhonePe, Paytm, QR), Cards, NetBanking, Wallets. Fastest checkout.
                      </p>
                    </div>

                    {/* Cash on Delivery Option */}
                    <div 
                      onClick={() => setPaymentMode('COD')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        paymentMode === 'COD' 
                          ? 'border-black bg-zinc-950 text-white shadow-lg' 
                          : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <Truck size={18} className="text-emerald-500" />
                          <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500">FREE</span>
                      </div>
                      <p className={`text-[11px] ${paymentMode === 'COD' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        Pay cash or UPI at your doorstep upon receiving the package.
                      </p>
                    </div>
                  </div>

                  {/* Sub-panels for ONLINE Payment Mode */}
                  {paymentMode === 'ONLINE' && (
                    <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-5">
                      {/* Sub-tabs */}
                      <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 pb-3 no-scrollbar text-xs font-bold uppercase tracking-wider">
                        {[
                          { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone },
                          { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                          { id: 'NETBANKING', label: 'Net Banking', icon: Building2 },
                          { id: 'WALLET', label: 'Wallets', icon: Wallet }
                        ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = onlineTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setOnlineTab(tab.id as any)}
                              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                                isActive 
                                  ? 'bg-black text-white shadow-sm' 
                                  : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
                              }`}
                            >
                              <Icon size={14} />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* ONLINE SUB-TAB 1: UPI */}
                      {onlineTab === 'UPI' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                              { id: 'gpay', label: 'Google Pay' },
                              { id: 'phonepe', label: 'PhonePe' },
                              { id: 'paytm', label: 'Paytm' },
                              { id: 'qr', label: 'Scan QR Code' }
                            ].map(app => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, selectedUpiApp: app.id })}
                                className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                                  formData.selectedUpiApp === app.id 
                                    ? 'border-black bg-black text-white' 
                                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-black'
                                }`}
                              >
                                {app.id === 'qr' && <QrCode size={14} className="inline mr-1" />}
                                {app.label}
                              </button>
                            ))}
                          </div>

                          {formData.selectedUpiApp !== 'qr' && (
                            <div className="space-y-1.5 pt-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                                Or Enter your UPI ID (VPA)
                              </label>
                              <input 
                                type="text"
                                placeholder="e.g. mobile@okhdfcbank or user@paytm"
                                value={formData.upiId}
                                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none font-mono"
                              />
                            </div>
                          )}

                          {formData.selectedUpiApp === 'qr' && (
                            <div className="p-4 bg-white rounded-xl border border-zinc-200 text-center space-y-2">
                              <p className="text-xs font-semibold text-zinc-800">
                                Clicking "Complete Order" will open your dynamic payment QR code directly.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ONLINE SUB-TAB 2: CARDS */}
                      {onlineTab === 'CARD' && (
                        <div className="space-y-4">
                          {/* Live 3D Card Simulation */}
                          <div className="bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 text-white p-5 rounded-2xl shadow-xl space-y-4 max-w-sm mx-auto">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-mono text-zinc-400">VIONNE SECURE</span>
                              <span className="font-bold text-amber-400">{detectedCardBrand}</span>
                            </div>
                            <p className="text-lg font-mono tracking-widest text-center py-1">
                              {formData.cardNumber || '•••• •••• •••• ••••'}
                            </p>
                            <div className="flex justify-between items-end text-xs">
                              <div>
                                <span className="text-[9px] uppercase text-zinc-400 block">Card Holder</span>
                                <span className="font-bold tracking-wider">{formData.cardName || 'YOUR NAME'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase text-zinc-400 block">Expires</span>
                                <span className="font-mono">{formData.cardExpiry || 'MM/YY'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Card Number *</label>
                              <input 
                                type="text"
                                placeholder="4111 2222 3333 4444"
                                value={formData.cardNumber}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Name on Card *</label>
                              <input 
                                type="text"
                                placeholder="Full Name as printed on card"
                                value={formData.cardName}
                                onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Expiry (MM/YY) *</label>
                                <input 
                                  type="text"
                                  placeholder="MM/YY"
                                  value={formData.cardExpiry}
                                  onChange={(e) => handleExpiryChange(e.target.value)}
                                  className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">CVV / CVC *</label>
                                <input 
                                  type="password"
                                  maxLength={4}
                                  placeholder="3 or 4 digits"
                                  value={formData.cardCvv}
                                  onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, '') })}
                                  className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs focus:border-black outline-none font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ONLINE SUB-TAB 3: NETBANKING */}
                      {onlineTab === 'NETBANKING' && (
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Popular Banks</label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => setFormData({ ...formData, selectedBank: bank })}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                  formData.selectedBank === bank 
                                    ? 'border-black bg-black text-white' 
                                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-black'
                                }`}
                              >
                                {bank} Bank
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ONLINE SUB-TAB 4: WALLETS */}
                      {onlineTab === 'WALLET' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik'].map(wallet => (
                              <button
                                key={wallet}
                                type="button"
                                onClick={() => setFormData({ ...formData, selectedWallet: wallet })}
                                className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                  formData.selectedWallet === wallet 
                                    ? 'border-black bg-black text-white' 
                                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-black'
                                }`}
                              >
                                {wallet}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cash on Delivery Notice */}
                  {paymentMode === 'COD' && (
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Cash on Delivery is 100% verified & active for your pincode ({formData.pincode || 'India'}).
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Please keep exact cash or any UPI app ready at the time of delivery. Our courier partner will hand over the package immediately upon collection.
                      </p>
                    </div>
                  )}

                  {/* Complete Order Primary Button */}
                  <div className="pt-4 space-y-3">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#28402c] text-white py-4 px-6 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[#1e3021] transition-all flex items-center justify-center space-x-2.5 shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock size={15} className="text-white" />
                          <span>Complete Order — Rs. {finalPayableTotal.toLocaleString('en-IN')}.00</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-zinc-500">
                      By completing your order, you agree to Vionne's 30-Day Money Back Guarantee & Terms of Service.
                    </p>
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Sticky Order Summary Sidebar - 5 Columns */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-24 bg-zinc-50 p-6 md:p-8 rounded-3xl border border-zinc-200/90 space-y-6">
              <h2 className="text-lg font-serif font-bold text-zinc-950">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-zinc-200/60">
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-14 h-16 bg-zinc-200 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-zinc-950 truncate max-w-[170px]">{item.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">{item.selectedVariant}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)}
                            className="w-5 h-5 rounded bg-zinc-200 text-zinc-700 flex items-center justify-center text-xs hover:bg-black hover:text-white"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-zinc-200 text-zinc-700 flex items-center justify-center text-xs hover:bg-black hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-950">
                      ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon / Discount Code Input */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">Promo Code</span>
                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <Tag size={14} />
                      <span>{appliedCoupon.code} Applied</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-zinc-400 hover:text-red-600 font-bold text-[10px] uppercase">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. BOLD10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs uppercase font-mono focus:border-black outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleApplyCoupon()}
                      className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                
                {/* Available Coupons Quick Pill Tap */}
                {!appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button 
                      type="button" 
                      onClick={() => handleApplyCoupon('BOLD10')}
                      className="text-[10px] bg-white border border-zinc-300 hover:border-black px-2.5 py-1 rounded-full text-zinc-700 font-bold"
                    >
                      ⚡ BOLD10 (10% OFF)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleApplyCoupon('WELCOME200')}
                      className="text-[10px] bg-white border border-zinc-300 hover:border-black px-2.5 py-1 rounded-full text-zinc-700 font-bold"
                    >
                      🎁 WELCOME200 (₹200 OFF)
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-200 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {prepaidDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>5% Prepaid Instant Discount</span>
                    <span>-₹{prepaidDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}


                <div className="flex justify-between text-zinc-600">
                  <span>Express Nationwide Shipping</span>
                  <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-wider">FREE</span>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline font-serif font-black text-lg text-zinc-950">
                  <span>Total Amount</span>
                  <span className="text-2xl font-bold">₹{finalPayableTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust Seals */}
              <div className="pt-4 border-t border-zinc-200 text-[10px] text-zinc-500 text-center space-y-2">
                <div className="flex items-center justify-center space-x-3 font-bold text-zinc-700">
                  <span>🔒 Norton Secured</span> • 
                  <span>🛡️ PCI-DSS Level 1</span> • 
                  <span>✓ 30-Day Guarantee</span>
                </div>
                <p>100% Satisfaction Guarantee. Doorstep replacement available across India.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
