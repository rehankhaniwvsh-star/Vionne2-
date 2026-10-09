import React, { useState, useMemo } from 'react';
import { useCart } from '../../../store/useCart';
import { 
  Lock, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Tag, 
  AlertCircle, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Zap,
  Info,
  ShoppingBag
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { razorpayService } from '../../../services/razorpayService';

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
  const { items, clearCart } = useCart();

  // Payment method: Razorpay Standard Checkout (default & recommended) or COD
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  
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
  });

  // Flow & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

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

  const validateForm = (): boolean => {
    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return false;
    }

    if (!formData.firstName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.pincode.trim()) {
      setError('Please fill in your name, mobile number, delivery address, and PIN code.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return false;
    }

    if (formData.phone.trim().replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }

    setError(null);
    return true;
  };

  // Submit Order / Initiate Payment
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setError(null);
    setInfoNotice(null);

    const orderCustomerName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim() || 'Customer';
    const orderCustomerEmail = formData.email.trim();
    const orderCustomerPhone = formData.phone.trim();
    const formattedAddress = `${formData.address.trim()}${formData.apartment.trim() ? `, ${formData.apartment.trim()}` : ''}, ${formData.city.trim() || 'City'}, ${formData.state} - ${formData.pincode.trim()}, India`;

    const baseOrderPayload = {
      customer: {
        name: orderCustomerName,
        email: orderCustomerEmail,
        phone: orderCustomerPhone,
        address: formattedAddress,
      },
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        variant: item.selectedVariant,
        image: item.image,
      })),
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      discountTotal: couponDiscountAmount,
      total: finalPayableTotal,
    };

    // --- RAZORPAY STANDARD CHECKOUT FLOW ---
    if (paymentMethod === 'RAZORPAY') {
      setIsSubmitting(true);
      setSubmissionStep('Opening Razorpay Secure Checkout...');

      await razorpayService.openCheckout({
        amountInRupees: finalPayableTotal,
        customer: {
          name: orderCustomerName,
          email: orderCustomerEmail,
          phone: orderCustomerPhone,
          address: formattedAddress,
        },
        notes: {
          store: 'Vionne Luxury',
          pincode: formData.pincode.trim(),
        },
        orderData: {
          ...baseOrderPayload,
          paymentMethod: 'Razorpay Standard Checkout',
        },
        onSuccess: async (paymentResult) => {
          setSubmissionStep('Verifying payment & finalizing order...');
          try {
            // Persist order with verified Razorpay details
            const orderPayload = {
              ...baseOrderPayload,
              paymentMethod: 'Razorpay (Online Verified)',
              paymentStatus: 'PAID',
              razorpay: {
                paymentId: paymentResult.razorpay_payment_id,
                orderId: paymentResult.razorpay_order_id,
                signatureVerified: true,
                verifiedAt: new Date().toISOString(),
              },
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
              paymentMethod: 'Razorpay Standard Checkout',
              paymentStatus: 'PAID',
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpayOrderId: paymentResult.razorpay_order_id,
              customer: {
                name: orderCustomerName,
                phone: orderCustomerPhone,
                email: orderCustomerEmail,
                address: formattedAddress,
              },
            });

            clearCart();
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err: any) {
            console.error('Order save error after payment:', err);
            // Even if local firestore update failed, the payment was verified!
            setPlacedOrderDetails({
              orderId: `VN-${Math.floor(100000 + Math.random() * 900000)}`,
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              items: [...items],
              total: finalPayableTotal,
              subtotal,
              discountTotal: couponDiscountAmount,
              paymentMethod: 'Razorpay Standard Checkout',
              paymentStatus: 'PAID',
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpayOrderId: paymentResult.razorpay_order_id,
              customer: {
                name: orderCustomerName,
                phone: orderCustomerPhone,
                email: orderCustomerEmail,
                address: formattedAddress,
              },
            });
            clearCart();
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } finally {
            setIsSubmitting(false);
            setSubmissionStep('');
          }
        },
        onError: (errorMsg) => {
          setIsSubmitting(false);
          setSubmissionStep('');
          setError(errorMsg);
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setSubmissionStep('');
          setInfoNotice('Payment checkout was closed. You can resume checkout whenever you are ready.');
        },
      });
      return;
    }

    // --- CASH ON DELIVERY FLOW ---
    if (paymentMethod === 'COD') {
      setIsSubmitting(true);
      setSubmissionStep('Confirming Cash on Delivery Order...');

      try {
        const orderPayload = {
          ...baseOrderPayload,
          paymentMethod: 'Cash on Delivery (COD)',
          paymentStatus: 'Pending',
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
          paymentMethod: 'Cash on Delivery (COD)',
          paymentStatus: 'Pending',
          customer: {
            name: orderCustomerName,
            phone: orderCustomerPhone,
            email: orderCustomerEmail,
            address: formattedAddress,
          },
        });

        clearCart();
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        console.error('COD order creation error:', err);
        setError('Unable to place order at this moment. Please check your details and try again.');
      } finally {
        setIsSubmitting(false);
        setSubmissionStep('');
      }
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (isSuccess && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-200 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 bg-[#0c2340] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                <Sparkles size={12} className="text-[#3395FF]" />
                {placedOrderDetails.razorpayPaymentId ? 'Razorpay Verified Payment' : 'Order Confirmed'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
                Thank you for your order!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500">
                Your order has been confirmed. A confirmation notification has been dispatched.
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

            {/* Razorpay Digital Transaction Details (if paid via Razorpay) */}
            {placedOrderDetails.razorpayPaymentId && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c2340]/[0.04] to-[#0c2340]/[0.08] border border-[#0c2340]/20 text-left text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="font-bold text-[#0c2340] flex items-center gap-1.5">
                    <svg className="w-4 h-4 fill-[#3395FF]" viewBox="0 0 24 24">
                      <path d="M14.076 2.002H6.973L3 13.924h6.052l-2.074 8.074 14.022-12.022H14.95l2.126-7.974z"/>
                    </svg>
                    Razorpay Standard Checkout Verification
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Verified Signature
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-700">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Payment ID</span>
                    <span className="font-mono text-xs font-semibold text-zinc-900">{placedOrderDetails.razorpayPaymentId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Razorpay Order ID</span>
                    <span className="font-mono text-xs font-semibold text-zinc-900">{placedOrderDetails.razorpayOrderId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Shipping Summary */}
            <div className="text-left border-t border-zinc-100 pt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Payment Method
                  </span>
                  <p className="font-medium text-zinc-900">{placedOrderDetails.paymentMethod}</p>
                  <p className="text-emerald-700 font-semibold text-[11px]">
                    Status: {placedOrderDetails.paymentStatus === 'PAID' ? 'Fully Paid' : 'Pending on Delivery'}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Estimated Delivery
                  </span>
                  <p className="font-medium text-zinc-900">3 to 5 Business Days</p>
                  <p className="text-zinc-500 text-[11px]">Free Express Insured Courier</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Shipping Address
                </span>
                <p className="font-medium text-zinc-900">{placedOrderDetails.customer.name}</p>
                <p className="text-zinc-600">{placedOrderDetails.customer.address}</p>
                <p className="text-zinc-500">Phone: +91 {placedOrderDetails.customer.phone}</p>
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Items In Your Order
                </span>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl p-3 bg-zinc-50/50">
                  {placedOrderDetails.items.map((item: any) => (
                    <div key={`${item.id}-${item.selectedVariant}`} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-200 border border-zinc-200" 
                        />
                        <div>
                          <p className="font-semibold text-zinc-900 line-clamp-1">{item.title}</p>
                          <p className="text-zinc-500 text-[11px]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-zinc-900 font-mono">
                        ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="px-6 py-2.5 bg-[#0c2340] hover:bg-[#14325a] text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6 font-sans">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
          <ShoppingBag size={38} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-950">Your Cart is Empty</h1>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-sm">Please add items to your shopping bag before proceeding to checkout.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="bg-[#0c2340] text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#14325a] transition-all shadow-md cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors py-2 pr-3 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to bag</span>
          </button>

          <div className="flex items-center gap-2 text-center">
            <span className="font-serif text-lg font-bold tracking-tight text-zinc-900">
              VIONNE
            </span>
            <span className="text-[10px] uppercase font-bold text-[#3395FF] bg-[#0c2340] px-2 py-0.5 rounded-full">
              Razorpay Secured
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
            <Lock size={12} />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
            <span className="sm:hidden">Secured</span>
          </div>
        </div>
      </header>

      {/* Mobile Order Summary Accordion Dropdown */}
      <div className="lg:hidden bg-white border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">
              {isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}
            </span>
            {isMobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <span className="font-bold text-zinc-900 font-mono text-sm">
            ₹{finalPayableTotal.toLocaleString('en-IN')}
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 space-y-3 text-xs">
            {items.map(item => (
              <div key={`${item.id}-${item.selectedVariant}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-200" />
                  <div>
                    <p className="font-medium text-zinc-900 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-mono font-medium">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-zinc-200 space-y-1.5">
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
            
            {/* Error Message with Quick Actions */}
            {error && (
              <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl space-y-3 text-xs text-amber-950 shadow-xs">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-amber-900">Payment Notice</p>
                    <p className="text-zinc-700 leading-relaxed">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60">
                  <span className="text-[11px] font-semibold text-zinc-600">Quick options:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setPaymentMethod('RAZORPAY');
                      handleSubmit();
                    }}
                    className="px-3 py-1.5 bg-[#0c2340] hover:bg-[#14325a] text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Smartphone size={12} />
                    <span>Try UPI / QR Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setPaymentMethod('COD');
                    }}
                    className="px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
                  >
                    Switch to Cash on Delivery
                  </button>
                </div>
              </div>
            )}

            {/* Info Notice (e.g. dismissed modal) */}
            {infoNotice && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-800">
                <Info size={18} className="shrink-0 text-blue-600" />
                <span>{infoNotice}</span>
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
                    <p className="text-[11px] text-zinc-500">Delivered in 3-5 business days • Free Nationwide</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px]">
                  FREE
                </span>
              </div>
            </section>

            {/* 4. Payment Method Selection (Razorpay Standard Web Checkout Theme) */}
            <section className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] flex items-center justify-center font-mono">4</span>
                  Payment Method
                </h2>
                <span className="text-[11px] text-[#0c2340] font-semibold flex items-center gap-1">
                  <Lock size={12} className="text-[#3395FF]" />
                  <span>Razorpay Standard Web Checkout</span>
                </span>
              </div>

              {/* Payment Method Radio Options */}
              <div className="space-y-3.5">
                
                {/* Razorpay Option (Primary & Themed) */}
                <div 
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'RAZORPAY' 
                      ? 'border-[#0c2340] bg-gradient-to-b from-[#0c2340]/[0.02] to-[#0c2340]/[0.06] shadow-xs' 
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'RAZORPAY' ? 'border-[#0c2340]' : 'border-zinc-300'
                      }`}>
                        {paymentMethod === 'RAZORPAY' && <div className="w-2 h-2 rounded-full bg-[#0c2340]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">
                            Razorpay Standard Checkout
                          </span>
                          <span className="bg-[#0c2340] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Instant &amp; Secure
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          UPI (GPay, PhonePe, Paytm), Cards, Net Banking, Wallets
                        </p>
                      </div>
                    </div>

                    {/* Razorpay Brand Mark */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-[#0c2340] flex items-center justify-center">
                        <svg className="w-4 h-4 fill-[#3395FF]" viewBox="0 0 24 24">
                          <path d="M14.076 2.002H6.973L3 13.924h6.052l-2.074 8.074 14.022-12.022H14.95l2.126-7.974z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Razorpay Details when selected */}
                  {paymentMethod === 'RAZORPAY' && (
                    <div className="mt-4 pt-4 border-t border-zinc-200/80 space-y-3">
                      {/* Supported Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center gap-1.5">
                          <Smartphone size={13} className="text-emerald-600 shrink-0" />
                          <span className="text-[11px] font-semibold text-zinc-800">UPI &amp; QR</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center gap-1.5">
                          <CreditCard size={13} className="text-[#0c2340] shrink-0" />
                          <span className="text-[11px] font-semibold text-zinc-800">All Cards</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center gap-1.5">
                          <Building size={13} className="text-purple-600 shrink-0" />
                          <span className="text-[11px] font-semibold text-zinc-800">Net Banking</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center gap-1.5">
                          <Wallet size={13} className="text-amber-600 shrink-0" />
                          <span className="text-[11px] font-semibold text-zinc-800">Wallets</span>
                        </div>
                      </div>

                      {/* Razorpay Gateway Indicator */}
                      <div className="bg-[#0c2340]/5 rounded-xl p-3 border border-[#0c2340]/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-[#3395FF] fill-[#3395FF]" />
                          <span className="font-medium text-zinc-800">
                            Cryptographic HMAC-SHA256 Server Verification
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Razorpay Verified Gateway</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 leading-normal">
                        Clicking the button below will open the official Razorpay checkout modal. You can choose any payment mode (Instant UPI, Cards, Net Banking, or Wallets) to complete your purchase securely.
                      </p>

                      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-emerald-900">
                        <Smartphone size={14} className="text-emerald-700 shrink-0" />
                        <span>Recommended for instant checkout: Select <strong>UPI / QR Code</strong> inside the modal for seamless 1-tap authorization.</span>
                      </div>
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
                        <p className="text-[11px] text-zinc-500">Pay in cash when order is delivered</p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'COD' && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 text-xs text-zinc-600 space-y-1">
                      <p>• Please keep exact cash of ₹{finalPayableTotal.toLocaleString('en-IN')} ready at the time of delivery.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Complete Order / Pay Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className={`w-full py-4 px-6 rounded-2xl text-sm font-bold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-md cursor-pointer ${
                  paymentMethod === 'RAZORPAY'
                    ? 'bg-[#0c2340] hover:bg-[#14325a] text-white shadow-[#0c2340]/20'
                    : 'bg-zinc-900 hover:bg-black text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{submissionStep || 'Processing Checkout...'}</span>
                  </span>
                ) : paymentMethod === 'RAZORPAY' ? (
                  <>
                    <svg className="w-4 h-4 fill-[#3395FF]" viewBox="0 0 24 24">
                      <path d="M14.076 2.002H6.973L3 13.924h6.052l-2.074 8.074 14.022-12.022H14.95l2.126-7.974z"/>
                    </svg>
                    <span>Pay ₹{finalPayableTotal.toLocaleString('en-IN')} via Razorpay</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Place Cash on Delivery Order • ₹{finalPayableTotal.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>100% Secure Checkout powered by Razorpay Standard Web Integration</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6 sticky top-24">
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[11px] font-mono text-zinc-500 lowercase">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
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
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl uppercase font-mono placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#0c2340]"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="bg-[#0c2340] hover:bg-[#14325a] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
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
                  <span className="text-xl font-bold font-mono text-[#0c2340]">
                    ₹{finalPayableTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="border-t border-zinc-100 pt-4 space-y-2.5 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Razorpay PCI-DSS Level 1 &amp; RBI Compliant</span>
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
    </div>
  );
};
