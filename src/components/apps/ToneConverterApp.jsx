import React, { useMemo, useState } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Briefcase,
  Coffee,
  Heart,
  Megaphone,
  GraduationCap,
  Smile,
  Zap,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
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

function getWordCount(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

const ToneConverterApp = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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

  const selectedToneInfo = toneOptions.find((tone) => tone.id === selectedTone) || toneOptions[0];
  const SelectedToneIcon = selectedToneInfo.icon;

  const inputStats = useMemo(
    () => ({
      chars: inputText.length,
      words: getWordCount(inputText),
    }),
    [inputText]
  );

  const outputStats = useMemo(
    () => ({
      chars: outputText.length,
      words: getWordCount(outputText),
    }),
    [outputText]
  );

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

  return (
    <article className="toneconverter-app">
      <header className="toneconverter-hero">
        <div className="toneconverter-hero__copy">
          <div className="toneconverter-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            <span>Messaging desk</span>
          </div>
          <h1>Recast the message without rewriting it from scratch.</h1>
          <p>
            Drop in a draft, choose the delivery style, and get a cleaner version back for
            outreach, positioning, follow-ups, or internal notes.
          </p>
          <div className="toneconverter-hero__meta">
            <span>8 tone profiles</span>
            <span>best for emails and messaging</span>
            <span>copy-ready output</span>
          </div>
        </div>

        <aside className="toneconverter-hero__tone">
          <div className="toneconverter-panel-label">Current mode</div>
          <div className="toneconverter-selected-tone">
            <div className="toneconverter-selected-tone__icon">
              <SelectedToneIcon size={18} aria-hidden="true" />
            </div>
            <div>
              <strong>{selectedToneInfo.label}</strong>
              <p>{selectedToneInfo.description}</p>
            </div>
          </div>
          <div className="toneconverter-tone-note">
            The rewrite keeps the message intent, but shifts the register and delivery.
          </div>
        </aside>
      </header>

      <section className="toneconverter-tones" aria-label="Select tone">
        <div className="toneconverter-section-head">
          <div>
            <div className="toneconverter-panel-label">Tone library</div>
            <h2>Pick the delivery style before you rewrite.</h2>
          </div>
          <p>Each profile keeps the same core message while changing how it lands.</p>
        </div>

        <div className="toneconverter-tones-grid">
          {toneOptions.map((tone) => {
            const Icon = tone.icon;
            return (
              <button
                key={tone.id}
                type="button"
                className={`toneconverter-tone-btn ${selectedTone === tone.id ? 'active' : ''}`}
                onClick={() => setSelectedTone(tone.id)}
                aria-pressed={selectedTone === tone.id}
              >
                <span className="toneconverter-tone-btn__top">
                  <span className="toneconverter-tone-btn__icon">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="toneconverter-tone-label">{tone.label}</span>
                </span>
                <span className="toneconverter-tone-desc">{tone.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <main className="toneconverter-workspace">
        <section className="toneconverter-panel toneconverter-panel--input" aria-label="Input text">
          <div className="toneconverter-panel__head">
            <div>
              <div className="toneconverter-panel-label">Original draft</div>
              <h2>Source message</h2>
            </div>
            <div className="toneconverter-stats">
              <span>{inputStats.words} words</span>
              <span>{inputStats.chars} chars</span>
            </div>
          </div>

          <textarea
            className="toneconverter-textarea"
            placeholder="Paste the draft you want to soften, sharpen, formalize, or reframe..."
            value={inputText}
            onChange={handleInputChange}
            aria-label="Enter text to convert tone"
          />

          <div className="toneconverter-panel__footer">
            <p>
              Rewriting to <strong>{selectedToneInfo.label}</strong> tone.
            </p>
            <button
              type="button"
              className="toneconverter-btn toneconverter-btn-primary"
              onClick={handleConvert}
              disabled={!inputText.trim() || isConverting}
            >
              {isConverting ? (
                <>
                  <RefreshCw size={17} className="toneconverter-spinner" />
                  Converting draft
                </>
              ) : (
                <>
                  Convert draft
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </section>

        <section className="toneconverter-panel toneconverter-panel--output" aria-label="Converted text">
          <div className="toneconverter-panel__head">
            <div>
              <div className="toneconverter-panel-label">Rewritten output</div>
              <h2>{selectedToneInfo.label} version</h2>
            </div>
            <div className="toneconverter-stats">
              <span>{outputStats.words} words</span>
              <span>{outputStats.chars} chars</span>
            </div>
          </div>

          {outputText ? (
            <>
              <textarea
                className="toneconverter-textarea toneconverter-textarea-output"
                value={outputText}
                readOnly
                aria-label="Converted text output"
                aria-live="polite"
              />
              <div className="toneconverter-panel__footer">
                <p>Ready to copy into email, docs, chat, or social drafts.</p>
                <button
                  type="button"
                  className="toneconverter-btn toneconverter-btn-secondary"
                  onClick={handleCopy}
                  disabled={!outputText}
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? 'Copied' : 'Copy output'}
                </button>
              </div>
            </>
          ) : (
            <div className="toneconverter-empty">
              <div className="toneconverter-empty__icon">
                <SelectedToneIcon size={18} aria-hidden="true" />
              </div>
              <strong>{selectedToneInfo.label} rewrite will appear here.</strong>
              <p>
                Paste a source message and run the converter to see the revised delivery on this
                side of the desk.
              </p>
            </div>
          )}
        </section>
      </main>

      {error && (
        <div className="toneconverter-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            &times;
          </button>
        </div>
      )}
    </article>
  );
};

export default ToneConverterApp;
