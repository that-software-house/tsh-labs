import React from 'react';
import { BadgeCheck, Download, Flame, Scissors, Sparkles } from 'lucide-react';

function formatClipTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleDownload(download) {
  if (!download?.base64) return;

  const link = document.createElement('a');
  link.href = download.base64;
  link.download = download.filename || 'viral-clip.mp4';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const ViralClips = ({ clips, warnings = [] }) => {
  if ((!clips || clips.length === 0) && (!warnings || warnings.length === 0)) return null;

  return (
    <div className="vidanalyzer-clips">
      <div className="vidanalyzer-clips-header">
        <div>
          <h3 className="vidanalyzer-clips-title">Top Viral Clips</h3>
          <p className="vidanalyzer-clips-subtitle">
            Ranked short-form moments generated from the original uploaded video.
          </p>
        </div>
        <span className="vidanalyzer-clips-badge">
          <Flame size={14} />
          Up to 3 ranked picks
        </span>
      </div>

      {warnings?.length > 0 && (
        <div className="vidanalyzer-clips-warnings">
          {warnings.map((warning, index) => (
            <p key={`${warning}-${index}`}>{warning}</p>
          ))}
        </div>
      )}

      {clips?.length > 0 && (
        <div className="vidanalyzer-clips-grid">
          {clips.map((clip) => (
            <div key={`${clip.rank}-${clip.startSecond}-${clip.endSecond}`} className="vidanalyzer-clip-card">
              <div className="vidanalyzer-clip-rank">#{clip.rank}</div>

              <div className="vidanalyzer-clip-head">
                <div>
                  <h4>{clip.title}</h4>
                  <p>{clip.reason}</p>
                </div>
                <div className="vidanalyzer-clip-score">
                  <Sparkles size={14} />
                  <span>{clip.score}/100</span>
                </div>
              </div>

              <div className="vidanalyzer-clip-meta">
                <span>
                  <Scissors size={13} />
                  {formatClipTime(clip.startSecond)} to {formatClipTime(clip.endSecond)}
                </span>
                <span>
                  <BadgeCheck size={13} />
                  {clip.durationSeconds}s
                </span>
              </div>

              {clip.viralTraits?.length > 0 && (
                <div className="vidanalyzer-clip-traits">
                  {clip.viralTraits.map((trait, index) => (
                    <span key={`${trait}-${index}`} className="vidanalyzer-clip-trait">
                      {trait}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="vidanalyzer-download-btn"
                onClick={() => handleDownload(clip.download)}
                disabled={!clip.download}
              >
                <Download size={16} />
                <span>{clip.download ? 'Download Clip' : clip.downloadError || 'Clip unavailable'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViralClips;
