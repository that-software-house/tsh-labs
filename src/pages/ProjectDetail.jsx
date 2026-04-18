import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Bot } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { projects } from '../lib/projects';
import ContentForgeApp from '../components/apps/ContentForgeApp';
import DocAnalyzerApp from '../components/apps/DocAnalyzerApp';
import DataInsightsApp from '../components/apps/DataInsightsApp';
import TextCleanerApp from '../components/apps/TextCleanerApp';
import ToneConverterApp from '../components/apps/ToneConverterApp';
import InvoiceChaserApp from '../components/apps/InvoiceChaserApp';
import MusicStatsApp from '../components/apps/MusicStatsApp';
import LeadFlowApp from '../components/apps/LeadFlowApp';
import VideoAnalyzerApp from '../components/apps/VideoAnalyzerApp';
import UsageBanner from '../components/auth/UsageBanner';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const initialAppId = project?.apps?.[0]?.id || null;
  const [activeApp, setActiveApp] = useState(initialAppId);
  const siteUrl = 'https://thatsoftwarehouse.com';

  const seoTitle = project
    ? `${project.title} | That Software House`
    : 'Project Not Found | That Software House';

  const seoDescription = project
    ? project.description
    : "The project you're looking for does not exist.";

  const seoUrl = project
    ? `${siteUrl}/vault/${project.id}`
    : `${siteUrl}/vault`;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: project?.tags?.join(', ') || 'AI projects, software tools, That Software House',
    canonicalUrl: seoUrl,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      url: seoUrl,
    },
  });

  useEffect(() => {
    setActiveApp(project?.apps?.[0]?.id || null);
  }, [project?.id]);

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="project-not-found">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist.</p>
          <Link to="/" className="back-link">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Render the active app component
  const renderAppContent = () => {
    if (!activeApp) {
      return (
        <div className="coming-soon-app">
          <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
          <h3>App coming soon</h3>
          <p>We&apos;re preparing this experience. Check back shortly.</p>
        </div>
      );
    }

    switch (project.id) {
      case 'contentforge':
        return <ContentForgeApp />;
      case 'aiassistant':
        return (
          <div className="coming-soon-app">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3>AI Assistant</h3>
            <p>This app is coming soon. Stay tuned!</p>
          </div>
        );
      case 'docanalyzer':
        return <DocAnalyzerApp />;
      case 'datainsights':
        return <DataInsightsApp />;
      case 'textcleaner':
        return <TextCleanerApp />;
      case 'toneconverter':
        return <ToneConverterApp />;
      case 'invoicechaser':
        return <InvoiceChaserApp />;
      case 'musicstats':
        return <MusicStatsApp />;
      case 'leadflow':
        return <LeadFlowApp />;
      case 'videoanalyzer':
        return <VideoAnalyzerApp />;
      default:
        return null;
    }
  };

  // Check if this project uses AI features (needs usage banner)
  const usesAI = ['contentforge', 'docanalyzer', 'datainsights', 'toneconverter', 'invoicechaser', 'leadflow', 'videoanalyzer'].includes(project.id);

  return (
    <div className="project-detail-page">
      {/* Back Navigation */}
      <nav className="project-detail-nav">
        <Link to="/" className="back-link">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </nav>

      {/* Usage Banner for AI-powered projects */}
      {usesAI && <UsageBanner />}

      {/* Active App Content */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="project-app-content-section"
      >
        <div className="project-app-content-container">
          {renderAppContent()}
        </div>
      </motion.section>
    </div>
  );
}

export default ProjectDetail;
