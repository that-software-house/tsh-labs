import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, ClipboardCheck, FileText, Link2, Share2, UploadCloud } from 'lucide-react';
import './DocAnalyzerApp.css';
import { analyzeDocument } from '@/services/openai';

const allowedTypes = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/markdown'
];

function summarize(text) {
  if (!text) return { summary: '', keyPoints: [] };
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 2).join(' ') || clean.slice(0, 180);
  const words = clean.split(' ').slice(0, 60);
  const chunks = [];
  for (let i = 0; i < words.length; i += 12) {
    chunks.push(words.slice(i, i + 12).join(' '));
  }
  const keyPoints = chunks.slice(0, 4).map((c, idx) => `${idx + 1}. ${c}`);
  return { summary, keyPoints };
}

const DocAnalyzerApp = () => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [analysis, setAnalysis] = useState({ summary: '', keyPoints: [], title: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const currentFileRef = useRef(null);

  const wordCount = useMemo(() => rawContent.trim().split(/\s+/).filter(Boolean).length, [rawContent]);

  const handleFile = (file) => {
    setError('');
    setAnalysis({ summary: '', keyPoints: [], title: '' });
    setRawContent('');

    if (!file) return;
    currentFileRef.current = file;
    setFileName(file.name);
    setFileType(file.type || 'unknown');

    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.md'];
    const hasAllowedExt = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!allowedTypes.includes(file.type) && !hasAllowedExt) {
      setError('Unsupported file type. Please upload a PDF, DOCX, TXT, markdown, or image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setRawContent(result.slice(0, 4000));
      } else {
        setRawContent('Preview unavailable for this file type, but analysis will run.');
      }
    };
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const isImage = file.type.startsWith('image/') || imageExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (isImage) {
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!currentFileRef.current) {
      setError('Please upload a file first.');
      return;
    }
    setIsAnalyzing(true);
    setError('');
    setCopied(false);

    try {
      const result = await analyzeDocument(currentFileRef.current);
      setAnalysis({
        summary: result.summary || '',
        keyPoints: result.keyPoints || [],
        title: result.title || fileName || 'Document'
      });
      if (result.textPreview) {
        setRawContent(result.textPreview);
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze document right now.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAnalysis = async () => {
    const text = `${analysis.title ? `${analysis.title}\n\n` : ''}${analysis.summary}\n\n${analysis.keyPoints.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      setError('Unable to copy right now. Please try again.');
    }
  };

  const shareAnalysis = async () => {
    const text = `${analysis.title ? `${analysis.title}\n\n` : ''}${analysis.summary}\n\n${analysis.keyPoints.join('\n')}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: fileName || 'Document Analysis', text });
      } catch (err) {
        // user cancelled
      }
    } else {
      copyAnalysis();
    }
  };

  return (
    <div className="docanalyzer-app">
      <div className="docanalyzer-card">
        <div className="docanalyzer-header">
          <div className="docanalyzer-icon">
            <FileText size={20} />
          </div>
          <div>
            <h2>DocAnalyzer</h2>
            <p>Upload a document to extract text and get an instant AI analysis.</p>
          </div>
        </div>

        <label className="docanalyzer-upload">
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <UploadCloud size={20} />
          <span>{fileName || 'Choose a file (txt, pdf, docx, png, jpg, gif, webp)'}</span>
        </label>
        {fileType && <p className="docanalyzer-hint">Detected type: {fileType}</p>}
        {error && <p className="docanalyzer-error">{error}</p>}

        <div className="docanalyzer-preview">
          <div className="docanalyzer-preview-header">
            <span>Extracted content</span>
            <span className="docanalyzer-count">{wordCount} words</span>
          </div>
          <div className="docanalyzer-preview-body">
            {rawContent ? rawContent.slice(0, 1200) : 'Upload a document to preview its contents here.'}
          </div>
        </div>

        <div className="docanalyzer-actions">
          <button
            className="docanalyzer-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !rawContent}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze document'}
          </button>
          <div className="docanalyzer-secondary-actions">
            <button onClick={copyAnalysis} disabled={!analysis.summary}>
              {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              <span>{copied ? 'Copied' : 'Copy analysis'}</span>
            </button>
            <button onClick={shareAnalysis} disabled={!analysis.summary}>
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {(analysis.summary || analysis.keyPoints.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="docanalyzer-results"
        >
          <div className="docanalyzer-results-header">
            <div>
              <p className="docanalyzer-label">Analysis</p>
              <h3>Document insights</h3>
            </div>
            <Link2 size={18} />
          </div>
          <div className="docanalyzer-results-body">
            {analysis.summary && (
              <div className="docanalyzer-summary">
                <p className="docanalyzer-label">Summary</p>
                <p>{analysis.summary}</p>
              </div>
            )}
            {analysis.keyPoints.length > 0 && (
              <div className="docanalyzer-points">
                <p className="docanalyzer-label">Key points</p>
                <ul>
                  {analysis.keyPoints.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DocAnalyzerApp;
