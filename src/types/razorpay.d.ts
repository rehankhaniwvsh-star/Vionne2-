declare module 'razorpay' {
  export interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  export interface OrderCreateParams {
    amount: number | string;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
    partial_payment?: boolean;
    [key: string]: unknown;
  }

  export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt?: string;
    status: string;
    attempts: number;
    notes?: Record<string, unknown>;
    created_at: number;
    [key: string]: unknown;
  }

  export default class Razorpay {
    constructor(options: RazorpayOptions);
    orders: {
      create(params: OrderCreateParams, callback?: (err: unknown, order: RazorpayOrder) => void): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
      all(params?: unknown): Promise<unknown>;
    };
    payments: unknown;
    refunds: unknown;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    backdropclose?: boolean;
  };
  [key: string]: unknown;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: unknown) => void) => void;
  close: () => void;
}

interface Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
}

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

