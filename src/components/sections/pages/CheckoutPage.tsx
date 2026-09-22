import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../../../store/useCart';
import { 
  Lock, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  QrCode, 
  Tag, 
  Copy, 
  Check, 
  AlertCircle, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';
import { GooglePayQrCard } from '../../checkout/GooglePayQrCard';
import { UpiPaymentModal } from '../../checkout/UpiPaymentModal';

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
  '452001': { city: 'Indore', state: 'Madhya Pradesh' },
  '800001': { city: 'Patna', state: 'Bihar' },
  '751001': { city: 'Bhubaneswar', state: 'Odisha' },
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Chandigarh'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onComplete }) => {
  const { items, total: cartTotal, clearCart } = useCart();

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  
  // Coupon engine
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountFlat?: number } | null>(null);
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
    state: 'Karnataka',
    pincode: '',
    country: 'India',
    saveInfo: true,
    utrNumber: '',
  });

  // Flow & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Auto-fill city/state from pincode
  const handlePincodeChange = (pincode: string) => {
    const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length === 6) {
      if (INDIAN_PINCODES[cleanPin]) {
        setFormData(prev => ({
          ...prev,
          city: INDIAN_PINCODES[cleanPin].city,
          state: INDIAN_PINCODES[cleanPin].state
        }));
      }
    }
  };

  // Pricing calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  }, [items]);

  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountFlat) {
      return Math.min(appliedCoupon.discountFlat, subtotal);
    }
    if (appliedCoupon.discountPercent) {
      return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const shippingFee = 0; // Free express delivery

  const finalPayableTotal = useMemo(() => {
    return Math.max(0, subtotal - couponDiscountAmount + shippingFee);
  }, [subtotal, couponDiscountAmount, shippingFee]);

  const applyCoupon = () => {
    setCouponError(null);
    const cleaned = couponCode.trim().toUpperCase();

    if (!cleaned) return;

    if (cleaned === 'WELCOME200') {
      setAppliedCoupon({ code: 'WELCOME200', discountFlat: 200 });
      setCouponCode('');
    } else if (cleaned === 'BOLD10') {
      setAppliedCoupon({ code: 'BOLD10', discountPercent: 10 });
      setCouponCode('');
    } else if (cleaned === 'PREPAID5') {
      setAppliedCoupon({ code: 'PREPAID5', discountPercent: 5 });
      setCouponCode('');
    } else {
      setCouponError('Invalid promo code. Try WELCOME200 or BOLD10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Required fields validation
    if (!formData.firstName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.pincode.trim()) {
      setError('Please fill in your name, mobile number, delivery address, and PIN code.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (formData.phone.trim().replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const paymentLabel = paymentMethod === 'UPI'
      ? 'UPI (Google Pay / QR - Vionne)'
      : 'Cash on Delivery (COD)';

    try {
      const orderCustomerName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim() || 'Customer';
      const orderCustomerEmail = formData.email.trim();
      const orderCustomerPhone = formData.phone.trim();
      const formattedAddress = `${formData.address.trim()}${formData.apartment.trim() ? `, ${formData.apartment.trim()}` : ''}, ${formData.city.trim() || 'City'}, ${formData.state} - ${formData.pincode.trim()}, India`;

      const orderPayload = {
        customer: {
          name: orderCustomerName,
          email: orderCustomerEmail,
          phone: orderCustomerPhone,
          address: formattedAddress
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
        discountTotal: couponDiscountAmount,
        total: finalPayableTotal,
        paymentMethod: paymentLabel,
        ...(paymentMethod === 'UPI' ? {
          upiDetails: {
            merchantUpiId: 'rkhan171302@oksbi',
            merchantName: 'Vionne',
            utr: formData.utrNumber.trim() || `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            status: 'PAID'
          }
        } : {})
      };

      const result = await adminService.createOrder(orderPayload);
      const orderIdFormatted = result?.shortId ? `VN-${result.shortId}` : `VN-${Math.floor(100000 + Math.random() * 900000)}`;

      setPlacedOrderDetails({
        orderId: orderIdFormatted,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...items],
        total: finalPayableTotal,
        subtotal,
        discountTotal: couponDiscountAmount,
        paymentMethod: paymentLabel,
        customer: {
          name: orderCustomerName,
          phone: orderCustomerPhone,
          email: orderCustomerEmail,
          address: formattedAddress
        },
        utr: formData.utrNumber.trim()
      });

      clearCart();
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError('Unable to place order at this moment. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (isSuccess && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-200 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
                Thank you for your order!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500">
                Order confirmation has been logged. We will notify you when it ships.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              <div className="text-left">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">
                  Order Number
                </span>
                <span className="text-base font-bold text-zinc-900 font-mono">
                  {placedOrderDetails.orderId}
                </span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">
                  Amount Paid / Payable
                </span>
                <span className="text-base font-bold text-zinc-900 font-mono">
                  ₹{placedOrderDetails.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment & Shipping Summary */}
            <div className="text-left border-t border-zinc-100 pt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Payment Method
                  </span>
                  <p className="font-medium text-zinc-900">{placedOrderDetails.paymentMethod}</p>
                  {placedOrderDetails.utr && (
                    <p className="text-zinc-500 font-mono text-[11px]">
                      Ref / UTR: {placedOrderDetails.utr}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Estimated Delivery
                  </span>
                  <p className="font-medium text-zinc-900">3 to 5 Business Days</p>
                  <p className="text-zinc-500 text-[11px]">Insured Express Delivery</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Shipping Address
                </span>
                <p className="font-medium text-zinc-900">{placedOrderDetails.customer.name}</p>
                <p className="text-zinc-600">{placedOrderDetails.customer.address}</p>
                <p className="text-zinc-500">Phone: {placedOrderDetails.customer.phone}</p>
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Items Ordered
                </span>
                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                  {placedOrderDetails.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0" 
                        />
                        <div>
                          <p className="font-medium text-zinc-900 text-xs">{item.title}</p>
                          <p className="text-[11px] text-zinc-500">
                            Qty: {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-zinc-900 font-mono text-xs">
                        ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-1/2 py-3 px-4 border border-zinc-300 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="w-full sm:w-1/2 py-3 px-4 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag size={15} />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT MAIN FLOW
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      {/* Clean Minimalist Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Secure Checkout
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Mobile Order Summary Dropdown */}
      <div className="lg:hidden bg-white border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-medium text-zinc-800"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-zinc-600" />
            <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            {isMobileSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <span className="font-bold text-zinc-900 font-mono">
            ₹{finalPayableTotal.toLocaleString('en-IN')}
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 space-y-4">
            <div className="divide-y divide-zinc-200">
              {items.map(item => (
                <div key={`${item.id}-${item.selectedVariant}`} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={item.image} alt={item.title} className="w-11 h-11 rounded-lg object-cover bg-white border border-zinc-200" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-700 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">{item.title}</p>
                      {item.selectedVariant && <p className="text-[10px] text-zinc-500">{item.selectedVariant}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-medium font-mono text-zinc-900">
                    ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span className="font-mono">-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Delivery</span>
                <span className="text-emerald-700 font-medium">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-200 text-sm">
                <span>Total</span>
                <span className="font-mono">₹{finalPayableTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Form & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Contact Information */}
            <section className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] flex items-center justify-center font-mono">1</span>
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-zinc-300 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-zinc-900">
                    <span className="bg-zinc-100 px-3 py-2.5 text-xs text-zinc-600 font-medium border-r border-zinc-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="98765 43210"
                      className="w-full px-3 py-2.5 text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </section>

            {/* 2. Shipping Address */}
            <section className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] flex items-center justify-center font-mono">2</span>
                  Delivery Address
                </h2>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Rahul"
                      className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Sharma"
                      className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Street Address (Flat / House No., Building, Street) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Flat 402, Green Valley Apartments, 12th Main Rd"
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Apartment, Suite, Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder="e.g. Near City Center Mall"
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 560001"
                      className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 bg-white"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Shipping Method */}
            <section className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] flex items-center justify-center font-mono">3</span>
                Shipping Method
              </h2>
              <div className="p-3.5 border-2 border-zinc-900 rounded-2xl bg-zinc-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">Standard Express Delivery</p>
                    <p className="text-[11px] text-zinc-500">Delivered within 3-5 business days • Live Tracking</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px]">
                  FREE
                </span>
              </div>
            </section>

            {/* 4. Payment Method Selection (With QR Code included directly) */}
            <section className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] flex items-center justify-center font-mono">4</span>
                  Payment Method
                </h2>
                <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                  <Lock size={12} className="text-emerald-600" />
                  <span>100% Encrypted</span>
                </span>
              </div>

              {/* Payment Method Radio Options */}
              <div className="space-y-3">
                
                {/* UPI Option */}
                <div 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'UPI' 
                      ? 'border-zinc-900 bg-zinc-50/40' 
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'UPI' ? 'border-zinc-900' : 'border-zinc-300'
                      }`}>
                        {paymentMethod === 'UPI' && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900">UPI / QR Code</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">Google Pay, PhonePe, Paytm, BHIM or any UPI App</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <QrCode size={18} className="text-zinc-600" />
                    </div>
                  </div>

                  {/* UPI Body - Embeds the user's Google Pay QR Card */}
                  {paymentMethod === 'UPI' && (
                    <div className="mt-5 pt-5 border-t border-zinc-200/80">
                      {/* Display the uploaded Google Pay QR card */}
                      <GooglePayQrCard
                        amount={finalPayableTotal}
                        orderRef="CHECKOUT"
                        utrValue={formData.utrNumber}
                        onUtrChange={(val) => setFormData({ ...formData, utrNumber: val })}
                      />
                    </div>
                  )}
                </div>

                {/* Cash on Delivery Option */}
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'COD' 
                      ? 'border-zinc-900 bg-zinc-50/40' 
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'COD' ? 'border-zinc-900' : 'border-zinc-300'
                      }`}>
                        {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-900">Cash on Delivery (COD)</span>
                        <p className="text-[11px] text-zinc-500">Pay in cash when order arrives at your doorstep</p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'COD' && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 text-xs text-zinc-600 space-y-1">
                      <p>• Please keep exact cash ready at the time of delivery.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Complete Order Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full bg-zinc-900 hover:bg-black text-white py-4 px-6 rounded-2xl text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </span>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Complete Order • ₹{finalPayableTotal.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-zinc-500">
                By completing your order, you agree to the Terms of Service & Privacy Policy.
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6 sticky top-24">
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items preview */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-zinc-100">
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-13 h-13 rounded-xl object-cover bg-zinc-100 border border-zinc-200" 
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-800 text-white text-[10px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 line-clamp-1">{item.title}</p>
                        {item.selectedVariant && (
                          <p className="text-[11px] text-zinc-500">{item.selectedVariant}</p>
                        )}
                        <p className="text-[11px] text-zinc-500 font-mono">
                          ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-900 font-mono shrink-0">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="border-t border-zinc-100 pt-4">
                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-emerald-700" />
                      <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                      <span className="text-emerald-700 text-[11px]">Applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-medium text-emerald-800 hover:text-red-600 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyCoupon();
                          }
                        }}
                        placeholder="Discount code (e.g. BOLD10)"
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl uppercase font-mono placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="bg-zinc-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>Taxes (GST Included)</span>
                  <span>₹0</span>
                </div>

                <div className="border-t border-zinc-200 pt-3 flex items-baseline justify-between text-zinc-900">
                  <div>
                    <span className="text-sm font-bold block">Total Payable</span>
                    <span className="text-[10px] text-zinc-500">Including all applicable taxes</span>
                  </div>
                  <span className="text-xl font-bold font-mono">
                    ₹{finalPayableTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="border-t border-zinc-100 pt-4 space-y-2 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>100% Payment Protection with NPCI UPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-zinc-600 shrink-0" />
                  <span>Free Express All-India Doorstep Delivery</span>
                </div>
              </div>
            </div>
          </div>

        </form>
      </main>

      {/* UPI Payment Modal (Fallback / Expanded Trigger) */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onSuccess={(paymentData) => {
          setIsUpiModalOpen(false);
          setFormData(prev => ({ ...prev, utrNumber: paymentData.utr || '' }));
        }}
        amount={finalPayableTotal}
        orderRef={`VN-${Math.floor(100000 + Math.random() * 900000)}`}
      />
    </div>
  );
};
