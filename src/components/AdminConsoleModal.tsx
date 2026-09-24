import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Users, 
  Check, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  BarChart3, 
  Plus,
  CreditCard,
  Sparkles,
  Search,
  RefreshCw
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { PremiumRequest, UserEntitlement } from '../types/recipe';
import { ALL_RECIPES, ALL_STARTER_RECIPES } from '../data/recipes';
import { useAuth } from '../context/AuthContext';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'payments' | 'aiUsage' | 'insights' | 'metrics'>('requests');
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [aiUsageRecords, setAiUsageRecords] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Quick reviewer grant form state
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isAddingReviewer, setIsAddingReviewer] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setIsRefreshing(true);
    let apiRequests: PremiumRequest[] = [];
    let firestoreRequests: PremiumRequest[] = [];

    // 1. Direct Firestore fetch for reviewer requests
    try {
      const snap = await getDocs(collection(db, 'premiumRequests'));
      firestoreRequests = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch (fsErr) {
      console.warn('Firestore requests fetch notice:', fsErr);
    }

    // 2. Safe Backend API fetch
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          apiRequests = data.requests || [];
          setPayments(data.payments || []);
          setAiUsageRecords(data.aiUsages || []);
        }
      }
    } catch (err) {
      console.warn('Admin overview fetch error:', err);
    }

    // Merge requests giving priority to latest
    const reqMap = new Map<string, PremiumRequest>();
    apiRequests.forEach((r) => reqMap.set(r.id || r.userId, r));
    firestoreRequests.forEach((r) => reqMap.set(r.id || r.userId, r));
    setRequests(Array.from(reqMap.values()));

    try {
      const res = await fetch('/api/recipe-insights');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setInsights(data.insights || []);
        }
      }
    } catch (err) {
      console.warn('Insights fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();

      // Real-time listener for incoming & updated requests
      const unsub = onSnapshot(collection(db, 'premiumRequests'), (snap) => {
        const liveReqs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PremiumRequest[];
        setRequests((prev) => {
          const map = new Map<string, PremiumRequest>();
          prev.forEach((r) => map.set(r.id || r.userId, r));
          liveReqs.forEach((r) => map.set(r.id || r.userId, r));
          return Array.from(map.values());
        });
      }, (err) => {
        console.warn('Real-time requests subscription notice:', err);
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      window.history.pushState({ modal: 'admin-console' }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);

      return () => {
        unsub();
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  const handleQuickAddReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerEmail.trim()) return;
    setIsAddingReviewer(true);
    try {
      const emailClean = reviewerEmail.trim().toLowerCase();
      const reviewerPass: UserEntitlement = {
        tier: 'test_premium',
        source: 'reviewer_pass',
        validUntil: 'never',
        grantedAt: new Date().toISOString()
      };

      const newReq: PremiumRequest = {
        id: `req-${emailClean.replace(/[^a-zA-Z0-9]/g, '_')}`,
        userId: emailClean,
        name: reviewerName.trim() || 'Culinary Reviewer',
        email: emailClean,
        requestedAt: new Date().toISOString(),
        status: 'approved',
        reviewedAt: new Date().toISOString()
      };

      // 1. Direct Firestore write for email entitlement and request
      try {
        await setDoc(doc(db, 'premiumRequests', newReq.id), newReq, { merge: true });
        await setDoc(doc(db, 'entitlements', emailClean), reviewerPass, { merge: true });

        // Check if a registered user with this email exists in users collection
        const userQuery = query(collection(db, 'users'), where('email', '==', emailClean));
        const userSnap = await getDocs(userQuery);
        for (const uDoc of userSnap.docs) {
          await setDoc(doc(db, 'entitlements', uDoc.id), reviewerPass, { merge: true });
          await updateDoc(doc(db, 'users', uDoc.id), {
            entitlement: reviewerPass,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }
      } catch (fsErr) {
        console.warn('Direct Firestore reviewer grant notice:', fsErr);
      }

      // 2. Backend sync
      try {
        const token = user ? await user.getIdToken() : '';
        const res = await fetch('/api/admin/dev-grant-premium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            userId: emailClean,
            email: emailClean,
            name: reviewerName.trim() || 'Culinary Reviewer'
          })
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            await res.json();
          }
        }
      } catch (apiErr) {
        console.warn('API grant endpoint notice:', apiErr);
      }

      setActionMessage(`Granted instant World Pass access for ${emailClean}!`);
      setReviewerEmail('');
      setReviewerName('');
      fetchAdminData();
    } catch (err: any) {
      console.error('Quick reviewer grant error:', err);
      setActionMessage(`Error: ${err.message || 'Could not grant access'}`);
    } finally {
      setIsAddingReviewer(false);
    }
  };

  const handleApproveRequest = async (req: PremiumRequest) => {
    try {
      const emailClean = (req.email || '').trim().toLowerCase();
      const reviewerPass: UserEntitlement = {
        tier: 'test_premium',
        source: 'reviewer_pass',
        validUntil: 'never',
        grantedAt: new Date().toISOString()
      };

      // 1. Direct Firestore update
      try {
        await updateDoc(doc(db, 'premiumRequests', req.id), {
          status: 'approved',
          reviewedAt: new Date().toISOString()
        });

        if (req.userId) {
          await setDoc(doc(db, 'entitlements', req.userId), reviewerPass, { merge: true });
          await updateDoc(doc(db, 'users', req.userId), {
            entitlement: reviewerPass,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }

        if (emailClean) {
          await setDoc(doc(db, 'entitlements', emailClean), reviewerPass, { merge: true });
          const userQuery = query(collection(db, 'users'), where('email', '==', emailClean));
          const userSnap = await getDocs(userQuery);
          for (const uDoc of userSnap.docs) {
            await setDoc(doc(db, 'entitlements', uDoc.id), reviewerPass, { merge: true });
            await updateDoc(doc(db, 'users', uDoc.id), {
              entitlement: reviewerPass,
              updatedAt: new Date().toISOString()
            }).catch(() => {});
          }
        }
      } catch (fsErr) {
        console.warn('Firestore direct approve notice:', fsErr);
      }

      // 2. Safely ping backend
      try {
        const token = user ? await user.getIdToken() : '';
        const res = await fetch('/api/admin/approve-test-premium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            requestId: req.id,
            userId: req.userId
          })
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            await res.json();
          }
        }
      } catch (apiErr) {
        console.warn('API approve notice:', apiErr);
      }

      setActionMessage(`Approved World Pass access for ${req.email || req.name}`);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleRejectRequest = async (req: PremiumRequest) => {
    try {
      await updateDoc(doc(db, 'premiumRequests', req.id), {
        status: 'rejected',
        reviewedAt: new Date().toISOString()
      });
      setActionMessage(`Declined request for ${req.email || req.name}`);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleRevokeAccess = async (req: PremiumRequest) => {
    try {
      const emailClean = (req.email || '').trim().toLowerCase();
      const freeEnt: UserEntitlement = {
        tier: 'free',
        source: 'default',
        revokedAt: new Date().toISOString()
      };

      // 1. Direct Firestore update
      try {
        await updateDoc(doc(db, 'premiumRequests', req.id), {
          status: 'revoked',
          reviewedAt: new Date().toISOString()
        });

        if (req.userId) {
          await setDoc(doc(db, 'entitlements', req.userId), freeEnt, { merge: true });
          await updateDoc(doc(db, 'users', req.userId), {
            entitlement: freeEnt,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }

        if (emailClean) {
          await setDoc(doc(db, 'entitlements', emailClean), freeEnt, { merge: true });
          const userQuery = query(collection(db, 'users'), where('email', '==', emailClean));
          const userSnap = await getDocs(userQuery);
          for (const uDoc of userSnap.docs) {
            await setDoc(doc(db, 'entitlements', uDoc.id), freeEnt, { merge: true });
            await updateDoc(doc(db, 'users', uDoc.id), {
              entitlement: freeEnt,
              updatedAt: new Date().toISOString()
            }).catch(() => {});
          }
        }
      } catch (fsErr) {
        console.warn('Firestore direct revoke notice:', fsErr);
      }

      // 2. Safely ping backend
      try {
        const token = user ? await user.getIdToken() : '';
        const res = await fetch('/api/admin/revoke-test-premium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            requestId: req.id,
            userId: req.userId
          })
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            await res.json();
          }
        }
      } catch (apiErr) {
        console.warn('API revoke notice:', apiErr);
      }

      setActionMessage(`Revoked World Pass access for ${req.email || req.name}`);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#F7F3EC] rounded-3xl border border-[#E6DEC8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E6DEC8] bg-[#FFFDF8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EC] border border-[#E6DEC8] text-[#B85C3A] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#29231E]">
                Kitchen Curator Portal
              </h2>
              <p className="text-xs text-[#71675D]">
                Curator & Administrator Console (blessing.waydiva@gmail.com)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAdminData()}
              disabled={isRefreshing}
              title="Refresh Portal Data"
              className="p-2 rounded-xl text-[#71675D] hover:text-[#29231E] hover:bg-[#FAF5EC] transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#B85C3A]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#71675D] hover:text-[#29231E] hover:bg-[#FAF5EC] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-2.5 bg-[#FAF5EC] border-b border-[#E6DEC8] flex items-center gap-2 overflow-x-auto scrollbar-none font-sans">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'requests' ? 'bg-[#29231E] text-[#FFFDF8]' : 'text-[#71675D] hover:text-[#29231E] hover:bg-[#FFFDF8]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Reviewer Requests ({requests.filter(r => (r.status as string).toLowerCase() === 'pending').length} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-[#29231E] text-[#FFFDF8]' : 'text-[#71675D] hover:text-[#29231E] hover:bg-[#FFFDF8]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments & Entitlements ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('aiUsage')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'aiUsage' ? 'bg-[#29231E] text-[#FFFDF8]' : 'text-[#71675D] hover:text-[#29231E] hover:bg-[#FFFDF8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Fair-Use Logs ({aiUsageRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'insights' ? 'bg-[#29231E] text-[#FFFDF8]' : 'text-[#71675D] hover:text-[#29231E] hover:bg-[#FFFDF8]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Recipe Insights ({insights.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'metrics' ? 'bg-[#29231E] text-[#FFFDF8]' : 'text-[#71675D] hover:text-[#29231E] hover:bg-[#FFFDF8]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Cookbook Metrics</span>
          </button>
        </div>

        {actionMessage && (
          <div className="px-6 py-2 bg-[#F2F5EC] border-b border-[#D5DEBF] text-xs text-[#68745D] font-medium font-sans">
            {actionMessage}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: REVIEWER REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#71675D]">
                  Grant complimentary World Pass access for invited culinary partners and testers.
                </p>
                <button
                  onClick={fetchAdminData}
                  className="text-xs text-[#B85C3A] hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {/* Direct Grant Quick Form */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#29231E]">
                  <Plus className="w-3.5 h-3.5 text-[#B85C3A]" />
                  <span>Grant Reviewer Access Directly</span>
                </div>
                <form onSubmit={handleQuickAddReviewer} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="Reviewer Email (e.g. reviewer@culinary.com)"
                    required
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FAF5EC] border border-[#E6DEC8] text-xs text-[#29231E] placeholder-[#71675D] focus:outline-none focus:border-[#29231E]"
                  />
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Name (Optional)"
                    className="sm:w-44 py-2 px-3 rounded-xl bg-[#FAF5EC] border border-[#E6DEC8] text-xs text-[#29231E] placeholder-[#71675D] focus:outline-none focus:border-[#29231E]"
                  />
                  <button
                    type="submit"
                    disabled={isAddingReviewer}
                    className="px-4 py-2 rounded-xl bg-[#29231E] hover:bg-[#3D322A] text-[#FFFDF8] text-xs font-semibold whitespace-nowrap shadow-xs"
                  >
                    {isAddingReviewer ? 'Adding...' : 'Add Reviewer Access'}
                  </button>
                </form>
              </div>

              {requests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-xs text-[#71675D]">
                  No reviewer invitations or requests logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => {
                    const st = (req.status as string).toLowerCase();
                    const isPending = st === 'pending';
                    const isApproved = st === 'approved';
                    const isRejected = st === 'rejected';
                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif font-bold text-sm text-[#29231E]">{req.name}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isApproved ? 'bg-[#F2F5EC] text-[#68745D] border border-[#D5DEBF]' :
                              isRejected ? 'bg-[#FDF2ED] text-[#B85C3A] border border-[#F4CEBE]' :
                              'bg-[#FAF5E8] text-[#B18A58] border border-[#E6DEC8]'
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-[#71675D] font-mono">{req.email}</p>
                          <p className="text-[10px] text-[#71675D] mt-0.5">
                            Requested: {new Date(req.requestedAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="px-3 py-1.5 rounded-xl bg-[#68745D] hover:bg-[#57624E] text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req)}
                                className="px-3 py-1.5 rounded-xl bg-[#FAF5EC] hover:bg-[#F2EADB] text-[#71675D] text-xs font-semibold flex items-center gap-1 border border-[#E6DEC8]"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Decline
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleRevokeAccess(req)}
                              className="px-3 py-1.5 rounded-xl bg-[#FDF2ED] hover:bg-[#F9E2D8] text-[#B85C3A] border border-[#F4CEBE] text-xs font-semibold"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS & ENTITLEMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#71675D]">
                  Verified Paystack payment transactions stored in Firestore `payments` collection.
                </p>
                <button
                  onClick={fetchAdminData}
                  className="text-xs text-[#B85C3A] hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-xs text-[#71675D]">
                  No payment transactions processed yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] flex items-center justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#29231E]">Ref: {p.paystackReference}</span>
                          <span className="text-[10px] bg-[#F2F5EC] text-[#68745D] px-2 py-0.5 rounded-full font-bold">
                            {p.status || 'SUCCESS'}
                          </span>
                        </div>
                        <p className="text-xs text-[#71675D] mt-0.5">User: {p.userId} • {p.email || 'Direct Checkout'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-sm text-[#29231E]">
                          {p.currency || 'NGN'} {(p.amount ? p.amount / 100 : 2500).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#71675D]">{new Date(p.verifiedAt || p.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI FAIR-USE LOGS */}
          {activeTab === 'aiUsage' && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#71675D]">
                  Persistent atomic AI Chef quota counters stored in Firestore `aiUsage`.
                </p>
                <button
                  onClick={fetchAdminData}
                  className="text-xs text-[#B85C3A] hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {aiUsageRecords.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-xs text-[#71675D]">
                  No AI Chef requests recorded this period.
                </div>
              ) : (
                <div className="space-y-2">
                  {aiUsageRecords.map((u) => (
                    <div key={u.id} className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] flex items-center justify-between shadow-xs">
                      <div>
                        <p className="font-mono text-xs font-bold text-[#29231E]">User: {u.userId || u.id}</p>
                        <p className="text-xs text-[#71675D] mt-0.5">Month: {u.calendarMonth} • Last active: {new Date(u.lastRequestAt || u.updatedAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-[#29231E]">
                          Today: {u.todayCount || 0} / Month: {u.monthCount || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RECIPE INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-4 font-sans">
              <div>
                <h3 className="font-serif text-base font-bold text-[#29231E]">
                  Recipe Question Analytics
                </h3>
                <p className="text-xs text-[#71675D]">
                  Cooking questions asked to AI Chef. Grouped by category to highlight common kitchen roadblocks and improve recipe notes.
                </p>
              </div>

              {insights.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-xs text-[#71675D]">
                  No cooking questions logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {insights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] flex items-start justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF5EC] text-[#B18A58] border border-[#E6DEC8] uppercase font-semibold">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-[#29231E]">
                            {item.recipeTitle}
                          </span>
                        </div>
                        <p className="text-xs text-[#71675D] italic">
                          "{item.question}"
                        </p>
                      </div>

                      <span className="text-[10px] text-[#71675D] whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COOKBOOK METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 font-sans">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-center shadow-xs">
                  <p className="font-mono text-3xl font-bold text-[#29231E]">{ALL_RECIPES.length}</p>
                  <p className="text-xs text-[#71675D] mt-1">Total Recipes</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-center shadow-xs">
                  <p className="font-mono text-3xl font-bold text-[#68745D]">{ALL_STARTER_RECIPES.length}</p>
                  <p className="text-xs text-[#71675D] mt-1">Free Starters</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-center shadow-xs">
                  <p className="font-mono text-3xl font-bold text-[#B85C3A]">52</p>
                  <p className="text-xs text-[#71675D] mt-1">Total Countries</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6DEC8] text-center shadow-xs">
                  <p className="font-mono text-3xl font-bold text-[#29231E]">6</p>
                  <p className="text-xs text-[#71675D] mt-1">Continents</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
