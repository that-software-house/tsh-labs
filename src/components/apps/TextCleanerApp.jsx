import React, { useState } from 'react';
import { Zap, Copy, Check, Sparkles } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import './TextCleanerApp.css';

const defaultOptions = {
  removeHiddenChars: true,
  convertNonBreakingSpaces: true,
  normalizeDashes: true,
  normalizeQuotes: true,
  convertEllipsis: true,
  removeTrailingWhitespace: true,
  removeAsterisks: false,
  removeMarkdownHeadings: false,
};

function cleanText(input, options) {
  let text = input;
  const stats = {
    hiddenChars: 0,
    nonBreakingSpaces: 0,
    dashes: 0,
    quotes: 0,
    ellipsis: 0,
    trailingWhitespace: 0,
    asterisks: 0,
    markdownHeadings: 0,
  };

  // Remove hidden/zero-width characters
  if (options.removeHiddenChars) {
    const hiddenCharsRegex = /[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g;
    const matches = text.match(hiddenCharsRegex);
    stats.hiddenChars = matches ? matches.length : 0;
    text = text.replace(hiddenCharsRegex, '');
  }

  // Convert non-breaking spaces to regular spaces
  if (options.convertNonBreakingSpaces) {
    const nbspRegex = /[\u00A0\u2007\u202F]/g;
    const matches = text.match(nbspRegex);
    stats.nonBreakingSpaces = matches ? matches.length : 0;
    text = text.replace(nbspRegex, ' ');
  }

  // Normalize dashes (en-dash, em-dash to regular hyphen)
  if (options.normalizeDashes) {
    const dashRegex = /[\u2013\u2014\u2012]/g;
    const matches = text.match(dashRegex);
    stats.dashes = matches ? matches.length : 0;
    text = text.replace(dashRegex, '-');
  }

  // Normalize quotes (smart quotes to straight quotes)
  if (options.normalizeQuotes) {
    const singleQuoteRegex = /[\u2018\u2019\u201A\u201B]/g;
    const doubleQuoteRegex = /[\u201C\u201D\u201E\u201F]/g;
    const singleMatches = text.match(singleQuoteRegex);
    const doubleMatches = text.match(doubleQuoteRegex);
    stats.quotes = (singleMatches ? singleMatches.length : 0) + (doubleMatches ? doubleMatches.length : 0);
    text = text.replace(singleQuoteRegex, "'");
    text = text.replace(doubleQuoteRegex, '"');
  }

  // Convert ellipsis character to three dots
  if (options.convertEllipsis) {
    const ellipsisRegex = /\u2026/g;
    const matches = text.match(ellipsisRegex);
    stats.ellipsis = matches ? matches.length : 0;
    text = text.replace(ellipsisRegex, '...');
  }

  // Remove trailing whitespace from each line
  if (options.removeTrailingWhitespace) {
    const lines = text.split('\n');
    let count = 0;
    const cleanedLines = lines.map((line) => {
      const trimmed = line.replace(/\s+$/, '');
      if (trimmed.length < line.length) count++;
      return trimmed;
    });
    stats.trailingWhitespace = count;
    text = cleanedLines.join('\n');
  }

  // Remove asterisks (often used for bold in AI outputs)
  if (options.removeAsterisks) {
    const asteriskRegex = /\*+/g;
    const matches = text.match(asteriskRegex);
    stats.asterisks = matches ? matches.length : 0;
    text = text.replace(asteriskRegex, '');
  }

  // Remove markdown headings
  if (options.removeMarkdownHeadings) {
    const headingRegex = /^#{1,6}\s+/gm;
    const matches = text.match(headingRegex);
    stats.markdownHeadings = matches ? matches.length : 0;
    text = text.replace(headingRegex, '');
  }

  return { cleanedText: text, stats };
}

const TextCleanerApp = () => {
  const [inputText, setInputText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [stats, setStats] = useState({});
  const [options, setOptions] = useState(defaultOptions);
  const [copied, setCopied] = useState(false);
  const [hasCleaned, setHasCleaned] = useState(false);

  // SEO optimization
  useSEO({
    title: 'AI Text Cleaner - Clean ChatGPT & LLM Output | Free Online Tool',
    description: 'Free AI text cleaner tool to remove hidden characters, normalize quotes, fix spacing, and clean up ChatGPT, Claude, and LLM outputs. Instantly standardize AI-generated text for professional use.',
    keywords: 'AI text cleaner, clean ChatGPT text, LLM text cleaner, remove hidden characters, normalize quotes, clean AI output, text sanitizer, ChatGPT formatting, AI text formatter, clean GPT output, remove invisible characters, text standardizer',
    canonicalUrl: 'https://labs.thatsoftwarehouse.com/textcleaner',
    openGraph: {
      title: 'AI Text Cleaner - Clean & Standardize LLM Output',
      description: 'Free tool to clean up AI-generated text. Remove hidden characters, fix quotes, normalize spacing from ChatGPT and other LLMs.',
      type: 'website',
      url: 'https://labs.thatsoftwarehouse.com/textcleaner',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'AI Text Cleaner',
      description: 'Free online tool to clean and standardize AI-generated text from ChatGPT, Claude, and other LLMs. Removes hidden characters, normalizes quotes, and fixes formatting.',
      url: 'https://labs.thatsoftwarehouse.com/textcleaner',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Remove hidden/invisible characters',
        'Convert non-breaking spaces',
        'Normalize smart quotes to straight quotes',
        'Normalize dashes (em-dash, en-dash)',
        'Convert ellipsis characters',
        'Remove trailing whitespace',
        'Remove markdown formatting',
        'Clean ChatGPT output',
        'Clean Claude output',
        'Clean LLM text',
      ],
    },
  });

  const totalModified = Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);

  const handleClean = () => {
    if (!inputText.trim()) return;
    const result = cleanText(inputText, options);
    setCleanedText(result.cleanedText);
    setStats(result.stats);
    setHasCleaned(true);
  };

  const handleOptionChange = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    // Reset cleaned state when options change
    setHasCleaned(false);
    setCleanedText('');
    setStats({});
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    // Reset cleaned state when input changes
    setHasCleaned(false);
    setCleanedText('');
    setStats({});
  };

  const handleCopy = async () => {
    if (!cleanedText) return;
    try {
      await navigator.clipboard.writeText(cleanedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const cleaningOptions = [
    { key: 'removeHiddenChars', label: 'Remove hidden characters' },
    { key: 'convertNonBreakingSpaces', label: 'Convert non-breaking spaces' },
    { key: 'normalizeDashes', label: 'Normalize dashes' },
    { key: 'normalizeQuotes', label: 'Normalize quotes' },
    { key: 'convertEllipsis', label: 'Convert ellipsis' },
    { key: 'removeTrailingWhitespace', label: 'Remove trailing whitespace' },
    { key: 'removeAsterisks', label: 'Remove asterisks (*)' },
    { key: 'removeMarkdownHeadings', label: 'Remove markdown headings' },
  ];

  const statsDisplay = [
    { key: 'hiddenChars', label: 'Hidden characters' },
    { key: 'quotes', label: 'Quotes normalized' },
    { key: 'trailingWhitespace', label: 'Trailing whitespace' },
    { key: 'dashes', label: 'Dashes normalized' },
    { key: 'nonBreakingSpaces', label: 'Non-breaking spaces' },
    { key: 'ellipsis', label: 'Ellipsis converted' },
    { key: 'asterisks', label: 'Asterisks removed' },
    { key: 'markdownHeadings', label: 'Headings removed' },
  ];

  return (
    <article className="textcleaner-app" itemScope itemType="https://schema.org/WebApplication">
      <header className="textcleaner-header">
        <div className="textcleaner-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>AI Text Cleaning</span>
        </div>
        <h1 itemProp="name">Clean Up LLM Output</h1>
        <p itemProp="description">Normalize spacing, quotes, and line breaks so it's paste-ready every time.</p>
      </header>

      <main className="textcleaner-main">
        <section className="textcleaner-input-section" aria-label="Input text area">
          <div className="textcleaner-card">
            <h2>Input Text</h2>
            <textarea
              className="textcleaner-textarea"
              placeholder="Paste your AI-generated text here..."
              value={inputText}
              onChange={handleInputChange}
              aria-label="Paste your AI or ChatGPT generated text here to clean"
            />
            <button
              className="textcleaner-btn textcleaner-btn-primary"
              onClick={handleClean}
              disabled={!inputText.trim()}
            >
              <Zap size={18} />
              Clean Text
            </button>
          </div>
        </section>

        <section className="textcleaner-output-section" aria-label="Cleaned text output">
          <div className="textcleaner-card">
            <h2>Cleaned Text</h2>
            <textarea
              className="textcleaner-textarea textcleaner-textarea-output"
              placeholder="Cleaned text will appear here..."
              value={cleanedText}
              readOnly
              aria-label="Cleaned and formatted text output"
              aria-live="polite"
            />
            <button
              className="textcleaner-btn textcleaner-btn-primary"
              onClick={handleCopy}
              disabled={!cleanedText}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Output'}
            </button>
          </div>
        </section>
      </main>

      <aside className="textcleaner-bottom">
        <section className="textcleaner-options-section" aria-label="Text cleaning options">
          <div className="textcleaner-card">
            <h2>Cleaning Options</h2>
            <div className="textcleaner-options-grid">
              {cleaningOptions.map((opt) => (
                <label key={opt.key} className="textcleaner-checkbox-label">
                  <input
                    type="checkbox"
                    checked={options[opt.key]}
                    onChange={() => handleOptionChange(opt.key)}
                  />
                  <span className="textcleaner-checkbox-custom"></span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="textcleaner-stats-section" aria-label="Cleaning statistics">
          <div className="textcleaner-card textcleaner-stats-card">
            <h2>Cleaning Statistics</h2>
            <div className="textcleaner-stats-list">
              {statsDisplay
                .filter((s) => stats[s.key] > 0)
                .map((s) => (
                  <div key={s.key} className="textcleaner-stat-row">
                    <span>{s.label}:</span>
                    <span className="textcleaner-stat-value">{stats[s.key]}</span>
                  </div>
                ))}
              {totalModified > 0 && (
                <div className="textcleaner-stat-row textcleaner-stat-total">
                  <span>Total modified:</span>
                  <span className="textcleaner-stat-value">{totalModified}</span>
                </div>
              )}
              {hasCleaned && totalModified === 0 && (
                <div className="textcleaner-stat-row">
                  <span>No changes needed</span>
                </div>
              )}
              {!hasCleaned && (
                <div className="textcleaner-stat-row">
                  <span>Click "Clean Text" to see statistics</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </aside>
    </article>
  );
};

export default TextCleanerApp;
