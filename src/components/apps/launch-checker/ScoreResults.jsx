import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import {
  buildActionPlan,
  calculateScores,
  getScoreLabel,
} from './checklistData';
import ScoreBar from './ScoreBar';
import ShareCard from './ShareCard';

const COUNT_UP_MS = 900;

function getHeadline(score) {
  if (score >= 100) return 'You absolute legend';
  if (score >= 90) return "You're ready to ship";
  if (score >= 70) return 'You are basically launch-ready';
  if (score >= 40) return 'Getting there, a few gaps to close';
  return "Okay... you've got some homework";
}

const ScoreResults = ({ track, answers, email, onEmailChange, onEmailCaptured }) => {
  const [name, setName] = useState('');
  const [displayScore, setDisplayScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const scoreData = useMemo(() => calculateScores(track, answers), [track, answers]);
  const scoreLabel = useMemo(() => getScoreLabel(scoreData.overall), [scoreData.overall]);
  const topGaps = useMemo(() => scoreData.gaps.slice(0, 5), [scoreData.gaps]);
  const actionPlan = useMemo(() => buildActionPlan(track?.id, scoreData.gaps), [track?.id, scoreData.gaps]);

  useEffect(() => {
    const startScore = displayScore;
    const targetScore = scoreData.overall;
    const startAt = performance.now();
    let frameId = null;

    const animate = (now) => {
      const progress = Math.min((now - startAt) / COUNT_UP_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayScore(Math.round(startScore + (targetScore - startScore) * eased));

      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [scoreData.overall]);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    const payload = {
      email: normalizedEmail,
      name: String(name || '').trim(),
      track: track?.id || '',
      answers,
      overallScore: scoreData.overall,
      categoryScores: scoreData.categories,
      topGaps,
    };

    const formData = new URLSearchParams();
    formData.set('form-name', 'launch-readiness-checker');
    formData.set('email', normalizedEmail);
    formData.set('name', payload.name);
    formData.set('track', payload.track);
    formData.set('answers', JSON.stringify(payload.answers));
    formData.set('overallScore', String(payload.overallScore));
    formData.set('categoryScores', JSON.stringify(payload.categoryScores));
    formData.set('topGaps', JSON.stringify(payload.topGaps));

    setIsSubmitting(true);

    try {
      const [netlifySuccess, supabaseSuccess] = await Promise.all([
        (async () => {
          try {
            const response = await fetch('/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            });
            return response.ok;
          } catch {
            return false;
          }
        })(),
        (async () => {
          try {
            const response = await fetch('/api/launch-checker-lead', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            return response.ok;
          } catch {
            return false;
          }
        })(),
      ]);

      if (!netlifySuccess && !supabaseSuccess) {
        throw new Error('Unable to save your email right now. Please try again.');
      }

      setIsUnlocked(true);
      onEmailCaptured?.(normalizedEmail);
    } catch (error) {
      setSubmitError(error.message || 'Unable to save your email right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="launch-results">
      <form
        name="launch-readiness-checker"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        hidden
      >
        <input type="hidden" name="form-name" value="launch-readiness-checker" />
        <input name="bot-field" type="text" />
        <input name="email" type="email" />
        <input name="name" type="text" />
      </form>

      <motion.section
        className="launch-results__hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className={`launch-results__badge ${scoreLabel.colorClass}`}>{scoreLabel.label}</p>
        <h2>{displayScore}%</h2>
        <p className="launch-results__headline">{getHeadline(scoreData.overall)}</p>
      </motion.section>

      <section className="launch-results__panel">
        <h3>Category breakdown</h3>
        <div className="launch-results__bars">
          {scoreData.categories.map((category, index) => (
            <ScoreBar
              key={category.id}
              label={category.name}
              score={category.score}
              delay={index * 0.08}
            />
          ))}
        </div>
      </section>

      <section className="launch-results__panel">
        <h3>Top gaps to fix next</h3>
        {topGaps.length === 0 ? (
          <p className="launch-results__clean">
            <CheckCircle2 size={16} />
            Nice work. No major launch gaps found.
          </p>
        ) : (
          <ul className="launch-results__gaps">
            {topGaps.map((gap) => (
              <li key={gap.questionId}>
                <AlertTriangle size={15} />
                <div>
                  <p className="launch-results__gap-title">{gap.question}</p>
                  <p>{gap.gapMessage}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="launch-results__panel">
        <h3>Share your score</h3>
        <ShareCard track={track} overallScore={scoreData.overall} categoryScores={scoreData.categories} />
      </section>

      <motion.section
        className="launch-results__gate"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <div className="launch-results__gate-head">
          <Lock size={16} />
          <h3>Unlock your personalized action plan</h3>
        </div>

        {!isUnlocked && (
          <form className="launch-results__form" onSubmit={handleEmailSubmit}>
            <label>
              Email (required)
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>

            <label>
              Name (optional)
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </label>

            {submitError && <p className="launch-results__error">{submitError}</p>}

            <button type="submit" className="launch-btn launch-btn--primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="launch-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Reveal my plan
                </>
              )}
            </button>
          </form>
        )}

        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              className="launch-results__unlocked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28 }}
            >
              <p className="launch-results__unlocked-tag">
                <Sparkles size={15} />
                Personalized action plan
              </p>

              <ol className="launch-results__plan">
                {actionPlan.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <div>
                      <p className="launch-results__plan-priority">{item.priority}</p>
                      <p className="launch-results__plan-text">{item.recommendation}</p>
                      <p className="launch-results__plan-meta">{item.categoryName}</p>
                    </div>
                    <a href={item.resourceHref}>{item.resourceLabel}</a>
                  </li>
                ))}
              </ol>

              {track?.id === 'website' && (
                <a className="launch-results__cross-sell" href="/website-cost-estimator">
                  Thinking about a website upgrade? Try our Website Cost Estimator.
                </a>
              )}

              <a href="/contact" className="launch-btn launch-btn--primary">
                Talk to TSH
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
};

export default ScoreResults;
