import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  CircleDollarSign, 
  FileText, 
  Video, 
  Sparkles, 
  Bot, 
  BarChart3, 
  Eraser, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const labsProjects = [
  {
    id: 'leadflow',
    title: 'LeadFlow AI',
    description: 'Auto-capture leads with zero manual data entry.',
    icon: Users,
    color: 'var(--accent)'
  },
  {
    id: 'invoicechaser',
    title: 'Invoice Chaser',
    description: 'Collections copilot for overdue accounts.',
    icon: CircleDollarSign,
    color: '#fb7185'
  },
  {
    id: 'docanalyzer',
    title: 'Document Analyzer',
    description: 'RAG-driven document intelligence.',
    icon: FileText,
    color: '#f87171'
  },
  {
    id: 'videoanalyzer',
    title: 'Video Intelligence',
    description: 'AI-powered video analysis and content mapping.',
    icon: Video,
    color: '#a78bfa'
  },
  {
    id: 'contentforge',
    title: 'Content Extractor',
    description: 'Transform articles into social media campaigns.',
    icon: Sparkles,
    color: '#60a5fa'
  },
  {
    id: 'datainsights',
    title: 'Data Insights',
    description: 'Turn raw data into visual business intelligence.',
    icon: BarChart3,
    color: '#c084fc'
  }
];

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="labs-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="labs-logo">TSH / <span>Labs</span></div>
          <p className="welcome-text">Active Terminal: {user?.email}</p>
        </div>
        <button onClick={signOut} className="sign-out-btn">Sign Out</button>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          {labsProjects.map((project) => {
            const Icon = project.icon;
            return (
              <Link key={project.id} to={`/app/${project.id}`} className="dashboard-card">
                <div className="card-icon" style={{ color: project.color }}>
                  <Icon size={24} />
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="card-arrow">↗</div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="dashboard-footer">
        <span>// HOST: MAC-MINI-01</span>
        <span>// STATUS: OPERATIONAL</span>
      </footer>
    </div>
  );
};

export default Dashboard;
