import React from 'react';
import { motion } from 'framer-motion';

function toneClass(score) {
  if (score < 40) return 'launch-score-bar__fill--red';
  if (score < 70) return 'launch-score-bar__fill--amber';
  if (score < 90) return 'launch-score-bar__fill--accent';
  return 'launch-score-bar__fill--green';
}

const ScoreBar = ({ label, score, delay = 0 }) => {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <motion.div
      className="launch-score-bar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <div className="launch-score-bar__meta">
        <span>{label}</span>
        <strong>{clampedScore}%</strong>
      </div>

      <div className="launch-score-bar__track" aria-hidden="true">
        <motion.span
          className={`launch-score-bar__fill ${toneClass(clampedScore)}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
};

export default ScoreBar;
