import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Loader2, AlertCircle, Sparkles, Lock, Clapperboard, Scissors } from 'lucide-react';
import './VideoAnalyzerApp.css';
import { analyzeUploadedVideo, analyzeVideoFrames, fetchYouTubeFrames } from '@/services/openai';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import VideoInput from './videoanalyzer/VideoInput';
import FrameExtractor from './videoanalyzer/FrameExtractor';
import FrameGallery from './videoanalyzer/FrameGallery';
import VideoSummary from './videoanalyzer/VideoSummary';
import ContentOutput from './videoanalyzer/ContentOutput';
import ViralClips from './videoanalyzer/ViralClips';

const DEFAULT_FRAME_COUNT = 15;
const MIN_FRAME_COUNT = 2;
const MAX_FRAME_COUNT = 15;
const DEFAULT_QUALITY = 'standard';
const WORKFLOW_FRAMES = 'frames';
const WORKFLOW_VIRAL = 'viral';

const QUALITY_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard',
    description: '640px, faster extraction',
    requiresAuth: false,
  },
  {
    value: 'high',
    label: 'High',
    description: '1280px, sharper frames',
    requiresAuth: true,
  },
  {
    value: 'original',
    label: 'Original',
    description: 'Source resolution, largest files',
    requiresAuth: true,
  },
];

const MotionDiv = motion.div;

function normalizeYouTubeFrames(result) {
  return (result.frames || []).map((frame, index) => ({
    base64: frame.base64,
    timestamp: frame.timestamp || `thumb-${index + 1}`,
    rawTime: typeof frame.rawTime === 'number' ? frame.rawTime : index,
  }));
}

const VideoAnalyzerApp = () => {
  const { isAuthenticated } = useAuth();
  const [workflow, setWorkflow] = useState(WORKFLOW_FRAMES);
  const [videoSource, setVideoSource] = useState(null);
  const [frameCount, setFrameCount] = useState(DEFAULT_FRAME_COUNT);
  const [frameQuality, setFrameQuality] = useState(DEFAULT_QUALITY);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [frameExtractionKey, setFrameExtractionKey] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameDescriptions, setFrameDescriptions] = useState(null);
  const [summary, setSummary] = useState(null);
  const [content, setContent] = useState(null);
  const [viralClips, setViralClips] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [generateContent, setGenerateContent] = useState(true);
  const [error, setError] = useState('');
  const [youtubeMetadata, setYoutubeMetadata] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const clearResults = useCallback(() => {
    setExtractedFrames([]);
    setSelectedFrames([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setViralClips([]);
    setWarnings([]);
    setYoutubeMetadata(null);
    setFrameExtractionKey(0);
  }, []);

  const handleVideoSelect = useCallback((source, errorMsg) => {
    if (videoSource?.type === 'file' && videoSource?.src) {
      URL.revokeObjectURL(videoSource.src);
    }

    setError(errorMsg || '');
    clearResults();
    setVideoSource(source);
  }, [clearResults, videoSource]);

  const handleWorkflowChange = useCallback((nextWorkflow) => {
    setWorkflow(nextWorkflow);
    setError('');
    clearResults();
  }, [clearResults]);

  const handleFrameCountChange = useCallback((event) => {
    const nextValue = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextValue)) return;

    setFrameCount(Math.min(MAX_FRAME_COUNT, Math.max(MIN_FRAME_COUNT, nextValue)));
  }, []);

  const handleQualityChange = useCallback((nextQuality) => {
    const selectedOption = QUALITY_OPTIONS.find((option) => option.value === nextQuality);
    if (!selectedOption) return;

    if (selectedOption.requiresAuth && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setFrameQuality(nextQuality);
  }, [isAuthenticated]);

  const handleExtractionStart = useCallback(() => {
    setIsExtracting(true);
    setExtractedFrames([]);
    setSelectedFrames([]);
    setExtractionProgress('Loading video...');
    setError('');
    setWarnings([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setViralClips([]);
  }, []);

  const handleFrameExtracted = useCallback((_frame, current, total) => {
    setExtractionProgress(`Extracting frame ${current} of ${total}...`);
  }, []);

  const handleExtractionComplete = useCallback((frames) => {
    setExtractedFrames(frames);
    setIsExtracting(false);
    setExtractionProgress('');
  }, []);

  const handleExtractionError = useCallback((message) => {
    setError(message);
    setIsExtracting(false);
    setExtractionProgress('');
  }, []);

  useEffect(() => {
    if (!isAuthenticated && frameQuality !== DEFAULT_QUALITY) {
      setFrameQuality(DEFAULT_QUALITY);
    }
  }, [frameQuality, isAuthenticated]);

  useEffect(() => {
    if (workflow === WORKFLOW_VIRAL && videoSource?.type !== 'file') {
      setWorkflow(WORKFLOW_FRAMES);
      clearResults();
    }
  }, [clearResults, videoSource, workflow]);

  useEffect(() => () => {
    if (videoSource?.type === 'file' && videoSource?.src) {
      URL.revokeObjectURL(videoSource.src);
    }
  }, [videoSource]);

  const handleGenerateFrames = async () => {
    if (!videoSource) {
      setError('Please upload a video or paste a URL first.');
      return;
    }

    setError('');
    setWarnings([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setViralClips([]);
    setSelectedFrames([]);

    if (videoSource.type === 'youtube') {
      setIsExtracting(true);
      setExtractedFrames([]);
      setExtractionProgress('Fetching YouTube thumbnails...');

      try {
        const result = await fetchYouTubeFrames(videoSource.src);
        setExtractedFrames(normalizeYouTubeFrames(result));
        setYoutubeMetadata(result.metadata || null);
      } catch (err) {
        setError(err.message || 'Failed to fetch YouTube thumbnails.');
      } finally {
        setIsExtracting(false);
        setExtractionProgress('');
      }
      return;
    }

    setYoutubeMetadata(null);
    setFrameExtractionKey((current) => current + 1);
  };

  const handleAnalyzeSelectedFrames = async () => {
    if (selectedFrames.length === 0) {
      setError('Select at least one frame to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setWarnings([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setViralClips([]);

    try {
      const result = await analyzeVideoFrames(
        selectedFrames,
        generateContent,
        videoSource?.type === 'youtube' ? youtubeMetadata : null
      );

      if (result.frameDescriptions) {
        setFrameDescriptions(result.frameDescriptions);
      }
      if (result.summary) {
        setSummary(result.summary);
      }
      if (result.content) {
        setContent(result.content);
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze selected frames right now.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateViralClips = async () => {
    if (!videoSource?.file) {
      setError('Please upload a valid video file first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setWarnings([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setViralClips([]);
    setSelectedFrames([]);
    setExtractedFrames([]);
    setYoutubeMetadata(null);
    setExtractionProgress('Uploading video and generating clip candidates...');

    try {
      const result = await analyzeUploadedVideo(videoSource.file);
      setViralClips(result.viralClips || []);
      setWarnings(result.warnings || []);
    } catch (err) {
      console.error('handleGenerateViralClips failed:', err);
      setError(err.message || 'Unable to generate viral clips right now.');
    } finally {
      setIsAnalyzing(false);
      setExtractionProgress('');
    }
  };

  const isBusy = isExtracting || isAnalyzing;
  const isUploadedFile = videoSource?.type === 'file';
  const isFramesWorkflow = workflow === WORKFLOW_FRAMES;
  const isViralWorkflow = workflow === WORKFLOW_VIRAL;
  const canUseViralWorkflow = isUploadedFile;
  const showFrameControls = isFramesWorkflow && videoSource && videoSource.type !== 'youtube';
  const canGenerateFrames = Boolean(videoSource && isFramesWorkflow && !isBusy);
  const canAnalyzeFrames = Boolean(isFramesWorkflow && extractedFrames.length > 0 && selectedFrames.length > 0 && !isBusy);
  const canGenerateViralClips = Boolean(isViralWorkflow && isUploadedFile && videoSource?.file && !isBusy);
  const sourceStateLabel = videoSource
    ? (videoSource.type === 'file'
      ? videoSource.name
      : videoSource.type === 'youtube'
        ? 'YouTube storyboard source loaded'
        : 'Remote video URL loaded')
    : 'No source connected yet';
  const workflowStatus = isFramesWorkflow ? 'Frame review pipeline' : 'Viral clip pipeline';
  const workflowGuidance = isFramesWorkflow
    ? 'Extract a deliberate set of frames, keep the strongest moments, then generate analysis and social-ready copy.'
    : 'Upload a source file and let the model score one frame per second to produce ranked short-form clip candidates.';

  return (
    <div className="vidanalyzer-app">
      <div className="vidanalyzer-card vidanalyzer-card--hero">
        <div className="vidanalyzer-hero">
          <div className="vidanalyzer-header">
            <div className="vidanalyzer-icon">
              <Video size={20} />
            </div>
            <div>
              <div className="vidanalyzer-kicker">LIVE ANALYSIS STUDIO</div>
              <h2>Video Analyzer</h2>
              <p>Choose a manual frame workflow or generate ranked viral clips from an uploaded video.</p>
            </div>
          </div>

          <div className="vidanalyzer-hero-metrics">
            <div className="vidanalyzer-hero-metric">
              <span>Mode</span>
              <strong>{isFramesWorkflow ? 'Frames' : 'Clips'}</strong>
            </div>
            <div className="vidanalyzer-hero-metric">
              <span>Source</span>
              <strong>{videoSource ? 'Ready' : 'Waiting'}</strong>
            </div>
            <div className="vidanalyzer-hero-metric">
              <span>Access</span>
              <strong>{isAuthenticated ? 'Signed in' : 'Guest mode'}</strong>
            </div>
          </div>
        </div>

        <div className="vidanalyzer-control-grid">
          <div className="vidanalyzer-control-main">
            <section className="vidanalyzer-section">
              <div className="vidanalyzer-section-head">
                <span className="vidanalyzer-section-label">Workflow</span>
                <p>Route the source through a manual frame review pass or automatic clip scoring.</p>
              </div>

              <div className="vidanalyzer-workflows" role="radiogroup" aria-label="Video analyzer workflow">
                <button
                  type="button"
                  className={`vidanalyzer-workflow ${isFramesWorkflow ? 'active' : ''}`}
                  onClick={() => handleWorkflowChange(WORKFLOW_FRAMES)}
                  disabled={isBusy}
                >
                  <span className="vidanalyzer-workflow-head">
                    <Clapperboard size={16} />
                    <span>Generate Frames</span>
                  </span>
                  <small>Choose frame count and quality, then analyze only the frames you keep.</small>
                </button>

                <button
                  type="button"
                  className={`vidanalyzer-workflow ${isViralWorkflow ? 'active' : ''} ${!canUseViralWorkflow ? 'locked' : ''}`}
                  onClick={() => canUseViralWorkflow && handleWorkflowChange(WORKFLOW_VIRAL)}
                  disabled={isBusy || !canUseViralWorkflow}
                >
                  <span className="vidanalyzer-workflow-head">
                    <Scissors size={16} />
                    <span>Generate Viral Clips</span>
                  </span>
                  <small>
                    {canUseViralWorkflow
                      ? 'Automatically score one frame per second and return up to 3 ranked clip candidates.'
                      : 'Available only for uploaded files. Disabled for YouTube and linked video URLs.'}
                  </small>
                </button>
              </div>
            </section>

            <section className="vidanalyzer-section">
              <div className="vidanalyzer-section-head">
                <span className="vidanalyzer-section-label">Source</span>
                <p>Upload a local file for full extraction or paste a direct link / YouTube URL.</p>
              </div>

              <VideoInput onVideoSelect={handleVideoSelect} disabled={isBusy} />
            </section>

            {(showFrameControls || (isFramesWorkflow && videoSource?.type === 'youtube') || (isViralWorkflow && isUploadedFile)) && (
              <section className="vidanalyzer-section">
                <div className="vidanalyzer-section-head">
                  <span className="vidanalyzer-section-label">Configuration</span>
                  <p>Set the fidelity and extraction behavior for the current run.</p>
                </div>

                {showFrameControls && (
                  <div className="vidanalyzer-options">
                    <div className="vidanalyzer-settings-grid">
                      <label className="vidanalyzer-field">
                        <span>Frames to extract</span>
                        <input
                          type="number"
                          min={MIN_FRAME_COUNT}
                          max={MAX_FRAME_COUNT}
                          step="1"
                          value={frameCount}
                          onChange={handleFrameCountChange}
                          disabled={isBusy}
                        />
                        <small>Choose between {MIN_FRAME_COUNT} and {MAX_FRAME_COUNT} evenly spaced frames.</small>
                      </label>

                      <div className="vidanalyzer-field">
                        <span>Frame quality</span>
                        <div className="vidanalyzer-quality-grid" role="radiogroup" aria-label="Frame quality">
                          {QUALITY_OPTIONS.map((option) => {
                            const isLocked = option.requiresAuth && !isAuthenticated;
                            const isSelected = frameQuality === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                className={`vidanalyzer-quality-option ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => handleQualityChange(option.value)}
                                aria-pressed={isSelected}
                                disabled={isBusy}
                              >
                                <span className="vidanalyzer-quality-head">
                                  <span>{option.label}</span>
                                  {isLocked && <Lock size={14} />}
                                </span>
                                <small>{option.description}</small>
                              </button>
                            );
                          })}
                        </div>
                        {!isAuthenticated && (
                          <small>
                            Sign in to unlock High and Original quality extraction.
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isFramesWorkflow && videoSource?.type === 'youtube' && (
                  <div className="vidanalyzer-options">
                    <div className="vidanalyzer-upload-note">
                      YouTube frame generation uses platform-provided thumbnails and storyboard frames, so frame quality is controlled by the source video.
                    </div>
                  </div>
                )}

                {isViralWorkflow && isUploadedFile && (
                  <div className="vidanalyzer-options">
                    <div className="vidanalyzer-upload-note">
                      Viral clip generation analyzes the uploaded source at 1 frame per second and trims up to 3 ranked clip candidates automatically.
                    </div>
                  </div>
                )}
              </section>
            )}

            {isFramesWorkflow && videoSource?.type !== 'youtube' && (
              <FrameExtractor
                videoSource={videoSource}
                extractionKey={frameExtractionKey}
                frameCount={frameCount}
                quality={frameQuality}
                onExtractionStart={handleExtractionStart}
                onFrameExtracted={handleFrameExtracted}
                onExtractionComplete={handleExtractionComplete}
                onError={handleExtractionError}
              />
            )}

            {error && (
              <div className="vidanalyzer-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {(isExtracting || isAnalyzing) && (
              <div className="vidanalyzer-progress">
                <div className="vidanalyzer-progress-bar">
                  <div className="vidanalyzer-progress-fill" />
                </div>
                <p>{extractionProgress || (isViralWorkflow ? 'Generating viral clips...' : 'Analyzing selected frames...')}</p>
              </div>
            )}

            <section className="vidanalyzer-section">
              <div className="vidanalyzer-section-head">
                <span className="vidanalyzer-section-label">Run analysis</span>
                <p>Trigger extraction first, then move into summary generation or automatic clip ranking.</p>
              </div>

              <div className="vidanalyzer-actions-stack">
                {isFramesWorkflow && (
                  <>
                    <div className="vidanalyzer-actions">
                      <button
                        className="vidanalyzer-primary"
                        onClick={handleGenerateFrames}
                        disabled={!canGenerateFrames}
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 size={18} className="spinning" />
                            <span>Generating Frames...</span>
                          </>
                        ) : (
                          <>
                            <Clapperboard size={18} />
                            <span>Generate Frames</span>
                          </>
                        )}
                      </button>
                    </div>

                    {extractedFrames.length > 0 && (
                      <>
                        <div className="vidanalyzer-options">
                          <label className="vidanalyzer-checkbox">
                            <input
                              type="checkbox"
                              checked={generateContent}
                              onChange={(event) => setGenerateContent(event.target.checked)}
                              disabled={isAnalyzing}
                            />
                            <span>Also generate LinkedIn, Twitter & Carousel content</span>
                          </label>
                        </div>

                        <div className="vidanalyzer-actions">
                          <button
                            className="vidanalyzer-primary"
                            onClick={handleAnalyzeSelectedFrames}
                            disabled={!canAnalyzeFrames}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 size={18} className="spinning" />
                                <span>Analyzing Selected Frames...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={18} />
                                <span>Analyze Selected Frames</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {isViralWorkflow && (
                  <div className="vidanalyzer-actions">
                    <button
                      className="vidanalyzer-primary"
                      onClick={handleGenerateViralClips}
                      disabled={!canGenerateViralClips}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={18} className="spinning" />
                          <span>Generating Viral Clips...</span>
                        </>
                      ) : (
                        <>
                          <Scissors size={18} />
                          <span>Generate Viral Clips</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="vidanalyzer-sidebar">
            <section className="vidanalyzer-sidepanel">
              <span className="vidanalyzer-sidepanel__label">// CURRENT STATE</span>
              <strong className="vidanalyzer-sidepanel__value">{workflowStatus}</strong>
              <p>{workflowGuidance}</p>
            </section>

            <section className="vidanalyzer-sidepanel">
              <span className="vidanalyzer-sidepanel__label">// SOURCE</span>
              <strong className="vidanalyzer-sidepanel__value">{videoSource ? 'Linked' : 'Awaiting input'}</strong>
              <p>{sourceStateLabel}</p>
            </section>

            <section className="vidanalyzer-sidepanel">
              <span className="vidanalyzer-sidepanel__label">// ACCESS NOTES</span>
              <ul className="vidanalyzer-sidepanel__list">
                <li>Uploaded files unlock the full extraction and viral clip pipeline.</li>
                <li>YouTube sources use available storyboard or thumbnail frames.</li>
                <li>High and Original quality extraction require sign-in.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {isFramesWorkflow && extractedFrames.length > 0 && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <FrameGallery
            frames={extractedFrames}
            frameDescriptions={frameDescriptions}
            selectable={isFramesWorkflow}
            showDownload
            onSelectionChange={setSelectedFrames}
          />
        </MotionDiv>
      )}

      {isFramesWorkflow && summary && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <VideoSummary summary={summary} />
        </MotionDiv>
      )}

      {isViralWorkflow && ((viralClips && viralClips.length > 0) || (warnings && warnings.length > 0)) && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <ViralClips clips={viralClips} warnings={warnings} />
        </MotionDiv>
      )}

      {isFramesWorkflow && content && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <ContentOutput content={content} />
        </MotionDiv>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default VideoAnalyzerApp;
