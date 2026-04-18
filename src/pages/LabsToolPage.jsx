import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LabsChrome } from '@/components/labs/LabsShell';
import { findLabApp } from '@/lib/labsCatalog';
import { useSEO } from '@/hooks/useSEO';
import ContentForgeApp from '@/components/apps/ContentForgeApp';
import DataInsightsApp from '@/components/apps/DataInsightsApp';
import DocAnalyzerApp from '@/components/apps/DocAnalyzerApp';
import InvoiceChaserApp from '@/components/apps/InvoiceChaserApp';
import LeadFlowApp from '@/components/apps/LeadFlowApp';
import TextCleanerApp from '@/components/apps/TextCleanerApp';
import ToneConverterApp from '@/components/apps/ToneConverterApp';
import VideoAnalyzerApp from '@/components/apps/VideoAnalyzerApp';

const toolRegistry = {
  contentforge: ContentForgeApp,
  datainsights: DataInsightsApp,
  docanalyzer: DocAnalyzerApp,
  invoicechaser: InvoiceChaserApp,
  leadflow: LeadFlowApp,
  textcleaner: TextCleanerApp,
  toneconverter: ToneConverterApp,
  videoanalyzer: VideoAnalyzerApp,
};

export default function LabsToolPage() {
  const { projectId } = useParams();
  const app = findLabApp(projectId);

  if (!app) {
    return <Navigate to="/showcase" replace />;
  }

  const ToolComponent = toolRegistry[app.id];

  useSEO({
    title: `${app.name} | TSH Labs`,
    description: app.blurb,
    canonicalUrl: `https://labs.thatsoftwarehouse.com/app/${app.id}`,
  });

  return (
    <LabsChrome active="showcase">
      <section className="labs-app-header">
        <div className="container">
          <div className="labs-app-breadcrumbs">
            <Link to="/">Labs</Link>
            <span>/</span>
            <Link to="/showcase">Showcase</Link>
            <span>/</span>
            <span>{app.name}</span>
          </div>

          <Link to="/showcase" className="labs-backlink">
            <ArrowLeft size={16} />
            Back to gallery
          </Link>

          <div className="labs-app-header__grid">
            <div>
              <div className="labs-app-header__meta">
                <span className="labs-pill labs-pill--live">{app.status}</span>
                <span className="labs-label">{app.category}</span>
                {app.authRequired && <span className="labs-pill labs-pill--beta">auth-aware</span>}
              </div>

              <div className="labs-label">{app.tag}</div>
              <h1 className="labs-display labs-display--app">{app.name}</h1>
              <p className="labs-app-header__lede">{app.headline}</p>
              <p className="labs-app-header__subhead">{app.subhead}</p>

              <div className="labs-app-stats">
                {app.stats.map(([big, small]) => (
                  <div key={small}>
                    <div className="labs-display labs-display--metric">{big}</div>
                    <div className="labs-label">{small}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="labs-app-sidecar">
              <section className="labs-panel">
                <div className="labs-panel__header">
                  <span>// MANIFEST</span>
                  <span>{app.id.toUpperCase()}</span>
                </div>
                <div className="labs-panel__body labs-panel__manifest">
                  {app.manifest.map(([key, value]) => (
                    <div key={key}>
                      <span>{key}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="labs-panel">
                <div className="labs-panel__header">
                  <span>// ACCESS MODEL</span>
                  <span>{app.authRequired ? 'HYBRID' : 'OPEN'}</span>
                </div>
                <div className="labs-panel__body">
                  <p className="labs-side-note">
                    {app.authRequired
                      ? 'Browse publicly, then sign in only when you need persistence, uploads, or premium paths inside the tool.'
                      : 'This tool works as a public utility. Guest usage still respects the shared daily AI quota.'}
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <section className="labs-tool-stage">
        <div className="container">
          <div className="labs-tool-surface">{ToolComponent ? <ToolComponent /> : null}</div>
        </div>
      </section>
    </LabsChrome>
  );
}

