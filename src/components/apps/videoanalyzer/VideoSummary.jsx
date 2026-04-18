import React from 'react';
import { Film, Users, Hash, Clock, Tag } from 'lucide-react';

const VideoSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="vidanalyzer-summary">
      <div className="vidanalyzer-summary-header">
        <h3>{summary.title}</h3>
        <span className="vidanalyzer-summary-type">
          <Film size={14} />
          {summary.videoType}
        </span>
      </div>

      <p className="vidanalyzer-summary-text">{summary.summary}</p>

      {summary.keyMoments?.length > 0 && (
        <div className="vidanalyzer-summary-section">
          <h4><Clock size={14} /> Key Moments</h4>
          <div className="vidanalyzer-moments-list">
            {summary.keyMoments.map((moment, idx) => (
              <div key={idx} className="vidanalyzer-moment-item">
                <span className="vidanalyzer-moment-time">{moment.timestamp}</span>
                <span className="vidanalyzer-moment-desc">{moment.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.topics?.length > 0 && (
        <div className="vidanalyzer-summary-section">
          <h4><Tag size={14} /> Topics</h4>
          <div className="vidanalyzer-tags">
            {summary.topics.map((topic, idx) => (
              <span key={idx} className="vidanalyzer-tag">{topic}</span>
            ))}
          </div>
        </div>
      )}

      {summary.hashtags?.length > 0 && (
        <div className="vidanalyzer-summary-section">
          <h4><Hash size={14} /> Hashtags</h4>
          <div className="vidanalyzer-tags">
            {summary.hashtags.map((tag, idx) => (
              <span key={idx} className="vidanalyzer-hashtag">{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="vidanalyzer-summary-meta">
        <span><Users size={13} /> {summary.targetAudience}</span>
        <span>Tone: {summary.tone}</span>
      </div>
    </div>
  );
};

export default VideoSummary;
