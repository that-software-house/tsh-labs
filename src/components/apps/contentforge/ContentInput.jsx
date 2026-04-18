import React, { useState } from 'react';
import { FileText, Link, Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

function ContentInput({ sourceType, setSourceType, onGenerate, isGenerating }) {
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        // Pass the actual file content to be processed by AI
        onGenerate(content, file.name, 'file');
      };
      reader.readAsText(file);
    }
  };

  const showErrorToast = (message) => {
    // lightweight fallback toast; could be replaced with a proper toast lib
    window.alert(message || 'We could not generate content. Please try again.');
  };

  const handleGenerate = () => {
    let content = '';

    switch (sourceType) {
      case 'text':
        content = textContent;
        break;
      case 'url':
        content = urlContent;
        break;
      case 'file':
        content = '';
        break;
      default:
        content = '';
    }

    if (!content) {
      showErrorToast('Please enter some content first.');
      return;
    }

    onGenerate(content, fileName, sourceType)?.catch?.((err) => {
      showErrorToast(err?.message || 'Unable to generate content right now.');
    });
  };

  const canGenerate = () => {
    switch (sourceType) {
      case 'text':
        return textContent.trim().length > 0;
      case 'url':
        return urlContent.trim().length > 0;
      default:
        return false;
    }
  };

  const charCount = textContent.length;
  const maxChars = 5000;

  return (
    <div className="contentforge-input">
      <Tabs value={sourceType} onValueChange={setSourceType}>
        <TabsList className="contentforge-tabs-list">
          <TabsTrigger
            value="text"
            className="contentforge-tab-trigger"
          >
            <FileText className="h-4 w-4" />
            <span>Text</span>
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="contentforge-tab-trigger"
          >
            <Link className="h-4 w-4" />
            <span>URL</span>
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="contentforge-tab-trigger"
          >
            <Upload className="h-4 w-4" />
            <span>File</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="contentforge-tab-content">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="contentforge-pane"
          >
            <div className="contentforge-pane-head">
              <Label htmlFor="text-input" className="contentforge-label">Paste your content</Label>
              <span
                className={`contentforge-char-count ${charCount > maxChars ? 'is-over' : ''}`}
              >
                {charCount} / {maxChars}
              </span>
            </div>
            <Textarea
              id="text-input"
              placeholder="Paste your blog post, article, or any long-form content here...

The more detailed your content, the better the results!"
              className="contentforge-textarea"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              maxLength={maxChars}
            />
            <p className="contentforge-pane-note">
              Long-form source material gives the model more structure to turn into stronger hooks and sharper platform-specific drafts.
            </p>
          </motion.div>
        </TabsContent>

        <TabsContent value="url" className="contentforge-tab-content">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="contentforge-pane"
          >
            <Label htmlFor="url-input" className="contentforge-label">
              <Link className="h-4 w-4" />
              Article URL
            </Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/article"
              className="contentforge-input-control"
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
            />
            <div className="contentforge-pane-note-box">
              <p>
                Enter the URL of a blog post or article to extract and transform
              </p>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="file" className="contentforge-tab-content">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="contentforge-pane"
          >
            <Label htmlFor="file-input" className="contentforge-label">
              <Upload className="h-4 w-4" />
              Upload File
            </Label>
            <div className="contentforge-file-drop">
              <Upload className="contentforge-file-drop-icon" />
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                className="contentforge-file-input"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-input" className="contentforge-file-label">
                <Button variant="outline" className="contentforge-file-button" asChild>
                  <span>Choose File</span>
                </Button>
                <p className="contentforge-file-caption">or drag and drop</p>
                <p className="contentforge-file-meta">PDF, TXT, DOC, DOCX (Max 10MB)</p>
              </label>
              {fileName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="contentforge-file-chip"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{fileName}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </TabsContent>

      </Tabs>

      {sourceType !== 'file' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate() || isGenerating}
            className="contentforge-primary-btn contentforge-primary-btn--full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="contentforge-spinner" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Posts
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default ContentInput;
