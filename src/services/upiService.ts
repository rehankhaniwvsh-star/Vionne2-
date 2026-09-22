/**
 * UPI (Unified Payments Interface) Payment System Service
 * Compliant with NPCI Unified Payments Interface specifications for merchant deep linking and QR codes.
 */

export interface UpiConfig {
  merchantUpiId: string;
  merchantName: string;
  mcc: string; // Merchant Category Code
  prepaidDiscountPercent: number;
  prepaidDiscountEnabled: boolean;
  requireUtr: boolean;
  autoVerify: boolean;
}

export const DEFAULT_UPI_CONFIG: UpiConfig = {
  merchantUpiId: 'rkhan171302@oksbi',
  merchantName: 'rehan khan',
  mcc: '5499',
  prepaidDiscountPercent: 5,
  prepaidDiscountEnabled: true,
  requireUtr: false,
  autoVerify: true,
};

export interface UpiPaymentPayload {
  merchantUpiId?: string;
  merchantName?: string;
  amount: number;
  transactionNote: string;
  transactionRef: string;
  mcc?: string;
}

export const upiService = {
  /**
   * Builds the official NPCI standard UPI Payment URI
   * Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE&tr=REF&mc=MCC
   */
  generateUpiUri: ({
    merchantUpiId = DEFAULT_UPI_CONFIG.merchantUpiId,
    merchantName = DEFAULT_UPI_CONFIG.merchantName,
    amount,
    transactionNote,
    transactionRef,
    mcc = DEFAULT_UPI_CONFIG.mcc,
  }: UpiPaymentPayload): string => {
    const cleanAmount = Number(amount).toFixed(2);
    const params = new URLSearchParams();
    params.set('pa', merchantUpiId.trim());
    params.set('pn', merchantName.trim());
    params.set('am', cleanAmount);
    params.set('cu', 'INR');
    params.set('tn', transactionNote.slice(0, 50));
    params.set('tr', transactionRef.slice(0, 35));
    if (mcc) {
      params.set('mc', mcc);
    }

    return `upi://pay?${params.toString()}`;
  },

  /**
   * Generates app-specific intent URLs or returns generic upi:// schema
   */
  generateAppIntent: (
    app: 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'bhim' | 'generic',
    payload: UpiPaymentPayload
  ): string => {
    const upiUri = upiService.generateUpiUri(payload);
    const queryString = upiUri.replace('upi://pay?', '');

    switch (app) {
      case 'phonepe':
        // PhonePe custom deep link schema with fallback
        return `phonepe://pay?${queryString}`;
      case 'paytm':
        // Paytm custom deep link schema
        return `paytmmp://pay?${queryString}`;
      case 'gpay':
        // Google Pay deep link
        return `gpay://upi/pay?${queryString}`;
      case 'cred':
      case 'bhim':
      case 'generic':
      default:
        return upiUri;
    }
  },

  /**
   * Validate Indian VPA / UPI ID format (e.g., username@bank, mobile@upi)
   */
  validateVpa: (vpa: string): boolean => {
    if (!vpa || typeof vpa !== 'string') return false;
    const clean = vpa.trim();
    // Standard UPI ID pattern: 2 to 64 chars before @, 2 to 32 chars after @
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}$/;
    return upiRegex.test(clean);
  },

  /**
   * Validates 12-digit Indian Bank UTR (Unique Transaction Reference / RRN)
   */
  validateUtr: (utr: string): boolean => {
    if (!utr || typeof utr !== 'string') return false;
    const clean = utr.trim().replace(/\s/g, '');
    return /^\d{12}$/.test(clean);
  },

  /**
   * Identifies UPI provider / bank from VPA handle
   */
  detectProvider: (vpa: string): { provider: string; color: string } => {
    const lower = vpa.toLowerCase().trim();
    if (lower.includes('@okhdfcbank') || lower.includes('@okaxis') || lower.includes('@oksbi') || lower.includes('@okicici')) {
      return { provider: 'Google Pay', color: '#4285F4' };
    }
    if (lower.includes('@ybl') || lower.includes('@ibl') || lower.includes('@axl')) {
      return { provider: 'PhonePe', color: '#5f259f' };
    }
    if (lower.includes('@paytm')) {
      return { provider: 'Paytm Payments Bank', color: '#00baf2' };
    }
    if (lower.includes('@upi')) {
      return { provider: 'BHIM UPI', color: '#00796B' };
    }
    if (lower.includes('@postbank') || lower.includes('@ippb')) {
      return { provider: 'India Post Payments Bank', color: '#D32F2F' };
    }
    if (lower.includes('@apl') || lower.includes('@amazon')) {
      return { provider: 'Amazon Pay UPI', color: '#FF9900' };
    }
    return { provider: 'BHIM UPI Partner Bank', color: '#1a1a1a' };
  }
};
