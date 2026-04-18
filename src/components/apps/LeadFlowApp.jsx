import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Mail, MessageCircle, FileText, Users, TrendingUp,
  Trophy, Target, RefreshCw, ArrowRight, Flame, Clock,
  DollarSign, User, Building2, Phone, AtSign, Zap, GripVertical
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { extractLead } from '@/services/openai';
import { supabase } from '@/lib/supabase';
import './LeadFlowApp.css';

const STAGES = [
  { id: 'new', label: 'New', icon: Target, color: '#3b82f6' },
  { id: 'qualified', label: 'Qualified', icon: TrendingUp, color: '#8b5cf6' },
  { id: 'proposal', label: 'Proposal', icon: FileText, color: '#f59e0b' },
  { id: 'won', label: 'Won', icon: Trophy, color: '#10b981' },
];

const SOURCE_ICONS = {
  email: Mail,
  dm: MessageCircle,
  form: FileText,
};

const URGENCY_CONFIG = {
  high: { label: 'High', color: '#ef4444', bg: '#fef2f2' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#6b7280', bg: '#f9fafb' },
};

const SAMPLE_LEADS = [
  {
    id: 's1', name: 'Sarah Chen', company: 'TechStart Inc', email: 'sarah@techstart.io',
    channel: 'email', intent: 'Custom web app for inventory management', urgency: 'high',
    deal_size: 15000, suggested_action: 'Schedule discovery call', stage: 'new',
    raw_text: 'Hi, we\'re a growing e-commerce startup and desperately need a custom inventory management system. Our current spreadsheet setup is falling apart at 500+ SKUs. Budget is around $15K. Can we chat this week?',
  },
  {
    id: 's2', name: 'Mark Torres', company: 'BuildRight Co', email: null,
    channel: 'dm', intent: 'Mobile app for contractor scheduling', urgency: 'medium',
    deal_size: 8000, suggested_action: 'Send portfolio examples', stage: 'new',
    raw_text: 'hey saw your work on that construction management app. we need something similar for our crew scheduling. nothing too crazy, maybe 8k budget? lmk',
  },
  {
    id: 's3', name: 'James Rivera', company: 'Acme Legal', email: 'jrivera@acmelegal.com',
    channel: 'form', intent: 'Case management system with client portal', urgency: 'high',
    deal_size: 25000, suggested_action: 'Schedule discovery call', stage: 'qualified',
    raw_text: 'We are a mid-size law firm looking for a custom case management solution with a secure client portal. We need document sharing, deadline tracking, and billing integration. Timeline: 3 months.',
  },
  {
    id: 's4', name: 'Priya Patel', company: 'GreenLeaf Cafe', email: 'priya@greenleafcafe.com',
    channel: 'email', intent: 'Online ordering system', urgency: 'medium',
    deal_size: 5000, suggested_action: 'Send pricing options', stage: 'new',
    raw_text: 'Hello! We run a small cafe chain (3 locations) and need an online ordering system. We\'ve been using DoorDash but the fees are killing us. Looking for something custom.',
  },
  {
    id: 's5', name: 'Lisa Kim', company: 'PixelPerfect Studio', email: null,
    channel: 'dm', intent: 'Portfolio website redesign', urgency: 'low',
    deal_size: 3500, suggested_action: 'Share design process overview', stage: 'qualified',
    raw_text: 'love your design work! thinking about redoing our studio website. nothing urgent, maybe Q2? what would something like that run?',
  },
  {
    id: 's6', name: 'David Kim', company: 'Kim & Associates CPA', email: 'dkim@kimcpa.com',
    channel: 'form', intent: 'Client portal for document exchange', urgency: 'high',
    deal_size: 12000, suggested_action: 'Schedule demo of similar project', stage: 'proposal',
    raw_text: 'CPA firm with 200+ clients. We need a secure portal where clients can upload tax documents, we can share returns, and track signatures. Must be SOC 2 compliant.',
  },
  {
    id: 's7', name: 'Alex Morgan', company: 'FitTrack', email: 'alex@fittrack.app',
    channel: 'email', intent: 'Fitness tracking MVP', urgency: 'high',
    deal_size: 20000, suggested_action: 'Schedule technical scoping', stage: 'proposal',
    raw_text: 'We have $50K in pre-seed funding and need an MVP for our AI fitness tracking app. Core features: workout logging, AI form analysis from video, progress tracking. Need it in 8 weeks.',
  },
  {
    id: 's8', name: 'Rachel Santos', company: 'Bloom Events', email: null,
    channel: 'dm', intent: 'Event management platform', urgency: 'medium',
    deal_size: 9000, suggested_action: 'Send case study', stage: 'new',
    raw_text: 'hi! we do wedding planning and events. need a way to manage vendor contacts, timelines, and client communication all in one place. tired of juggling 5 different apps 😩',
  },
  {
    id: 's9', name: 'Tom Nguyen', company: 'QuickShip Logistics', email: 'tom@quickship.co',
    channel: 'form', intent: 'Fleet tracking dashboard', urgency: 'medium',
    deal_size: 18000, suggested_action: 'Schedule discovery call', stage: 'qualified',
    raw_text: 'Small logistics company, 25 vehicles. Need real-time GPS tracking dashboard, route optimization, and driver communication. Currently using paper logs.',
  },
  {
    id: 's10', name: 'Emma Watson', company: 'PetPals Vet', email: 'emma@petpalsvet.com',
    channel: 'email', intent: 'Appointment booking system', urgency: 'low',
    deal_size: 4000, suggested_action: 'Send pricing options', stage: 'new',
    raw_text: 'Our vet clinic needs an online booking system. Clients should be able to see available slots, book appointments, and get reminders. We have 3 vets.',
  },
  {
    id: 's11', name: 'Carlos Mendez', company: 'Mendez Realty', email: 'carlos@mendezrealty.com',
    channel: 'email', intent: 'Property listing website', urgency: 'high',
    deal_size: 7500, suggested_action: 'Schedule discovery call', stage: 'won',
    raw_text: 'Real estate agent looking for a custom property listing site with MLS integration, virtual tour embedding, and lead capture forms. Need it looking premium.',
  },
  {
    id: 's12', name: 'Nina Popov', company: 'ArtSpace Gallery', email: null,
    channel: 'dm', intent: 'Online gallery and e-commerce', urgency: 'low',
    deal_size: 6000, suggested_action: 'Share portfolio of e-commerce work', stage: 'won',
    raw_text: 'we run a contemporary art gallery and want to sell prints online. need beautiful product pages, artist profiles, and secure checkout. vibe is very minimal and clean',
  },
];

const LeadFlowApp = () => {
  const [activeTab, setActiveTab] = useState('demo');
  const [simulationLeads, setSimulationLeads] = useState([]);
  const [processingLeadId, setProcessingLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [sourceType, setSourceType] = useState('email');
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedLead, setExtractedLead] = useState(null);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userLeads, setUserLeads] = useState([]);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const simulationIndex = useRef(0);
  const simulationTimer = useRef(null);

  const { user, isAuthenticated } = useAuth();

  useSEO({
    title: 'LeadFlow AI - Lightweight AI CRM | Auto-Capture Leads',
    description: 'AI-powered CRM that auto-captures leads from email, web forms, and social DMs. Zero manual data entry. Built for freelancers and solopreneurs.',
    keywords: 'AI CRM, lead capture, auto CRM, lightweight CRM, freelancer CRM, solopreneur CRM, AI lead extraction, lead management',
    canonicalUrl: 'https://labs.thatsoftwarehouse.com/leadflow',
    openGraph: {
      title: 'LeadFlow AI - Your Leads Find You',
      description: 'AI-powered CRM that auto-captures leads from email, forms, and social DMs with zero manual data entry.',
      type: 'website',
      url: 'https://labs.thatsoftwarehouse.com/leadflow',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'LeadFlow AI',
      description: 'AI-powered lightweight CRM that auto-captures leads from email, web forms, and social DMs.',
      url: 'https://labs.thatsoftwarehouse.com/leadflow',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  });

  // Fetch user leads from Supabase
  const fetchUserLeads = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const { data, error: fetchErr } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (fetchErr) throw fetchErr;
      setUserLeads(data || []);
    } catch {
      // Silently fail — table may not exist yet
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchUserLeads();
  }, [fetchUserLeads]);

  // Simulation: stream leads in one by one
  useEffect(() => {
    if (activeTab !== 'demo') {
      if (simulationTimer.current) clearInterval(simulationTimer.current);
      return;
    }

    // Reset simulation
    setSimulationLeads([]);
    simulationIndex.current = 0;
    setProcessingLeadId(null);
    setSelectedLead(null);

    // Add first lead immediately
    const firstLead = SAMPLE_LEADS[0];
    setProcessingLeadId(firstLead.id);
    setTimeout(() => {
      setSimulationLeads([firstLead]);
      setProcessingLeadId(null);
      simulationIndex.current = 1;
    }, 800);

    simulationTimer.current = setInterval(() => {
      if (simulationIndex.current >= SAMPLE_LEADS.length) {
        clearInterval(simulationTimer.current);
        return;
      }

      const lead = SAMPLE_LEADS[simulationIndex.current];
      setProcessingLeadId(lead.id);

      setTimeout(() => {
        setSimulationLeads((prev) => [...prev, lead]);
        setProcessingLeadId(null);
      }, 800);

      simulationIndex.current += 1;
    }, 2500);

    return () => {
      if (simulationTimer.current) clearInterval(simulationTimer.current);
    };
  }, [activeTab]);

  // Compute pipeline stats
  const getStats = (leads) => {
    const total = leads.length;
    const hot = leads.filter((l) => l.urgency === 'high').length;
    const pipeline = leads.reduce((sum, l) => sum + (l.deal_size || 0), 0);
    return { total, hot, pipeline };
  };

  const getLeadsByStage = (leads, stage) => leads.filter((l) => l.stage === stage);

  const handleExtract = async () => {
    if (!inputText.trim()) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsExtracting(true);
    setError('');
    setExtractedLead(null);

    try {
      const lead = await extractLead(inputText, sourceType);
      setExtractedLead(lead);

      // Save to Supabase
      try {
        const { error: insertErr } = await supabase.from('leads').insert({
          user_id: user.id,
          name: lead.name || null,
          company: lead.company || null,
          email: lead.email || null,
          phone: lead.phone || null,
          channel: sourceType,
          intent: lead.intent || null,
          urgency: lead.urgency || 'medium',
          deal_size: lead.deal_size || null,
          suggested_action: lead.suggested_action || null,
          summary: lead.summary || null,
          raw_text: inputText,
          stage: 'new',
        });
        if (!insertErr) fetchUserLeads();
      } catch {
        // Lead extracted but save failed — still show result
      }
    } catch (err) {
      setError(err.message || 'Failed to extract lead. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDragStart = (lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = async (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedLead || draggedLead.stage === stageId) {
      setDraggedLead(null);
      return;
    }

    // Optimistic update
    setUserLeads((prev) =>
      prev.map((l) => (l.id === draggedLead.id ? { ...l, stage: stageId } : l))
    );

    try {
      await supabase.from('leads').update({ stage: stageId }).eq('id', draggedLead.id);
    } catch {
      // Revert on failure
      fetchUserLeads();
    }

    setDraggedLead(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const simStats = getStats(simulationLeads);
  const userStats = getStats(userLeads);

  return (
    <article className="leadflow-app">
      <header className="leadflow-header">
        <div className="leadflow-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>AI-Powered CRM</span>
        </div>
        <h1>LeadFlow AI</h1>
        <p>Your leads find you. Your CRM builds itself.</p>
      </header>

      {/* Tab Bar */}
      <div className="leadflow-tabs">
        <button
          className={`leadflow-tab ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          <Zap size={16} />
          Live Demo
        </button>
        <button
          className={`leadflow-tab ${activeTab === 'tryit' ? 'active' : ''}`}
          onClick={() => setActiveTab('tryit')}
        >
          <Sparkles size={16} />
          Try It Yourself
        </button>
      </div>

      {/* Demo Tab */}
      {activeTab === 'demo' && (
        <section className="leadflow-demo" aria-label="Live demo">
          {/* Stats Bar */}
          <div className="leadflow-stats-bar">
            <div className="leadflow-stat">
              <Users size={16} />
              <span className="leadflow-stat-value">{simStats.total}</span>
              <span className="leadflow-stat-label">Leads</span>
            </div>
            <div className="leadflow-stat">
              <Flame size={16} />
              <span className="leadflow-stat-value">{simStats.hot}</span>
              <span className="leadflow-stat-label">Hot</span>
            </div>
            <div className="leadflow-stat">
              <DollarSign size={16} />
              <span className="leadflow-stat-value">${(simStats.pipeline / 1000).toFixed(0)}K</span>
              <span className="leadflow-stat-label">Pipeline</span>
            </div>
          </div>

          <div className="leadflow-demo-layout">
            {/* Incoming Feed */}
            <div className="leadflow-feed">
              <h2 className="leadflow-section-title">
                <Mail size={18} />
                Incoming
              </h2>
              <div className="leadflow-feed-list">
                {/* Processing indicator */}
                <AnimatePresence>
                  {processingLeadId && (
                    <motion.div
                      className="leadflow-processing"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Sparkles size={16} className="leadflow-sparkle-spin" />
                      <span>AI processing lead...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {[...simulationLeads].reverse().map((lead) => {
                    const SourceIcon = SOURCE_ICONS[lead.channel] || Mail;
                    const urgency = URGENCY_CONFIG[lead.urgency] || URGENCY_CONFIG.medium;
                    return (
                      <motion.div
                        key={lead.id}
                        className={`leadflow-feed-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                      >
                        <div className="leadflow-feed-card-row">
                          <div className="leadflow-feed-icon">
                            <SourceIcon size={16} />
                          </div>
                          <div className="leadflow-feed-info">
                            <span className="leadflow-feed-name">{lead.name}</span>
                            <span className="leadflow-feed-company">{lead.company}</span>
                          </div>
                          <span
                            className="leadflow-urgency-dot"
                            style={{ background: urgency.color }}
                            title={`${urgency.label} urgency`}
                          />
                        </div>
                        <p className="leadflow-feed-intent">{lead.intent}</p>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {selectedLead?.id === lead.id && (
                            <motion.div
                              className="leadflow-feed-detail"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="leadflow-detail-raw">
                                <span className="leadflow-detail-label">Original message:</span>
                                <p>{lead.raw_text}</p>
                              </div>
                              <div className="leadflow-detail-fields">
                                {lead.email && (
                                  <div className="leadflow-detail-field">
                                    <AtSign size={12} /> {lead.email}
                                  </div>
                                )}
                                <div className="leadflow-detail-field">
                                  <DollarSign size={12} /> ${lead.deal_size?.toLocaleString()}
                                </div>
                                <div className="leadflow-detail-field">
                                  <ArrowRight size={12} /> {lead.suggested_action}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Kanban Pipeline */}
            <div className="leadflow-pipeline">
              <h2 className="leadflow-section-title">
                <TrendingUp size={18} />
                Pipeline
              </h2>
              <div className="leadflow-kanban">
                {STAGES.map((stage) => {
                  const StageIcon = stage.icon;
                  const stageLeads = getLeadsByStage(simulationLeads, stage.id);
                  return (
                    <div key={stage.id} className="leadflow-kanban-col">
                      <div className="leadflow-kanban-header" style={{ borderColor: stage.color }}>
                        <StageIcon size={14} style={{ color: stage.color }} />
                        <span>{stage.label}</span>
                        <span className="leadflow-kanban-count">{stageLeads.length}</span>
                      </div>
                      <div className="leadflow-kanban-cards">
                        <AnimatePresence>
                          {stageLeads.map((lead) => (
                            <motion.div
                              key={lead.id}
                              className="leadflow-kanban-card"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              layout
                            >
                              <span className="leadflow-kanban-card-name">{lead.name}</span>
                              <span className="leadflow-kanban-card-company">{lead.company}</span>
                              <span className="leadflow-kanban-card-deal">${lead.deal_size?.toLocaleString()}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Try It Tab */}
      {activeTab === 'tryit' && (
        <section className="leadflow-tryit" aria-label="Try it yourself">
          <div className="leadflow-tryit-input-area">
            <div className="leadflow-source-selector">
              <span className="leadflow-source-label">Source:</span>
              {Object.entries(SOURCE_ICONS).map(([type, Icon]) => (
                <button
                  key={type}
                  className={`leadflow-source-btn ${sourceType === type ? 'active' : ''}`}
                  onClick={() => setSourceType(type)}
                >
                  <Icon size={16} />
                  {type === 'email' ? 'Email' : type === 'dm' ? 'DM' : 'Form'}
                </button>
              ))}
            </div>

            <textarea
              className="leadflow-textarea"
              placeholder={
                sourceType === 'email'
                  ? 'Paste an email from a potential client...\n\nExample: "Hi, we\'re looking for a developer to build a custom inventory app. Budget is $15K. Can we set up a call?"'
                  : sourceType === 'dm'
                  ? 'Paste a DM from Instagram, Twitter, or LinkedIn...\n\nExample: "hey saw your work, we need a mobile app for our team. lmk if you\'re available"'
                  : 'Paste a form submission...\n\nExample: "Name: John Smith, Company: Acme Corp, Need: Custom CRM system, Budget: $20,000"'
              }
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError('');
              }}
              aria-label="Paste lead text"
            />

            <button
              className="leadflow-btn leadflow-btn-primary"
              onClick={handleExtract}
              disabled={!inputText.trim() || isExtracting}
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={18} className="leadflow-spinner" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Extract Lead
                </>
              )}
            </button>
          </div>

          {/* Extracted Result */}
          <AnimatePresence>
            {extractedLead && (
              <motion.div
                className="leadflow-result-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="leadflow-result-header">
                  <Sparkles size={16} />
                  <span>Lead Extracted</span>
                </div>
                <div className="leadflow-result-fields">
                  {extractedLead.name && (
                    <div className="leadflow-result-field">
                      <User size={14} />
                      <span className="leadflow-result-label">Name</span>
                      <span className="leadflow-result-value">{extractedLead.name}</span>
                    </div>
                  )}
                  {extractedLead.company && (
                    <div className="leadflow-result-field">
                      <Building2 size={14} />
                      <span className="leadflow-result-label">Company</span>
                      <span className="leadflow-result-value">{extractedLead.company}</span>
                    </div>
                  )}
                  {extractedLead.email && (
                    <div className="leadflow-result-field">
                      <AtSign size={14} />
                      <span className="leadflow-result-label">Email</span>
                      <span className="leadflow-result-value">{extractedLead.email}</span>
                    </div>
                  )}
                  {extractedLead.phone && (
                    <div className="leadflow-result-field">
                      <Phone size={14} />
                      <span className="leadflow-result-label">Phone</span>
                      <span className="leadflow-result-value">{extractedLead.phone}</span>
                    </div>
                  )}
                  {extractedLead.intent && (
                    <div className="leadflow-result-field">
                      <Target size={14} />
                      <span className="leadflow-result-label">Intent</span>
                      <span className="leadflow-result-value">{extractedLead.intent}</span>
                    </div>
                  )}
                  {extractedLead.urgency && (
                    <div className="leadflow-result-field">
                      <Flame size={14} />
                      <span className="leadflow-result-label">Urgency</span>
                      <span
                        className="leadflow-urgency-badge"
                        style={{
                          color: URGENCY_CONFIG[extractedLead.urgency]?.color,
                          background: URGENCY_CONFIG[extractedLead.urgency]?.bg,
                        }}
                      >
                        {URGENCY_CONFIG[extractedLead.urgency]?.label || extractedLead.urgency}
                      </span>
                    </div>
                  )}
                  {extractedLead.deal_size && (
                    <div className="leadflow-result-field">
                      <DollarSign size={14} />
                      <span className="leadflow-result-label">Est. Deal</span>
                      <span className="leadflow-result-value">${extractedLead.deal_size.toLocaleString()}</span>
                    </div>
                  )}
                  {extractedLead.suggested_action && (
                    <div className="leadflow-result-field">
                      <ArrowRight size={14} />
                      <span className="leadflow-result-label">Next Step</span>
                      <span className="leadflow-result-value">{extractedLead.suggested_action}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User's Pipeline */}
          {isAuthenticated && userLeads.length > 0 && (
            <div className="leadflow-user-pipeline">
              <div className="leadflow-user-pipeline-header">
                <h2 className="leadflow-section-title">
                  <TrendingUp size={18} />
                  Your Pipeline
                </h2>
                <div className="leadflow-stats-bar leadflow-stats-bar-compact">
                  <div className="leadflow-stat">
                    <Users size={14} />
                    <span className="leadflow-stat-value">{userStats.total}</span>
                  </div>
                  <div className="leadflow-stat">
                    <DollarSign size={14} />
                    <span className="leadflow-stat-value">${(userStats.pipeline / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
              <div className="leadflow-kanban">
                {STAGES.map((stage) => {
                  const StageIcon = stage.icon;
                  const stageLeads = getLeadsByStage(userLeads, stage.id);
                  return (
                    <div
                      key={stage.id}
                      className={`leadflow-kanban-col ${dragOverStage === stage.id ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, stage.id)}
                      onDrop={(e) => handleDrop(e, stage.id)}
                      onDragLeave={() => setDragOverStage(null)}
                    >
                      <div className="leadflow-kanban-header" style={{ borderColor: stage.color }}>
                        <StageIcon size={14} style={{ color: stage.color }} />
                        <span>{stage.label}</span>
                        <span className="leadflow-kanban-count">{stageLeads.length}</span>
                      </div>
                      <div className="leadflow-kanban-cards">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="leadflow-kanban-card draggable"
                            draggable
                            onDragStart={() => handleDragStart(lead)}
                            onDragEnd={handleDragEnd}
                          >
                            <GripVertical size={12} className="leadflow-grip" />
                            <span className="leadflow-kanban-card-name">{lead.name}</span>
                            <span className="leadflow-kanban-card-company">{lead.company}</span>
                            {lead.deal_size && (
                              <span className="leadflow-kanban-card-deal">${lead.deal_size.toLocaleString()}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Error */}
      {error && (
        <div className="leadflow-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss error">&times;</button>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </article>
  );
};

export default LeadFlowApp;
