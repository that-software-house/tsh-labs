import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LabsChrome } from '@/components/labs/LabsShell';
import { publicLabsApps } from '@/lib/labsCatalog';
import { useSEO } from '@/hooks/useSEO';

const ALL = 'All';

export default function LabsShowcase() {
  const [filter, setFilter] = useState(ALL);

  const categories = useMemo(() => {
    const unique = new Set(publicLabsApps.map((app) => app.category));
    return [ALL, ...Array.from(unique)];
  }, []);

  const counts = useMemo(() => {
    const nextCounts = { [ALL]: publicLabsApps.length };
    publicLabsApps.forEach((app) => {
      nextCounts[app.category] = (nextCounts[app.category] || 0) + 1;
    });
    return nextCounts;
  }, []);

  const apps = useMemo(
    () => (filter === ALL ? publicLabsApps : publicLabsApps.filter((app) => app.category === filter)),
    [filter]
  );

  useSEO({
    title: 'TSH Labs Showcase',
    description:
      'Browse the public TSH Labs gallery of complete, usable AI tools across revenue, research, operations, analytics, and writing.',
    canonicalUrl: 'https://labs.thatsoftwarehouse.com/showcase',
  });

  return (
    <LabsChrome active="showcase">
      <section className="labs-page-hero">
        <div className="container">
          <div className="labs-section-bracket">
            <span className="br">[</span>
            <span>02</span>
            <span className="br">]</span>
            <span>The apps · {publicLabsApps.length.toString().padStart(2, '0')} total</span>
          </div>

          <div className="labs-page-hero__grid">
            <h1 className="labs-display labs-display--page">
              Every finished <em>utility</em> in the public lab.
            </h1>
            <div className="labs-page-hero__copy">
              <p>
                Only the complete tools make the gallery. Browse publicly, then drop into each app
                page for the full workflow.
              </p>
              <div className="labs-page-hero__meta">
                <span>free tools</span>
                <span>auth only when needed</span>
                <span>local API-backed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="labs-filter-bar">
        <div className="container labs-filter-bar__inner">
          <div className="labs-filter-group">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`labs-filter ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category}
                <span>{String(counts[category] || 0).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <div className="labs-filter-meta">
            <span>Sort: curated</span>
            <span>View: grid</span>
          </div>
        </div>
      </section>

      <section className="labs-showcase-grid">
        <div className="container">
          <div className="labs-card-grid">
            {apps.map((app) => (
              <Link key={app.id} to={`/app/${app.id}`} className="labs-card">
                <div className="labs-card__head">
                  <div>
                    <div className="labs-label labs-label--accent">LAB.{app.num}</div>
                    <div className="labs-label">{app.category}</div>
                  </div>
                  <span className="labs-pill labs-pill--live">{app.status}</span>
                </div>
                <div className="labs-label">{app.tag}</div>
                <h2 className="labs-display labs-display--card">{app.name}</h2>
                <p>{app.blurb}</p>
                <div className="labs-card__foot">
                  <div>
                    <div className="labs-display labs-display--metric">{app.users}</div>
                    <div className="labs-label">{app.usersLabel}</div>
                  </div>
                  <div className="labs-card__pricing">
                    <div>{app.price}</div>
                    <div>{app.social}</div>
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

