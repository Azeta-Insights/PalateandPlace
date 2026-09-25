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
  static async initiateWorldUnlock(
    userEmail: string,
    userId: string,
    idToken: string,
    onSuccess: (result: PaymentSuccessResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    try {
      if (!idToken) {
        onError('Please sign in with Google or Email before unlocking so your World Pass is securely linked to your account.');
        return;
      }

      // 1. Request initialization from backend API with verified token
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          errorData.message ||
          `Server returned HTTP ${res.status}: Could not initiate payment session.`
        );
      }

      const initData = await res.json();

      if (initData?.keyError) {
        onError(initData.keyError);
        return;
      }

      const rawKey = (
        initData.publicKey ||
        (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY ||
        ''
      ).trim().replace(/^["']|["']$/g, '');
      const isRealPaystackKey = /^(pk_live_|pk_test_)[a-zA-Z0-9]{20,}$/.test(rawKey);

      if (!isRealPaystackKey) {
        onError(
          'Paystack Public Key (pk_live_... or pk_test_...) is missing. Please add PAYSTACK_PUBLIC_KEY to Environment Variables in Vercel Dashboard and redeploy.'
        );
        return;
      }

      // Ensure Paystack SDK is loaded in window
      if (!window.PaystackPop) {
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Paystack SDK script'));
            document.head.appendChild(script);
          });
        } catch {
          onError('Could not load Paystack SDK. Please check your network connection.');
          return;
        }
      }

      if (window.PaystackPop && window.PaystackPop.setup) {
        try {
          const handler = window.PaystackPop.setup({
            key: rawKey,
            email: initData.email || userEmail || 'customer@palateandplace.app',
            amount: initData.amount || 250000,
            currency: initData.currency || 'NGN',
            ref: initData.reference,
            metadata: initData.metadata,
            callback: function (response: { reference: string }) {
              PaystackService.verifyAndGrantEntitlement(
                response.reference,
                userId,
                idToken,
                onSuccess,
                onError
              );
            },
            onClose: function () {
              onError('Payment window closed before completion');
            }
          });

          handler.openIframe();
        } catch (setupErr: any) {
          onError('Error opening Paystack checkout: ' + (setupErr.message || 'Please retry.'));
        }
      } else {
        onError(
          'Paystack live payment gateway is not yet configured with a valid Public Key in this environment. If you are testing or reviewing, please use the "Request Reviewer Pass" button to unlock full access.'
        );
      }
    } catch (err: any) {
      console.error('Paystack initiation error:', err);
      onError(err.message || 'Payment initiation failed');
    }
  }

  public static async verifyAndGrantEntitlement(
    reference: string,
    _userId: string,
    idToken: string,
    onSuccess: (result: PaymentSuccessResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    try {
      // Backend securely verifies with Paystack and persists entitlement server-side
      const verifyRes = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ reference })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.message || 'Payment verification failed on server.');
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
      onError('Payment verification error: ' + (err.message || 'Please contact support.'));
    }
  }
}
