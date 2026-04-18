import React, { useState } from 'react';
import { Copy, Download, Check, Linkedin, Twitter, Layout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import CarouselPreview from './CarouselPreview';

function GeneratedContent({ outputs, isGenerating, progress = '' }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (content, format) => {
    const text = Array.isArray(content) ? content.join('\n\n---\n\n') : content;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${format}-post-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'carousel':
        return <Layout className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'Twitter';
      case 'carousel':
        return 'Carousel';
      default:
        return format;
    }
  };

  if (isGenerating) {
    return (
      <div className="contentforge-output-card contentforge-output-card--state">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="contentforge-output-state"
        >
          <div className="contentforge-output-state__center">
            <div className="contentforge-output-spinner-wrap">
              <div className="contentforge-output-spinner"></div>
              <div className="contentforge-output-spinner-icon">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div>
            <h3>Generating your posts...</h3>
            <p>
              {progress || 'Our AI is crafting engaging content for you'}
            </p>
          </div>
          <div className="contentforge-output-state__bars">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="contentforge-output-bar"
              >
                <motion.div
                  className="contentforge-output-bar__fill"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (outputs.length === 0) {
    return (
      <div className="contentforge-output-card contentforge-output-card--state">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="contentforge-output-empty"
        >
          <div className="contentforge-output-empty__icon">
            <Layout className="h-10 w-10" />
          </div>
          <div>
            <h3>Ready to transform your content</h3>
            <p>
              Select your content source and output formats, then click "Generate Posts" to get
              started.
            </p>
          </div>
          <div className="contentforge-output-empty__tags">
            <span className="contentforge-output-tag">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </span>
            <span className="contentforge-output-tag">
              <Twitter className="h-4 w-4" />
              Twitter
            </span>
            <span className="contentforge-output-tag">
              <Layout className="h-4 w-4" />
              Carousel
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (outputs.length === 1) {
    const output = outputs[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="contentforge-output-card">
          <div className="contentforge-output-header">
            <div className="contentforge-output-title-wrap">
              {getFormatIcon(output.format)}
              <h3>{getFormatLabel(output.format)} Draft</h3>
            </div>
            <div className="contentforge-output-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    Array.isArray(output.content) ? output.content.join('\n\n') : output.content,
                    output.format
                  )
                }
                className="contentforge-action-button"
              >
                {copiedIndex === output.format ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(output.content, output.format)}
                className="contentforge-action-button"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {output.format === 'carousel' && Array.isArray(output.content) ? (
            <CarouselPreview slides={output.content} />
          ) : output.format === 'twitter' && Array.isArray(output.content) ? (
            <div className="contentforge-output-thread">
              {output.content.map((tweet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="contentforge-output-thread-item"
                >
                  <div className="contentforge-output-thread-head">
                    <span className="contentforge-output-thread-badge">
                      <Twitter className="h-3 w-3" />
                      Tweet {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(tweet, `${output.format}-${index}`)}
                      className="contentforge-inline-copy"
                    >
                      {copiedIndex === `${output.format}-${index}` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="contentforge-output-thread-copy">{tweet}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="contentforge-output-prose"
            >
              <p>{output.content}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="contentforge-output-card">
        <h3 className="contentforge-output-heading">Generated Posts</h3>
        <Tabs defaultValue={outputs[0].format}>
          <TabsList className="contentforge-output-tabs" style={{ gridTemplateColumns: `repeat(${outputs.length}, 1fr)` }}>
            {outputs.map((output) => (
              <TabsTrigger
                key={output.format}
                value={output.format}
                className="contentforge-output-tab-trigger"
              >
                {getFormatIcon(output.format)}
                <span>{getFormatLabel(output.format)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {outputs.map((output) => (
              <TabsContent key={output.format} value={output.format} className="contentforge-output-tab-panel">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="contentforge-output-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          Array.isArray(output.content)
                            ? output.content.join('\n\n')
                            : output.content,
                          output.format
                        )
                      }
                      className="contentforge-action-button"
                    >
                      {copiedIndex === output.format ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(output.content, output.format)}
                      className="contentforge-action-button"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  {output.format === 'carousel' && Array.isArray(output.content) ? (
                    <CarouselPreview slides={output.content} />
                  ) : output.format === 'twitter' && Array.isArray(output.content) ? (
                    <div className="contentforge-output-thread">
                      {output.content.map((tweet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="contentforge-output-thread-item"
                        >
                          <div className="contentforge-output-thread-head">
                            <span className="contentforge-output-thread-badge">
                              <Twitter className="h-3 w-3" />
                              Tweet {index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(tweet, `${output.format}-${index}`)}
                              className="contentforge-inline-copy"
                            >
                              {copiedIndex === `${output.format}-${index}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="contentforge-output-thread-copy">{tweet}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="contentforge-output-prose">
                      <p>{output.content}</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}

export default GeneratedContent;
