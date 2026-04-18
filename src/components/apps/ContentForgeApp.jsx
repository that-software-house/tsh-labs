import React, { useState } from 'react';
import { Sparkles, Zap, ArrowRight, AlertCircle, FileText, LayoutTemplate, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentInput from './contentforge/ContentInput';
import OutputFormatSelector from './contentforge/OutputFormatSelector';
import GeneratedContent from './contentforge/GeneratedContent';
import { generateContent } from '@/services/openai';
import './ContentForgeApp.css';

function ContentForgeApp() {
  const [sourceType, setSourceType] = useState('text');
  const [outputFormats, setOutputFormats] = useState(['linkedin']);
  const [generatedOutputs, setGeneratedOutputs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState('');
  const outputCount = generatedOutputs.length;
  const sourceLabel = sourceType === 'text' ? 'Pasted text brief' : sourceType === 'url' ? 'URL extraction' : 'Uploaded document';

  const handleGenerate = async (content, fileName, contentSourceType) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedOutputs([]);

    try {
      setGenerationProgress('Sending to AI agents...');

      // Call the backend API with all formats at once
      const { results, errors } = await generateContent(content, outputFormats, contentSourceType);

      // Convert results to output format
      const outputs = [];

      for (const format of outputFormats) {
        if (results[format]) {
          outputs.push({
            format,
            content: results[format],
            timestamp: new Date(),
          });
        } else if (errors[format]) {
          outputs.push({
            format,
            content: `Error: ${errors[format]}`,
            timestamp: new Date(),
            error: true,
          });
        }
      }

      setGeneratedOutputs(outputs);
      setGenerationProgress('');

      // Show error if all formats failed
      if (Object.keys(errors).length === outputFormats.length) {
        setError('All content generation failed. Please check your input and try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred while generating content. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <div className="contentforge-app">
      <header className="contentforge-header">
        <div className="contentforge-header-content">
          <div className="contentforge-logo">
            <div className="contentforge-logo-icon">
              <Sparkles className="contentforge-logo-mark" />
              <Zap className="contentforge-logo-spark" />
            </div>
            <div>
              <div className="contentforge-kicker">AI WRITING STUDIO</div>
              <h2 className="contentforge-title">ContentForge</h2>
            </div>
          </div>
          <p className="contentforge-subtitle">
            Transform long-form source material into platform-ready drafts.
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="contentforge-hero"
      >
        <div className="contentforge-hero-copy">
          <div className="contentforge-badge">
            <Wand2 size={14} />
            <span>Brief to draft pipeline</span>
          </div>
          <h3 className="contentforge-hero-title">Turn source material into high-leverage social drafts.</h3>
          <p className="contentforge-hero-subtitle">
            Load a text brief, article URL, or source document, then generate structured outputs for
            LinkedIn, Twitter, and carousel-based distribution.
          </p>
        </div>

        <div className="contentforge-hero-metrics">
          <div className="contentforge-hero-metric">
            <span>Source</span>
            <strong>{sourceLabel}</strong>
          </div>
          <div className="contentforge-hero-metric">
            <span>Formats queued</span>
            <strong>{outputFormats.length}</strong>
          </div>
          <div className="contentforge-hero-metric">
            <span>Drafts ready</span>
            <strong>{outputCount}</strong>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="contentforge-error"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="contentforge-error-close">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="contentforge-main">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="contentforge-input-column"
        >
          <div className="contentforge-card">
            <div className="contentforge-card-header">
              <div className="contentforge-card-icon">
                <ArrowRight size={18} />
              </div>
              <div>
                <div className="contentforge-card-eyebrow">// BRIEFING INPUT</div>
                <h4 className="contentforge-card-title">Input Content</h4>
                <p className="contentforge-card-subtitle">Choose the source you want to rewrite into draft-ready social content.</p>
              </div>
            </div>
            <ContentInput
              sourceType={sourceType}
              setSourceType={setSourceType}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          <div className="contentforge-card">
            <div className="contentforge-card-header">
              <div className="contentforge-card-icon">
                <LayoutTemplate size={18} />
              </div>
              <div>
                <div className="contentforge-card-eyebrow">// OUTPUT ROUTING</div>
                <h4 className="contentforge-card-title">Output Formats</h4>
                <p className="contentforge-card-subtitle">Route the same source into the channels you want to publish next.</p>
              </div>
            </div>
            <OutputFormatSelector
              selectedFormats={outputFormats}
              setSelectedFormats={setOutputFormats}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="contentforge-output-column"
        >
          <div className="contentforge-sidepanel">
            <span className="contentforge-sidepanel-label">// STUDIO STATUS</span>
            <strong>{isGenerating ? 'Generating drafts' : outputCount > 0 ? 'Drafts available' : 'Ready for brief'}</strong>
            <p>
              {isGenerating
                ? generationProgress || 'The model is turning the current brief into platform-specific outputs.'
                : outputCount > 0
                  ? 'Review, copy, and export the generated drafts from the output surface below.'
                  : 'Set a source, choose your channels, and generate the first draft set.'}
            </p>
          </div>

          <div className="contentforge-sidepanel">
            <span className="contentforge-sidepanel-label">// ROUTING</span>
            <ul className="contentforge-sidepanel-list">
              <li>LinkedIn for polished professional summary posts.</li>
              <li>Twitter for serial thread breakdowns.</li>
              <li>Carousel for multi-card narrative sequencing.</li>
            </ul>
          </div>

          <GeneratedContent
            outputs={generatedOutputs}
            isGenerating={isGenerating}
            progress={generationProgress}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default ContentForgeApp;
