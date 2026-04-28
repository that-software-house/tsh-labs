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
import { createGrokVideoJob, fetchGrokVideoJob } from '@/services/openai';
import './GrokVideoApp.css';

const MAX_IMAGE_BYTES = Number.parseInt(
  import.meta.env.VITE_GROK_VIDEO_MAX_BYTES || import.meta.env.VITE_VIDEO_UPLOAD_MAX_BYTES || '10485760',
  10
);

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DURATION_OPTIONS = [
  { value: 5, label: '5s', note: 'Fast test clip' },
  { value: 10, label: '10s', note: 'Full motion pass' },
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
      body: 'Sending the still image to the Grok video pipeline and starting a new job.',
    };
  }

  if (!job) {
    return {
      title: 'Ready for image',
      body: 'Upload a still image, choose 5 or 10 seconds, and generate an in-app motion preview.',
    };
  }

  if (job.status === 'ready') {
    return {
      title: 'Video ready',
      body: 'The generated clip is available below. The xAI result URL is temporary in this first version.',
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
    body: 'Grok is turning the still image into a short motion clip. Polling will continue automatically.',
  };
}

function getAcceptedTypeLabel() {
  return 'JPG, PNG, or WebP';
}

export default function GrokVideoApp() {
  const { isAuthenticated } = useAuth();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(5);
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
        const nextJob = await fetchGrokVideoJob(job.id);
        setJob(nextJob);
      } catch (pollError) {
        setError(pollError.message || 'Unable to refresh the Grok video job right now.');
      }
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [job]);

  const statusCopy = getStatusCopy(job, isSubmitting);
  const isBusy = isSubmitting || (job && job.status !== 'ready' && job.status !== 'failed');

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
    setJob(null);
    setDurationSeconds(5);
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!imageFile) {
      setError('Upload an image before starting the Grok video job.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setJob(null);

    try {
      const createdJob = await createGrokVideoJob(imageFile, durationSeconds);
      setJob(createdJob);
    } catch (submitError) {
      setError(submitError.message || 'Unable to start the Grok video job.');
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
            <span>GROK IMAGE TO VIDEO</span>
          </div>
          <h2>Turn a still image into a short motion clip.</h2>
          <p>
            This first version uses an internal cinematic motion prompt, requires sign-in, and
            returns the finished video in-app without saving it to storage.
          </p>
        </div>

        <aside className="grokvideo-hero__sidecar">
          <div className="grokvideo-stat">
            <span>Input</span>
            <strong>Image only</strong>
          </div>
          <div className="grokvideo-stat">
            <span>Durations</span>
            <strong>5s or 10s</strong>
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
              <div className="grokvideo-card__eyebrow">// IMAGE INPUT</div>
              <h3>Upload Source Frame</h3>
              <p>Use a clean still image. The model adds motion, not a new prompt-driven scene.</p>
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
              <Clapperboard size={18} />
            </div>
            <div>
              <div className="grokvideo-card__eyebrow">// CLIP LENGTH</div>
              <h3>Choose Duration</h3>
            </div>
          </div>

          <div className="grokvideo-duration-grid">
            {DURATION_OPTIONS.map((option) => (
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
                  : 'The finished video will appear here when Grok completes the job.'}
              </p>
            </div>
          )}
        </section>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
