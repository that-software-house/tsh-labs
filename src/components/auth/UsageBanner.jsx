import React, { useEffect, useState } from 'react';
import { Zap, LogOut, User, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createBillingPortalSession, createInvoiceChaserCheckout } from '@/services/openai';
import AuthModal from './AuthModal';
import './UsageBanner.css';

const UsageBanner = () => {
  const {
    user,
    usage,
    signOut,
    isAuthenticated,
    isPremium,
    hasInvoiceChaserUnlimited,
    refreshUserProfile,
  } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [billingError, setBillingError] = useState('');

  const usagePercent = (usage.used / usage.limit) * 100;
  const isLow = usage.remaining <= 3;
  const isExhausted = usage.remaining === 0;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const billingState = searchParams.get('billing');
    if (billingState !== 'success') return;

    refreshUserProfile().catch(() => {});
    searchParams.delete('billing');
    const nextQuery = searchParams.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash || ''}`;
    window.history.replaceState({}, '', nextUrl);
  }, [refreshUserProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleStartUpgrade = async () => {
    setBillingError('');
    setIsStartingCheckout(true);

    try {
      const response = await createInvoiceChaserCheckout();
      const checkoutUrl = response?.checkoutUrl || '';
      if (!checkoutUrl) {
        throw new Error('Stripe checkout URL was not returned');
      }
      window.location.assign(checkoutUrl);
    } catch (err) {
      setBillingError(err.message || 'Could not start checkout');
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const handleOpenPortal = async () => {
    setBillingError('');
    setIsOpeningPortal(true);

    try {
      const response = await createBillingPortalSession();
      const portalUrl = response?.portalUrl || '';
      if (!portalUrl) {
        throw new Error('Billing portal URL was not returned');
      }
      window.location.assign(portalUrl);
    } catch (err) {
      setBillingError(err.message || 'Could not open billing portal');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <>
      <div className={`usage-banner ${isExhausted ? 'exhausted' : isLow ? 'low' : ''}`}>
        <div className="usage-banner-content">
          <div className="usage-info">
            <Zap size={16} />
            <span className="usage-text">
              <strong>{usage.remaining}</strong> of {usage.limit} requests remaining today
              {hasInvoiceChaserUnlimited ? ' • Invoice uploads: unlimited' : ''}
            </span>
            {isPremium && (
              <span className="premium-badge">
                <Crown size={12} />
                Premium
              </span>
            )}
            {!isPremium && hasInvoiceChaserUnlimited && (
              <span className="premium-badge">
                <Crown size={12} />
                InvoiceChaser Pro
              </span>
            )}
          </div>

          <div className="usage-bar">
            <div
              className="usage-bar-fill"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="usage-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User size={16} />
                <span>{user.email?.split('@')[0]}</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-email">{user.email}</span>
                    {isPremium ? (
                      <span className="tier-badge premium">Premium</span>
                    ) : hasInvoiceChaserUnlimited ? (
                      <span className="tier-badge premium">InvoiceChaser Pro</span>
                    ) : (
                      <span className="tier-badge free">Free Tier</span>
                    )}
                  </div>
                  {hasInvoiceChaserUnlimited ? (
                    <button
                      className="user-dropdown-item"
                      onClick={handleOpenPortal}
                      disabled={isOpeningPortal}
                    >
                      {isOpeningPortal ? (
                        <>
                          <Loader2 size={16} className="usage-spinner" />
                          Opening billing...
                        </>
                      ) : (
                        <>
                          <Crown size={16} />
                          Manage billing
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="user-dropdown-item user-dropdown-item-upgrade"
                      onClick={handleStartUpgrade}
                      disabled={isStartingCheckout}
                    >
                      {isStartingCheckout ? (
                        <>
                          <Loader2 size={16} className="usage-spinner" />
                          Starting checkout...
                        </>
                      ) : (
                        <>
                          <Crown size={16} />
                          Upgrade: $29/mo
                        </>
                      )}
                    </button>
                  )}
                  <button className="user-dropdown-item" onClick={handleSignOut}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                  {billingError && <p className="billing-error">{billingError}</p>}
                </div>
              )}
            </div>
          ) : (
            <button
              className="usage-signin-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Sign in for more
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default UsageBanner;
