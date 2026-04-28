import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Coins, Loader2, LogOut, Plus, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createCreditsCheckout, fetchBillingProfile } from '@/services/openai';

const FALLBACK_PACKS = [
  { dollars: 5, credits: 500 },
  { dollars: 10, credits: 1000 },
  { dollars: 50, credits: 5000 },
  { dollars: 100, credits: 10000 },
];

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function ProfileModal({ isOpen, onClose }) {
  const { credits, user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [packs, setPacks] = useState(FALLBACK_PACKS);
  const [loading, setLoading] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchBillingProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data.user || null);
        setPacks(Array.isArray(data.packs) && data.packs.length ? data.packs : FALLBACK_PACKS);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfile(null);
        setError(err.message || 'Could not load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  const displayProfile = useMemo(() => {
    return {
      email: profile?.email || user?.email || 'No email on file',
      createdAt: profile?.createdAt || user?.created_at,
      lastSignInAt: profile?.lastSignInAt || user?.last_sign_in_at,
      credits: Number.parseInt(String(credits?.balance ?? profile?.credits ?? 0), 10) || 0,
    };
  }, [credits?.balance, profile, user]);

  if (!isOpen || !user) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleAddCredits = async (dollars) => {
    setCheckoutAmount(dollars);
    setError('');

    try {
      const response = await createCreditsCheckout(dollars);
      const checkoutUrl = response?.checkoutUrl || '';
      if (!checkoutUrl) {
        throw new Error('Checkout URL was not returned');
      }
      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(err.message || 'Could not start checkout');
    } finally {
      setCheckoutAmount(null);
    }
  };

  return (
    <div className="labs-modal-overlay" onClick={handleOverlayClick}>
      <div className="labs-profile-modal" role="dialog" aria-modal="true" aria-labelledby="labs-profile-title">
        <button className="labs-modal-close" type="button" onClick={onClose} aria-label="Close profile">
          <X size={18} />
        </button>

        <div className="labs-profile-modal__header">
          <div className="labs-profile-modal__avatar">
            <User size={22} />
          </div>
          <div>
            <p className="labs-label labs-label--accent">Account</p>
            <h2 id="labs-profile-title">Profile</h2>
          </div>
        </div>

        {error && (
          <div className="labs-profile-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <section className="labs-profile-summary">
          <div>
            <span>Email</span>
            <strong>{displayProfile.email}</strong>
          </div>
          <div>
            <span>Member since</span>
            <strong>{formatDate(displayProfile.createdAt)}</strong>
          </div>
          <div>
            <span>Last sign in</span>
            <strong>{formatDate(displayProfile.lastSignInAt)}</strong>
          </div>
        </section>

        <section className="labs-credit-balance">
          <div>
            <span className="labs-label">Current credits</span>
            <strong>{loading ? '...' : displayProfile.credits.toLocaleString()}</strong>
          </div>
          <Coins size={28} />
        </section>

        <section className="labs-credit-packs">
          <div className="labs-profile-section-head">
            <div>
              <p className="labs-label">Add credits</p>
              <h3>$1 gives 100 credits</h3>
            </div>
          </div>

          <div className="labs-credit-pack-grid">
            {packs.map((pack) => (
              <button
                key={pack.dollars}
                type="button"
                className="labs-credit-pack"
                onClick={() => handleAddCredits(pack.dollars)}
                disabled={checkoutAmount !== null}
              >
                <span>${pack.dollars}</span>
                <strong>{pack.credits.toLocaleString()} credits</strong>
                {checkoutAmount === pack.dollars ? (
                  <Loader2 size={16} className="labs-spinner" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            ))}
          </div>
        </section>

        <div className="labs-profile-actions">
          <button className="labs-profile-signout" type="button" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
