import React from 'react';
import { Link } from 'react-router-dom';
import { LabsChrome } from '@/components/labs/LabsShell';
import { usePublicLabsApps } from '@/hooks/usePublicLabsApps';
import { useSEO } from '@/hooks/useSEO';

function StatusPanel({ apps }) {
  const featured = apps.slice(0, 5);

  return (
    <div className="labs-status-stack">
      <section className="labs-panel">
        <div className="labs-panel__header">
          <span>// SIGNAL - LAB STATUS</span>
          <span>Q2 2026</span>
        </div>
        <div className="labs-panel__body">
          <div className="labs-panel__headline">
            <span className="labs-panel__label">Now shipping</span>
            <span className="labs-pill labs-pill--live">Open</span>
          </div>
          <div className="labs-display labs-display--lg">
            {apps.length} <em>public tools</em>
          </div>
          <div className="labs-microgrid">
            <span>auth only when needed</span>
            <span>guest quota active</span>
          </div>
          <div className="labs-log">
            {featured.map((app) => (
              <div key={app.id} className="labs-log__row">
                <span>{app.num}</span>
                <span>{app.id}</span>
                <span>{app.tag}</span>
                <span className={`labs-pill ${app.authRequired ? 'labs-pill--beta' : 'labs-pill--live'}`}>
                  {app.authRequired ? 'AUTH' : 'OPEN'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="labs-mini-stats">
        {[
          [String(apps.length), 'apps live'],
          ['10/day', 'guest AI runs'],
          ['0', 'accounts needed to browse'],
        ].map(([big, small]) => (
          <div key={small}>
            <div className="labs-display labs-display--md">{big}</div>
            <div className="labs-label">{small}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function LabsLanding() {
  const publicLabsApps = usePublicLabsApps();
  const featured = publicLabsApps.filter((app) => app.featured).slice(0, 3);

  useSEO({
    title: 'TSH Labs',
    description:
      'Public AI utilities from That Software House. Browse the lab, explore the tools, and open each app without a mandatory sign-up wall.',
    canonicalUrl: 'https://labs.thatsoftwarehouse.com/',
    openGraph: {
      title: 'TSH Labs',
      description:
        'Public AI utilities from That Software House with landing, gallery, and individual app pages.',
      type: 'website',
      url: 'https://labs.thatsoftwarehouse.com/',
    },
  });

  return (
    <LabsChrome active="home">
      <section className="labs-hero">
        <div className="container labs-hero__grid">
          <div>
            <div className="labs-section-bracket">
              <span className="br">[</span>
              <span>01</span>
              <span className="br">]</span>
              <span>Public utilities from the bench</span>
            </div>

            <h1 className="labs-display labs-display--hero">
              Small AI tools, <em>shipped in public</em>.
            </h1>

            <div className="labs-hero__copy">
              <p>
                The Labs front door is now public. Browse every finished tool, open each app page,
                and only sign in when a workflow actually needs storage or premium access.
              </p>
              <p>
                This is the working surface for TSH experiments that graduated into usable utilities.
              </p>
            </div>

            <div className="labs-hero__actions">
              <Link to="/showcase" className="labs-button labs-button--primary">
                Browse the gallery <span>↗</span>
              </Link>
              <a href="#featured" className="labs-button">
                See featured tools <span>↓</span>
              </a>
            </div>

            <div className="labs-metrics-strip">
              <div>
                <strong>{publicLabsApps.length}</strong>
                <span>public apps</span>
              </div>
              <div>
                <strong>10/day</strong>
                <span>guest AI quota</span>
              </div>
              <div>
                <strong>Auth-on-demand</strong>
                <span>not route-gated</span>
              </div>
            </div>
          </div>

          <StatusPanel apps={publicLabsApps} />
        </div>
      </section>

      <section id="featured" className="labs-featured">
        <div className="container">
          <div className="labs-featured__header">
            <div>
              <div className="labs-section-bracket">
                <span className="br">[</span>
                <span>02</span>
                <span className="br">]</span>
                <span>Featured from the bench</span>
              </div>
              <h2 className="labs-display labs-display--section">
                Finished apps with <em>real workflows</em>.
              </h2>
            </div>
            <Link to="/showcase" className="labs-inline-link">
              View all {publicLabsApps.length} <span>↗</span>
            </Link>
          </div>

          <div className="labs-feature-grid">
            {featured.map((app) => (
              <Link key={app.id} to={`/app/${app.id}`} className="labs-feature-card">
                <div className="labs-feature-card__top">
                  <span className="labs-label labs-label--accent">LAB.{app.num}</span>
                  <span className="labs-pill labs-pill--live">{app.status}</span>
                </div>
                <div className="labs-label">{app.tag}</div>
                <h3 className="labs-display labs-display--card">{app.name}</h3>
                <p>{app.blurb}</p>
                <div className="labs-feature-card__bottom">
                  <div>
                    <div className="labs-display labs-display--metric">{app.users}</div>
                    <div className="labs-label">{app.usersLabel}</div>
                  </div>
                  <div className="labs-feature-card__meta">
                    <span>{app.price}</span>
                    <span>{app.social}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LabsChrome>
  );
}
