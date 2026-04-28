import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import ProfileModal from '@/components/auth/ProfileModal';
import { publicLabsApps } from '@/lib/labsCatalog';

function AppStatus() {
  return (
    <div className="labs-status">
      <span className="labs-status__dot" />
      <span>{publicLabsApps.length} live tools</span>
    </div>
  );
}

export function LabsChrome({ active, children }) {
  const { credits, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [openProfileAfterAuth, setOpenProfileAfterAuth] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !openProfileAfterAuth) return;
    setShowAuthModal(false);
    setShowProfileModal(true);
    setOpenProfileAfterAuth(false);
  }, [isAuthenticated, openProfileAfterAuth]);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setShowProfileModal(true);
      return;
    }

    setShowAuthModal(true);
    setOpenProfileAfterAuth(true);
  };

  return (
    <div className="labs-site">
      <div className="labs-bg-grid" />
      <header className="labs-topnav">
        <div className="container labs-topnav__inner">
          <Link to="/" className="labs-logo">
            <span className="labs-logo__mark">
              tsh<span>*</span>
            </span>
            <span>That Software House</span>
            <span className="labs-logo__sep">/</span>
            <span className="labs-logo__labs">Labs</span>
          </Link>

          <nav className="labs-navlinks">
            <NavLink to="/" className={active === 'home' ? 'active' : ''}>
              <span className="num">01</span>
              <span>Landing</span>
            </NavLink>
            <NavLink to="/showcase" className={active === 'showcase' ? 'active' : ''}>
              <span className="num">02</span>
              <span>Showcase</span>
            </NavLink>
          </nav>

          <div className="labs-topnav__meta">
            <AppStatus />
            {isAuthenticated && (
              <span className="labs-credit-chip">
                {Number.parseInt(String(credits?.balance ?? 0), 10).toLocaleString()} credits
              </span>
            )}
            <button type="button" className="labs-meta-link labs-meta-button" onClick={handleProfileClick}>
              Profile
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
      <footer className="labs-footer">
        <div className="container labs-footer__grid">
          <div>
            <div className="labs-logo labs-logo--footer">
              <span className="labs-logo__mark">
                tsh<span>*</span>
              </span>
              <span>That Software House</span>
              <span className="labs-logo__sep">/</span>
              <span className="labs-logo__labs">Labs</span>
            </div>
            <p className="labs-footer__copy">
              Public AI utilities shipped from the bench. Built for operators, creators, and teams
              who need practical tools more than platform theater.
            </p>
          </div>

          <div>
            <h4>Tools</h4>
            <ul>
              {publicLabsApps.slice(0, 4).map((app) => (
                <li key={app.id}>
                  <Link to={`/app/${app.id}`}>{app.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Routes</h4>
            <ul>
              <li>
                <Link to="/">Landing</Link>
              </li>
              <li>
                <Link to="/showcase">Showcase</Link>
              </li>
              <li>
                <Link to="/login">Auth</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Signal</h4>
            <ul>
              <li>No sign-up required to browse</li>
              <li>Auth only when a tool needs it</li>
              <li>Powered by the local Express API</li>
            </ul>
          </div>
        </div>

        <div className="container labs-footer__bottom">
          <span>© 2026 THAT SOFTWARE HOUSE</span>
          <span>LABS-TSH PUBLIC SHELL</span>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onAuthenticated={() => {
          if (openProfileAfterAuth) {
            setShowProfileModal(true);
            setOpenProfileAfterAuth(false);
          }
        }}
        onClose={() => {
          setShowAuthModal(false);
          if (!isAuthenticated) setOpenProfileAfterAuth(false);
        }}
      />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
