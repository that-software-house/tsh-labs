import React, { useRef, useEffect, useCallback } from 'react';

const DEFAULT_FRAME_COUNT = 15;
const MIN_FRAMES = 2;
const MAX_FRAMES = 15;
const QUALITY_PRESETS = {
  standard: { jpegQuality: 0.7, targetWidth: 640 },
  high: { jpegQuality: 0.9, targetWidth: 1280 },
  original: { jpegQuality: 0.95, targetWidth: null },
};

function clampFrameCount(value) {
  if (!Number.isFinite(value)) return DEFAULT_FRAME_COUNT;
  return Math.min(MAX_FRAMES, Math.max(MIN_FRAMES, Math.floor(value)));
}

function resolveQualityPreset(quality = 'standard') {
  return QUALITY_PRESETS[quality] || QUALITY_PRESETS.standard;
}

const FrameExtractor = ({
  videoSource,
  extractionKey = 0,
  frameCount = DEFAULT_FRAME_COUNT,
  quality = 'standard',
  onExtractionStart,
  onFrameExtracted,
  onExtractionComplete,
  onError,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const extractFrames = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoSource) return;

    onExtractionStart?.();

    try {
      video.src = videoSource.src;
      if (videoSource.type === 'url') {
        video.crossOrigin = 'anonymous';
      }

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('Failed to load video. Check the file or URL.'));
        // timeout after 15s
        setTimeout(() => reject(new Error('Video loading timed out.')), 15000);
      });

      const duration = video.duration;
      if (!duration || !isFinite(duration)) {
        throw new Error('Could not determine video duration.');
      }

      const totalFrames = clampFrameCount(frameCount);
      const interval = duration / totalFrames;
      const maxSeekTime = Math.max(0, duration - 0.05);
      const timestamps = Array.from({ length: totalFrames }, (_, index) => (
        Math.min(maxSeekTime, (interval * index) + (interval / 2))
      ));
      const { jpegQuality, targetWidth } = resolveQualityPreset(quality);

      // Set canvas dimensions
      const outputWidth = targetWidth ? Math.min(targetWidth, video.videoWidth) : video.videoWidth;
      const scale = outputWidth / video.videoWidth;
      canvas.width = outputWidth;
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');

      const frames = [];

      for (const timestamp of timestamps) {
        video.currentTime = timestamp;

        await new Promise((resolve) => {
          video.onseeked = resolve;
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', jpegQuality);

        const mins = Math.floor(timestamp / 60);
        const secs = Math.floor(timestamp % 60);
        const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

        const frame = { base64, timestamp: formattedTime, rawTime: timestamp };
        frames.push(frame);
        onFrameExtracted?.(frame, frames.length, timestamps.length);
      }

      onExtractionComplete?.(frames);
    } catch (err) {
      onError?.(err.message || 'Failed to extract frames from video.');
    }
  }, [frameCount, onError, onExtractionComplete, onExtractionStart, onFrameExtracted, quality, videoSource]);

  useEffect(() => {
    if (videoSource && extractionKey > 0) {
      extractFrames();
    }
  }, [videoSource, extractionKey, extractFrames]);

  return (
    <>
      <video ref={videoRef} style={{ display: 'none' }} preload="metadata" muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default FrameExtractor;
