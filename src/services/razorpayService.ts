/**
 * Razorpay Standard Web Checkout Client Service
 * Handles script injection, order creation, checkout modal triggering, and payment signature verification.
 */

export interface RazorpayOrderResponse {
  order_id: string;
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  key_id?: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  verified: boolean;
  message: string;
  payment_id: string;
  order_id: string;
  error?: string;
}

export interface RazorpayCheckoutParams {
  amountInRupees: number;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
  notes?: Record<string, string>;
  orderData?: any;
  onSuccess: (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verifyData: RazorpayVerifyResponse;
  }) => void;
  onError: (errorMsg: string) => void;
  onDismiss?: () => void;
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export const razorpayService = {
  /**
   * Load Razorpay checkout script if not already present
   */
  loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay checkout script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Fetch current Razorpay Key ID from server
   */
  async getKeyId(): Promise<string> {
    try {
      const res = await fetch('/api/razorpay-config');
      if (res.ok) {
        const data = await res.json();
        if (data.key_id) return data.key_id;
      }
    } catch {
      // ignore network issue
    }
    return (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_live_TlmsdNF35oZjgz';
  },

  /**
   * STEP 1: Call backend to create Razorpay Order
   * Endpoint: POST /api/create-order
   * Amount in paise (minimum 100 paise = ₹1.00)
   */
  async createOrder(params: {
    amountPaise: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrderResponse> {
    const doFetch = async () => {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amountPaise,
          currency: params.currency || 'INR',
          receipt: params.receipt,
          notes: params.notes,
        }),
      });

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    };

    let result = await doFetch();

    // Auto-retry once on transient network or rate-limit responses
    if (!result.ok && (result.status === 429 || result.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await doFetch();
    }

    if (!result.ok) {
      throw new Error(result.data.error || result.data.details || 'Failed to create Razorpay order');
    }

    return result.data;
  },

  /**
   * STEP 3: Call backend to verify HMAC-SHA256 signature
   * Endpoint: POST /api/verify-payment
   */
  async verifyPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderData?: any;
  }): Promise<RazorpayVerifyResponse> {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok || !data.verified) {
      throw new Error(data.error || 'Payment signature verification failed');
    }

    return data;
  },

  /**
   * Complete Razorpay Standard Web Checkout flow
   */
  async openCheckout(params: RazorpayCheckoutParams): Promise<void> {
    const { amountInRupees, customer, notes, orderData, onSuccess, onError, onDismiss } = params;

    // Minimum 100 paise = ₹1.00
    const amountInPaise = Math.max(100, Math.round(amountInRupees * 100));

    // Ensure Razorpay script is available
    const isLoaded = await this.loadScript();
    if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
      onError('Unable to connect to Razorpay payment gateway. Please check your internet connection.');
      return;
    }

    let orderDataBackend: RazorpayOrderResponse;
    try {
      orderDataBackend = await this.createOrder({
        amountPaise: amountInPaise,
        currency: 'INR',
        receipt: `vionne_${Date.now()}`.slice(0, 40),
        notes: {
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email || '',
          ...notes,
        },
      });
    } catch (createErr: any) {
      console.error('Order creation error:', createErr);
      onError(createErr.message || 'Could not initiate Razorpay order. Please try again.');
      return;
    }

    // Key priority: key returned by server, or Vite environment variable, or active credential
    const keyId =
      orderDataBackend.key_id ||
      (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
      'rzp_live_TlmsdNF35oZjgz';

    const options = {
      key: keyId,
      amount: orderDataBackend.amount,
      currency: orderDataBackend.currency || 'INR',
      name: 'Vionne Luxury',
      description: 'Order Checkout',
      image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=160&auto=format&fit=crop',
      order_id: orderDataBackend.order_id,
      prefill: {
        name: customer.name,
        email: customer.email || '',
        contact: customer.phone.replace(/\D/g, '').slice(-10),
      },
      notes: {
        address: customer.address || '',
        ...notes,
      },
      theme: {
        color: '#0c2340', // Razorpay Navy Theme
        backdrop_color: 'rgba(12, 35, 64, 0.85)',
      },
      modal: {
        ondismiss: () => {
          console.log('Razorpay checkout modal dismissed by user');
          if (onDismiss) {
            onDismiss();
          }
        },
        escape: true,
        animation: true,
        backdropclose: false,
        confirm_close: true,
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // STEP 3: Verify Signature on server
          const verifyResult = await razorpayService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData,
          });

          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            verifyData: verifyResult,
          });
        } catch (verifyErr: any) {
          console.error('Payment verification failed:', verifyErr);
          onError(verifyErr.message || 'Payment signature could not be verified.');
        }
      },
    };

    try {
      const rzpInstance = new (window as any).Razorpay(options);

      // Handle payment.failed event as required
      rzpInstance.on('payment.failed', (failedResponse: any) => {
        console.warn('Razorpay payment failed:', failedResponse);
        const err = failedResponse?.error || {};
        const description = String(err.description || '');
        const reason = String(err.reason || '');

        let friendlyReason = description || reason || 'Payment could not be completed. Please try another method.';

        if (
          description.toLowerCase().includes('tokenization') ||
          reason === 'incorrect_card_details' ||
          description.toLowerCase().includes('issuer')
        ) {
          friendlyReason =
            'Card payment could not be processed by the issuer (RBI tokenization requirement or invalid card details in Live mode). Please pay seamlessly via UPI (Google Pay, PhonePe, Paytm, QR code), Net Banking, or choose Cash on Delivery.';
        } else if (reason === 'payment_cancelled') {
          friendlyReason = 'Payment was cancelled. You can try again whenever you are ready.';
        }

        onError(friendlyReason);
      });

      rzpInstance.open();
    } catch (openErr: any) {
      console.error('Error opening Razorpay modal:', openErr);
      onError('Unable to display Razorpay checkout window. Please allow popups or try again.');
    }
  },
};
