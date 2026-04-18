import { 
  Sparkles, 
  Bot, 
  FileText, 
  BarChart3, 
  Eraser, 
  RefreshCw, 
  CircleDollarSign, 
  Users, 
  Video 
} from 'lucide-react';

export const projects = [
  {
    id: 'leadflow',
    title: 'LeadFlow AI',
    subtitle: 'AI-Powered CRM',
    description: 'Auto-capture leads from email, web forms, and social DMs with zero manual data entry.',
    icon: Users,
    tags: ['AI', 'CRM', 'Leads', 'SMB'],
    apps: [{ id: 'leadflow-ai', name: 'LeadFlow AI' }]
  },
  {
    id: 'invoicechaser',
    title: 'Invoice Chaser',
    subtitle: 'Collections Copilot',
    description: 'Upload invoice exports, prioritize overdue accounts by risk, and generate follow-up drafts.',
    icon: CircleDollarSign,
    tags: ['AI', 'Finance', 'Collections', 'SMB'],
    apps: [{ id: 'invoice-chaser', name: 'Invoice Chaser' }]
  },
  {
    id: 'docanalyzer',
    title: 'Document Analyzer',
    subtitle: 'Document Intelligence',
    description: 'Extract insights, summaries, and key information from documents using advanced AI analysis.',
    icon: FileText,
    tags: ['AI', 'Documents', 'Analysis'],
    apps: [{ id: 'doc-summary', name: 'Document Summarizer' }]
  },
  {
    id: 'videoanalyzer',
    title: 'Video Analyzer',
    subtitle: 'AI Video Intelligence',
    description: 'Upload a video to extract keyframes, get AI-powered analysis, and generate social content.',
    icon: Video,
    tags: ['AI', 'Video', 'Content'],
    apps: [{ id: 'video-analyzer', name: 'Video Analyzer' }]
  },
  {
    id: 'contentforge',
    title: 'Content Extractor',
    subtitle: 'AI Content Transformation',
    description: 'Transform long-form content into engaging social media posts instantly.',
    icon: Sparkles,
    tags: ['AI', 'Content', 'Social Media'],
    apps: [{ id: 'content-transformer', name: 'Content Transformer' }]
  },
  {
    id: 'datainsights',
    title: 'Data Insights',
    subtitle: 'Business Analytics',
    description: 'Turn raw data into actionable insights with AI-powered analytics and visualization tools.',
    icon: BarChart3,
    tags: ['AI', 'Analytics', 'Data'],
    apps: [{ id: 'data-viz', name: 'Data Visualizer' }]
  },
  {
    id: 'textcleaner',
    title: 'Text Cleaner',
    subtitle: 'AI Text Standardization',
    description: 'Free AI text cleaner to remove hidden characters and fix formatting from LLM outputs.',
    icon: Eraser,
    tags: ['AI', 'Text', 'ChatGPT', 'LLM'],
    apps: [{ id: 'text-cleaner', name: 'Text Cleaner' }]
  },
  {
    id: 'toneconverter',
    title: 'Tone Converter',
    subtitle: 'AI Writing Style',
    description: 'Transform your text into any tone - professional, casual, friendly, or persuasive.',
    icon: RefreshCw,
    tags: ['AI', 'Writing', 'Tone', 'Style'],
    apps: [{ id: 'tone-converter', name: 'Tone Converter' }]
  }
];
