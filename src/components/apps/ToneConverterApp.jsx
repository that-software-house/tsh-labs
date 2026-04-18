import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Sparkles, Briefcase, Coffee, Heart, Megaphone, GraduationCap, Smile, Zap, MessageCircle } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { convertTone } from '@/services/openai';
import './ToneConverterApp.css';

const toneOptions = [
  { id: 'professional', label: 'Professional', icon: Briefcase, description: 'Formal business communication' },
  { id: 'casual', label: 'Casual', icon: Coffee, description: 'Relaxed and conversational' },
  { id: 'friendly', label: 'Friendly', icon: Heart, description: 'Warm and approachable' },
  { id: 'persuasive', label: 'Persuasive', icon: Megaphone, description: 'Compelling and convincing' },
  { id: 'confident', label: 'Confident', icon: Zap, description: 'Bold and assertive' },
  { id: 'empathetic', label: 'Empathetic', icon: MessageCircle, description: 'Understanding and supportive' },
  { id: 'witty', label: 'Witty', icon: Smile, description: 'Clever and humorous' },
  { id: 'academic', label: 'Academic', icon: GraduationCap, description: 'Scholarly and formal' },
];

const ToneConverterApp = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // SEO optimization
  useSEO({
    title: 'AI Tone Converter - Change Text Tone Instantly | Free Online Tool',
    description: 'Free AI tone converter to transform your writing style. Convert text to professional, casual, friendly, persuasive, or any tone. Perfect for emails, social media, and business communication.',
    keywords: 'tone converter, AI tone changer, text tone converter, writing style converter, professional tone, casual tone, change text tone, rewrite text tone, AI writing assistant, email tone converter',
    canonicalUrl: 'https://labs.thatsoftwarehouse.com/toneconverter',
    openGraph: {
      title: 'AI Tone Converter - Transform Your Writing Style',
      description: 'Free tool to convert text to any tone - professional, casual, friendly, persuasive, and more.',
      type: 'website',
      url: 'https://labs.thatsoftwarehouse.com/toneconverter',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'AI Tone Converter',
      description: 'Free online tool to convert text to different tones and writing styles using AI.',
      url: 'https://labs.thatsoftwarehouse.com/toneconverter',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Convert to professional tone',
        'Convert to casual tone',
        'Convert to friendly tone',
        'Convert to persuasive tone',
        'Convert to confident tone',
        'Convert to empathetic tone',
        'Convert to witty/humorous tone',
        'Convert to academic tone',
      ],
    },
  });

  const handleConvert = async () => {
    if (!inputText.trim()) return;

    setIsConverting(true);
    setError('');
    setOutputText('');

    try {
      const convertedText = await convertTone(inputText, selectedTone);
      setOutputText(convertedText || '');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setError('');
  };

  const selectedToneInfo = toneOptions.find((t) => t.id === selectedTone);

  return (
    <article className="toneconverter-app">
      <header className="toneconverter-header">
        <div className="toneconverter-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>AI Tone Converter</span>
        </div>
        <h1>Transform Your Text's Tone</h1>
        <p>Convert your writing to any style - professional, casual, friendly, persuasive, and more.</p>
      </header>

      <section className="toneconverter-tones" aria-label="Select tone">
        <h2 className="toneconverter-tones-title">Select Target Tone</h2>
        <div className="toneconverter-tones-grid">
          {toneOptions.map((tone) => {
            const Icon = tone.icon;
            return (
              <button
                key={tone.id}
                className={`toneconverter-tone-btn ${selectedTone === tone.id ? 'active' : ''}`}
                onClick={() => setSelectedTone(tone.id)}
                aria-pressed={selectedTone === tone.id}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="toneconverter-tone-label">{tone.label}</span>
                <span className="toneconverter-tone-desc">{tone.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <main className="toneconverter-main">
        <section className="toneconverter-input-section" aria-label="Input text">
          <div className="toneconverter-card">
            <h2>Original Text</h2>
            <textarea
              className="toneconverter-textarea"
              placeholder="Enter the text you want to convert..."
              value={inputText}
              onChange={handleInputChange}
              aria-label="Enter text to convert tone"
            />
            <button
              className="toneconverter-btn toneconverter-btn-primary"
              onClick={handleConvert}
              disabled={!inputText.trim() || isConverting}
            >
              {isConverting ? (
                <>
                  <RefreshCw size={18} className="toneconverter-spinner" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Convert to {selectedToneInfo?.label}
                </>
              )}
            </button>
          </div>
        </section>

        <section className="toneconverter-output-section" aria-label="Converted text">
          <div className="toneconverter-card">
            <h2>
              {selectedToneInfo?.label} Tone
              {outputText && <span className="toneconverter-result-badge">Converted</span>}
            </h2>
            <textarea
              className="toneconverter-textarea toneconverter-textarea-output"
              placeholder="Converted text will appear here..."
              value={outputText}
              readOnly
              aria-label="Converted text output"
              aria-live="polite"
            />
            <button
              className="toneconverter-btn toneconverter-btn-primary"
              onClick={handleCopy}
              disabled={!outputText}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>
        </section>
      </main>

      {error && (
        <div className="toneconverter-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss error">&times;</button>
        </div>
      )}
    </article>
  );
};

export default ToneConverterApp;
