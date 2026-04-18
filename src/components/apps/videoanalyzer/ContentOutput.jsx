import React, { useState } from 'react';
import { Linkedin, Twitter, Layers, Copy, Check } from 'lucide-react';

const ContentOutput = ({ content }) => {
  const [activeTab, setActiveTab] = useState('linkedin');
  const [copied, setCopied] = useState('');

  if (!content) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const tabs = [
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { key: 'twitter', label: 'Twitter', icon: Twitter },
    { key: 'carousel', label: 'Carousel', icon: Layers },
  ];

  return (
    <div className="vidanalyzer-content">
      <h3 className="vidanalyzer-content-title">Generated Content</h3>

      <div className="vidanalyzer-content-tabs">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`vidanalyzer-content-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="vidanalyzer-content-body">
        {activeTab === 'linkedin' && content.linkedin && (
          <div className="vidanalyzer-content-block">
            <button
              className={`vidanalyzer-copy-btn ${copied === 'linkedin' ? 'success' : ''}`}
              onClick={() => handleCopy(content.linkedin, 'linkedin')}
            >
              {copied === 'linkedin' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'linkedin' ? 'Copied' : 'Copy'}
            </button>
            <pre className="vidanalyzer-content-pre">{content.linkedin}</pre>
          </div>
        )}

        {activeTab === 'twitter' && content.twitter?.length > 0 && (
          <div className="vidanalyzer-content-block">
            <button
              className={`vidanalyzer-copy-btn ${copied === 'twitter' ? 'success' : ''}`}
              onClick={() => handleCopy(content.twitter.join('\n\n---\n\n'), 'twitter')}
            >
              {copied === 'twitter' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'twitter' ? 'Copied' : 'Copy All'}
            </button>
            <div className="vidanalyzer-tweets">
              {content.twitter.map((tweet, idx) => (
                <div key={idx} className="vidanalyzer-tweet">
                  <span className="vidanalyzer-tweet-num">{idx + 1}/{content.twitter.length}</span>
                  <p>{tweet}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'carousel' && content.carousel?.length > 0 && (
          <div className="vidanalyzer-content-block">
            <button
              className={`vidanalyzer-copy-btn ${copied === 'carousel' ? 'success' : ''}`}
              onClick={() => handleCopy(content.carousel.join('\n\n---\n\n'), 'carousel')}
            >
              {copied === 'carousel' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'carousel' ? 'Copied' : 'Copy All'}
            </button>
            <div className="vidanalyzer-slides">
              {content.carousel.map((slide, idx) => (
                <div key={idx} className="vidanalyzer-slide">
                  <span className="vidanalyzer-slide-num">Slide {idx + 1}</span>
                  <p>{slide}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentOutput;
