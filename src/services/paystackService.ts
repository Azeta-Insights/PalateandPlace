import { auth } from '../firebase/config';
import { UserEntitlement } from '../types/recipe';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: any;
        callback: (response: { reference: string }) => void;
        onSuccess?: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaymentSuccessResult {
  success: boolean;
  reference: string;
  entitlement: UserEntitlement;
}

export class PaystackService {
  /**
   * Initiates the official Paystack inline checkout popup.
   * REQUIRES payment through Paystack. Will NEVER bypass or auto-grant without Paystack confirmation.
   */
  static async initiateWorldUnlock(
    userEmail: string,
    userId: string,
    idTokenParam: string,
    onSuccess: (result: PaymentSuccessResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      const fetchedToken = await currentUser?.getIdToken().catch(() => '');
      const tokenToUse = fetchedToken || idTokenParam || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (tokenToUse) {
        headers['Authorization'] = `Bearer ${tokenToUse}`;
      }

      let initData: any = null;

      // 1. Fetch initialization data from backend
      try {
        const res = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        });

        if (res.ok) {
          initData = await res.json().catch(() => null);
        }
      } catch {
        // Fallback to client environment variables if backend endpoint is unavailable
      }

      // 2. Client fallback configuration lookup
      if (!initData || !initData.publicKey) {
        const reference = `PNP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const rawEnvKey = (
          (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY ||
          (import.meta as any).env?.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
          (import.meta as any).env?.PAYSTACK_PUBLIC_KEY ||
          ''
        ).trim().replace(/^["']|["']$/g, '');

        initData = {
          success: true,
          amount: 250000, // ₦2,500.00 (in kobo)
          currency: 'NGN',
          reference,
          email: userEmail || currentUser?.email || '',
          publicKey: rawEnvKey,
          metadata: {
            userId: userId || currentUser?.uid || '',
            appName: 'Palate & Place',
            plan: 'world_unlock_lifetime',
            price: 2500
          }
        };
      }

      const rawKey = (initData.publicKey || '').trim().replace(/^["']|["']$/g, '');
      const isRealPaystackKey = /^(pk_live_|pk_test_)[a-zA-Z0-9]{20,}$/.test(rawKey);

      // STRICT CHECK: Paystack Key MUST be configured. NO BYPASS ALLOWED.
      if (!isRealPaystackKey) {
        onError(
          'Paystack Public Key is missing or invalid. Please add `PAYSTACK_PUBLIC_KEY` or `VITE_PAYSTACK_PUBLIC_KEY` (starting with pk_live_ or pk_test_) to your environment variables in Vercel to process customer payments.'
        );
        return;
      }

      // 3. Ensure Paystack inline JS SDK is loaded
      if (!window.PaystackPop) {
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Paystack payment gateway SDK script'));
            document.head.appendChild(script);
          });
        } catch {
          onError('Could not load Paystack SDK. Please check your internet connection.');
          return;
        }
      }

      // 4. Open Paystack Inline Payment Checkout Popup
      if (window.PaystackPop && window.PaystackPop.setup) {
        try {
          const handler = window.PaystackPop.setup({
            key: rawKey,
            email: initData.email || userEmail || currentUser?.email || 'customer@palateandplace.app',
            amount: initData.amount || 250000,
            currency: initData.currency || 'NGN',
            ref: initData.reference,
            metadata: initData.metadata,
            callback: function (response: { reference: string }) {
              // Strictly verify payment via Paystack API before granting entitlement
              PaystackService.verifyAndGrantEntitlement(
                response.reference,
                userId || currentUser?.uid || '',
                tokenToUse,
                onSuccess,
                onError
              );
            },
            onClose: function () {
              onError('Payment cancelled. Payment must be completed on Paystack to unlock access.');
            }
          });

          handler.openIframe();
        } catch (setupErr: any) {
          onError('Error opening Paystack checkout: ' + (setupErr.message || 'Please retry.'));
        }
      } else {
        onError('Paystack SDK could not be initialized. Please refresh and try again.');
      }
    } catch (err: any) {
      console.error('Paystack initiation error:', err);
      onError(err.message || 'Payment initiation failed.');
    }
  }

  /**
   * Verifies the payment with Paystack server-side before granting entitlement.
   */
  public static async verifyAndGrantEntitlement(
    reference: string,
    _userId: string,
    idTokenParam: string,
    onSuccess: (result: PaymentSuccessResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      const fetchedToken = await currentUser?.getIdToken().catch(() => '');
      const tokenToUse = fetchedToken || idTokenParam || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (tokenToUse) {
        headers['Authorization'] = `Bearer ${tokenToUse}`;
      }

      // Verify payment with Paystack API endpoint
      const verifyRes = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reference })
      });

      const verifyData = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok || !verifyData?.verified) {
        throw new Error(
          verifyData?.message ||
          verifyData?.error ||
          'Payment verification failed on Paystack servers. Access can only be granted for verified transactions.'
        );
      }

      const entitlement: UserEntitlement = verifyData.entitlement || {
        tier: 'premium',
        source: 'purchase',
        unlockedAt: new Date().toISOString(),
        paystackReference: reference
      };

      onSuccess({
        success: true,
        reference,
        entitlement
      });
    } catch (err: any) {
      onError(err.message || 'Payment verification failed. Please contact support with reference: ' + reference);
    }
  }
}
