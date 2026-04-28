import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Clapperboard,
  Film,
  ImagePlus,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { createThatVideoJob, fetchThatVideoJob } from '@/services/openai';
import './GrokVideoApp.css';

const MAX_IMAGE_BYTES = Number.parseInt(
  import.meta.env.VITE_GROK_VIDEO_MAX_BYTES || import.meta.env.VITE_VIDEO_UPLOAD_MAX_BYTES || '10485760',
  10
);
const MAX_PROMPT_CHARS = 2000;
const RESOLUTION_RATES = {
  '480p': Number.parseFloat(import.meta.env.VITE_GROK_VIDEO_RATE_480P || '0.06'),
  '720p': Number.parseFloat(import.meta.env.VITE_GROK_VIDEO_RATE_720P || '0.084'),
};
const SORA_2_RATE = Number.parseFloat(import.meta.env.VITE_SORA_2_RATE || '0.10');
const MODEL_OPTIONS = [
  { value: 'grok-imagine-video', label: 'Grok Imagine', note: 'xAI image-to-video' },
  { value: 'sora-2', label: 'Sora 2', note: 'OpenAI video generation' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const GROK_DURATION_OPTIONS = [
  { value: 5, label: '5s', note: 'Fast test clip' },
  { value: 10, label: '10s', note: 'Full motion pass' },
];
const SORA_DURATION_OPTIONS = [
  { value: 4, label: '4s', note: 'Shortest supported' },
  { value: 8, label: '8s', note: 'Balanced default' },
  { value: 12, label: '12s', note: 'Longer render' },
];
const GROK_ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'Auto', note: 'Use image ratio' },
  { value: '9:16', label: '9:16', note: 'Vertical social' },
  { value: '16:9', label: '16:9', note: 'Landscape video' },
  { value: '1:1', label: '1:1', note: 'Square output' },
  { value: '3:4', label: '3:4', note: 'Tall portrait' },
  { value: '4:3', label: '4:3', note: 'Classic frame' },
  { value: '2:3', label: '2:3', note: 'Portrait photo' },
  { value: '3:2', label: '3:2', note: 'Wide photo' },
];
const SORA_ASPECT_RATIO_OPTIONS = [
  { value: 'auto', label: 'Auto', note: 'Infer from image orientation' },
  { value: '9:16', label: '9:16', note: 'Portrait video' },
  { value: '16:9', label: '16:9', note: 'Landscape video' },
];
const GROK_RESOLUTION_OPTIONS = [
  { value: 'auto', label: 'Auto', note: 'Use xAI default' },
  { value: '480p', label: '480p', note: 'Lower cost, faster' },
  { value: '720p', label: '720p', note: 'Sharper output' },
];

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getStatusCopy(job, isSubmitting) {
  if (isSubmitting) {
    return {
      title: 'Uploading image',
      body: 'Sending the still image to the selected video model and starting a new job.',
    };
  }

  if (!job) {
    return {
      title: 'Ready for image',
      body: 'Upload a still image, choose a model and duration, and generate an in-app motion preview.',
    };
  }

  if (job.status === 'ready') {
    return {
      title: 'Video ready',
      body: 'The generated clip is available below. This first version only keeps the result available in-app for a short window.',
    };
  }

  if (job.status === 'failed') {
    return {
      title: 'Generation failed',
      body: job.error || 'The video request did not finish successfully. Try a different image and rerun it.',
    };
  }

  return {
    title: 'Generating motion',
    body: `${job.model === 'sora-2' ? 'Sora 2' : 'Grok Imagine'} is turning the still image into a short motion clip. Polling will continue automatically.`,
  };
}

function getAcceptedTypeLabel() {
  return 'JPG, PNG, or WebP';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatOptionLabel(value) {
  return value === 'auto' ? 'Auto' : value;
}

export default function GrokVideoApp() {
  const { isAuthenticated } = useAuth();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState('grok-imagine-video');
  const [prompt, setPrompt] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [resolution, setResolution] = useState('auto');
  const [job, setJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    if (!job?.id || job.status === 'ready' || job.status === 'failed') {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const nextJob = await fetchThatVideoJob(job.id);
        setJob(nextJob);
      } catch (pollError) {
        setError(pollError.message || 'Unable to refresh the THAT Video job right now.');
      }
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [job]);

  const statusCopy = getStatusCopy(job, isSubmitting);
  const isBusy = isSubmitting || (job && job.status !== 'ready' && job.status !== 'failed');
  const isSoraModel = selectedModel === 'sora-2';
  const durationOptions = isSoraModel ? SORA_DURATION_OPTIONS : GROK_DURATION_OPTIONS;
  const aspectRatioOptions = isSoraModel ? SORA_ASPECT_RATIO_OPTIONS : GROK_ASPECT_RATIO_OPTIONS;
  const resolutionOptions = isSoraModel ? [] : GROK_RESOLUTION_OPTIONS;
  const effectiveResolution = isSoraModel ? 'standard' : (resolution === 'auto' ? '480p' : resolution);
  const estimatedRate = isSoraModel ? SORA_2_RATE : (RESOLUTION_RATES[effectiveResolution] || 0);
  const estimatedCost = durationSeconds * estimatedRate;
  const currentModel = job?.model || selectedModel;
  const currentAspectRatio = job?.aspectRatio || aspectRatio;
  const currentResolution = job?.resolution || resolution;
  const formatSummary = currentModel === 'sora-2'
    ? `${formatOptionLabel(currentAspectRatio)} · OpenAI preset`
    : `${formatOptionLabel(currentAspectRatio)} · ${formatOptionLabel(currentResolution)}`;

  useEffect(() => {
    if (selectedModel === 'sora-2') {
      if (![4, 8, 12].includes(durationSeconds)) {
        setDurationSeconds(8);
      }
      if (!['auto', '9:16', '16:9'].includes(aspectRatio)) {
        setAspectRatio('auto');
      }
      setResolution('auto');
      return;
    }

    if (![5, 10].includes(durationSeconds)) {
      setDurationSeconds(5);
    }
  }, [aspectRatio, durationSeconds, selectedModel]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    if (!nextFile) return;

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError(`Unsupported file type. Use ${getAcceptedTypeLabel()}.`);
      return;
    }

    if (nextFile.size > MAX_IMAGE_BYTES) {
      setError(`Image is too large. Keep uploads under ${formatBytes(MAX_IMAGE_BYTES)}.`);
      return;
    }

    setError('');
    setJob(null);
    setImageFile(nextFile);
  };

  const handleReset = () => {
    setError('');
    setImageFile(null);
    setSelectedModel('grok-imagine-video');
    setPrompt('');
    setJob(null);
    setDurationSeconds(5);
    setAspectRatio('auto');
    setResolution('auto');
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!imageFile) {
      setError('Upload an image before starting the THAT Video job.');
      return;
    }

    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      setError('Add a prompt describing how the image should animate.');
      return;
    }

    if (normalizedPrompt.length > MAX_PROMPT_CHARS) {
      setError(`Prompt is too long. Keep it under ${MAX_PROMPT_CHARS} characters.`);
      return;
    }

    setError('');
    setIsSubmitting(true);
    setJob(null);

    try {
      const createdJob = await createThatVideoJob(
        imageFile,
        normalizedPrompt,
        durationSeconds,
        selectedModel,
        aspectRatio,
        resolution
      );
      setJob(createdJob);
    } catch (submitError) {
      setError(submitError.message || 'Unable to start the THAT Video job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grokvideo-app">
      <header className="grokvideo-hero">
        <div className="grokvideo-hero__copy">
          <div className="grokvideo-kicker">
            <Sparkles size={14} />
            <span>THAT VIDEO</span>
          </div>
          <h2>Turn a still image into a short motion clip.</h2>
          <p>
            Upload a source image, pick a video model, describe the motion you want, and preview
            the generated clip in-app.
          </p>
        </div>

        <aside className="grokvideo-hero__sidecar">
          <div className="grokvideo-stat">
            <span>Input</span>
            <strong>Image + prompt</strong>
          </div>
          <div className="grokvideo-stat">
            <span>Models</span>
            <strong>Grok + Sora</strong>
          </div>
          <div className="grokvideo-stat">
            <span>Access</span>
            <strong>Authenticated</strong>
          </div>
        </aside>
      </header>

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grokvideo-error"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isAuthenticated ? (
        <section className="grokvideo-authgate">
          <div className="grokvideo-authgate__icon">
            <Lock size={22} />
          </div>
          <div>
            <h3>Sign in required</h3>
            <p>
              This app is gated so video generation, usage tracking, and future storage billing all
              stay tied to the current user account.
            </p>
          </div>
          <button className="grokvideo-primary" onClick={() => setShowAuthModal(true)}>
            Sign in to continue
          </button>
        </section>
      ) : null}

      <div className="grokvideo-grid">
        <section className="grokvideo-card">
          <div className="grokvideo-card__header">
            <div className="grokvideo-card__icon">
              <ImagePlus size={18} />
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// MODEL SELECTOR</div>
              <h3>Choose Video Model</h3>
              <p>Switch between xAI Grok Imagine and OpenAI Sora 2.</p>
            </div>
          </div>

          <div className="grokvideo-option-grid">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`grokvideo-duration ${selectedModel === option.value ? 'is-active' : ''}`}
                onClick={() => setSelectedModel(option.value)}
                disabled={isBusy}
              >
                <strong>{option.label}</strong>
                <span>{option.note}</span>
              </button>
            ))}
          </div>

          <div className="grokvideo-card__header grokvideo-card__header--compact">
            <div className="grokvideo-card__icon">
              <ImagePlus size={18} />
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// IMAGE INPUT</div>
              <h3>Upload Source Frame</h3>
              <p>Use a clean still image. The selected model will animate it from your prompt.</p>
            </div>
          </div>

          <label className={`grokvideo-dropzone ${imageFile ? 'has-file' : ''}`}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isBusy}
            />
            <div className="grokvideo-dropzone__content">
              {previewUrl ? (
                <img src={previewUrl} alt="Uploaded preview" className="grokvideo-preview" />
              ) : (
                <div className="grokvideo-placeholder">
                  <ImagePlus size={24} />
                  <span>Drop in an image or browse from disk</span>
                </div>
              )}
            </div>
          </label>

          <div className="grokvideo-filemeta">
            <span>{getAcceptedTypeLabel()}</span>
            <span>Up to {formatBytes(MAX_IMAGE_BYTES)}</span>
            {imageFile ? <strong>{imageFile.name} · {formatBytes(imageFile.size)}</strong> : null}
          </div>

          <div className="grokvideo-card__header grokvideo-card__header--compact">
            <div className="grokvideo-card__icon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// MOTION PROMPT</div>
              <h3>Describe the animation</h3>
              <p>Tell the selected model what should move, how the camera behaves, and the mood of the shot.</p>
            </div>
          </div>

          <div className="grokvideo-prompt">
            <textarea
              className="grokvideo-textarea"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value.slice(0, MAX_PROMPT_CHARS))}
              placeholder="Example: Slow cinematic push-in, hair and fabric moving gently in the wind, soft afternoon light, realistic natural motion."
              maxLength={MAX_PROMPT_CHARS}
              disabled={isBusy}
            />
            <div className="grokvideo-prompt__meta">
              <span>Be specific about motion, camera, and pacing.</span>
              <strong>{prompt.length}/{MAX_PROMPT_CHARS}</strong>
            </div>
          </div>

          <div className="grokvideo-card__header grokvideo-card__header--compact">
            <div className="grokvideo-card__icon">
              <Clapperboard size={18} />
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// CLIP LENGTH</div>
              <h3>Choose Duration</h3>
            </div>
          </div>

          <div className="grokvideo-duration-grid">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`grokvideo-duration ${durationSeconds === option.value ? 'is-active' : ''}`}
                onClick={() => setDurationSeconds(option.value)}
                disabled={isBusy}
              >
                <strong>{option.label}</strong>
                <span>{option.note}</span>
              </button>
            ))}
          </div>

          <div className="grokvideo-card__header grokvideo-card__header--compact">
            <div className="grokvideo-card__icon">
              <Film size={18} />
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// FRAME SHAPE</div>
              <h3>Aspect Ratio</h3>
              <p>
                {isSoraModel
                  ? 'Sora 2 supports portrait or landscape. Auto leaves it to the app default.'
                  : 'Use Auto to preserve the uploaded image ratio and avoid xAI stretching.'}
              </p>
            </div>
          </div>

          <div className="grokvideo-option-grid grokvideo-option-grid--aspect">
            {aspectRatioOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`grokvideo-duration ${aspectRatio === option.value ? 'is-active' : ''}`}
                onClick={() => setAspectRatio(option.value)}
                disabled={isBusy}
              >
                <strong>{option.label}</strong>
                <span>{option.note}</span>
              </button>
            ))}
          </div>

          {!isSoraModel ? (
            <>
              <div className="grokvideo-card__header grokvideo-card__header--compact">
                <div className="grokvideo-card__icon">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <div className="grokvideo-card__eyebrow">// OUTPUT QUALITY</div>
                  <h3>Resolution</h3>
                  <p>Auto omits the field and lets xAI use its default generation resolution.</p>
                </div>
              </div>

              <div className="grokvideo-option-grid">
                {resolutionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`grokvideo-duration ${resolution === option.value ? 'is-active' : ''}`}
                    onClick={() => setResolution(option.value)}
                    disabled={isBusy}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.note}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="grokvideo-inline-note">
              <strong>Sora 2 sizing</strong>
              <p>Sora 2 uses OpenAI video size presets derived from the selected aspect ratio.</p>
            </div>
          )}

          <div className="grokvideo-cost">
            <div className="grokvideo-cost__eyebrow">// ROUGH COST ESTIMATE</div>
            <div className="grokvideo-cost__row">
              <div>
                <strong>{formatCurrency(estimatedCost)}</strong>
                <p>
                  {formatCurrency(estimatedRate)}/sec on {selectedModel === 'sora-2' ? 'Sora 2' : `Grok ${formatOptionLabel(effectiveResolution)}`} × {durationSeconds}s
                </p>
              </div>
              <span className="grokvideo-cost__badge">Estimate only</span>
            </div>
            <p className="grokvideo-cost__note">
              {selectedModel === 'sora-2'
                ? 'Rough estimate based on OpenAI Sora 2 per-second pricing. Update `VITE_SORA_2_RATE` if your billing differs.'
                : 'Rough estimate based on selected duration and resolution. For Auto, this assumes xAI\'s documented 480p default. Update `VITE_GROK_VIDEO_RATE_480P` and `VITE_GROK_VIDEO_RATE_720P` if your xAI billing differs.'}
            </p>
          </div>

          <div className="grokvideo-actions">
            <button className="grokvideo-primary" onClick={handleGenerate} disabled={isBusy || !imageFile}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="grokvideo-spin" />
                  Starting job...
                </>
              ) : (
                <>
                  <Film size={16} />
                  Generate video
                </>
              )}
            </button>

            <button className="grokvideo-secondary" onClick={handleReset} disabled={isBusy && !job}>
              Reset
            </button>
          </div>
        </section>

        <section className="grokvideo-card grokvideo-card--output">
          <div className="grokvideo-card__header">
            <div className="grokvideo-card__icon">
              {job?.status === 'failed' ? (
                <AlertCircle size={18} />
              ) : job?.status === 'ready' ? (
                <Film size={18} />
              ) : (
                <RefreshCw size={18} className={isBusy ? 'grokvideo-spin' : ''} />
              )}
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// JOB STATUS</div>
              <h3>{statusCopy.title}</h3>
              <p>{statusCopy.body}</p>
            </div>
          </div>

          <div className="grokvideo-statuspanel">
            <div>
              <span>Status</span>
              <strong>{job?.status || (isSubmitting ? 'starting' : 'idle')}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{Number.isFinite(job?.progress) ? `${job.progress}%` : isSubmitting ? '...' : '0%'}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{job?.durationSeconds || durationSeconds}s</strong>
            </div>
            <div>
              <span>Model</span>
              <strong>{currentModel === 'sora-2' ? 'Sora 2' : 'Grok Imagine'}</strong>
            </div>
            <div>
              <span>Format</span>
              <strong>{formatSummary}</strong>
            </div>
          </div>

          <div className="grokvideo-progress">
            <div
              className={`grokvideo-progress__fill ${job?.status === 'failed' ? 'is-failed' : ''}`}
              style={{ width: `${Math.max(6, Number.isFinite(job?.progress) ? job.progress : isSubmitting ? 14 : 6)}%` }}
            />
          </div>

          {job?.videoUrl ? (
            <div className="grokvideo-result">
              <video
                className="grokvideo-video"
                src={job.videoUrl}
                controls
                playsInline
                preload="metadata"
              />
              <div className="grokvideo-result__meta">
                <span>The generated video URL is temporary in v1.</span>
                <a href={job.videoUrl} target="_blank" rel="noreferrer">
                  Open video directly
                </a>
              </div>
            </div>
          ) : (
            <div className="grokvideo-empty">
              <Film size={26} />
              <p>
                {job?.status === 'failed'
                  ? 'This run failed before a playable result was returned.'
                  : 'The finished video will appear here when the selected model completes the job.'}
              </p>
            </div>
          )}
        </section>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
