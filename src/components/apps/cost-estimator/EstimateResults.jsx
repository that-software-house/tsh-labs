import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import {
  calculateTimeline,
  COST_TIPS,
  formatRange,
  getLineItemBreakdown,
  getSelectionSummary,
  serializeSelections,
} from './pricingData';

const RESULT_ANIMATION_MS = 850;

const EstimateResults = ({ selections, estimate, email, onEmailChange, onEmailCaptured }) => {
  const [name, setName] = useState('');
  const [displayLow, setDisplayLow] = useState(0);
  const [displayHigh, setDisplayHigh] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const summaryRows = useMemo(() => getSelectionSummary(selections), [selections]);
  const lineItems = useMemo(() => getLineItemBreakdown(selections), [selections]);
  const timeline = useMemo(() => calculateTimeline(selections), [selections]);

  useEffect(() => {
    const startLow = displayLow;
    const startHigh = displayHigh;
    const targetLow = estimate.low;
    const targetHigh = estimate.high;
    const startAt = performance.now();
    let frameId = null;

    const animate = (now) => {
      const progress = Math.min((now - startAt) / RESULT_ANIMATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;

      setDisplayLow(Math.round(startLow + (targetLow - startLow) * eased));
      setDisplayHigh(Math.round(startHigh + (targetHigh - startHigh) * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [estimate.low, estimate.high]);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    const selectionsPayload = serializeSelections(selections);
    const formData = new URLSearchParams();
    formData.set('form-name', 'website-cost-estimator');
    formData.set('email', normalizedEmail);
    formData.set('name', String(name || '').trim());
    formData.set('industry', selectionsPayload.industry);
    formData.set('siteSize', selectionsPayload.siteSize);
    formData.set('features', JSON.stringify(selectionsPayload.features));
    formData.set('extras', JSON.stringify(selectionsPayload.extras));
    formData.set('estimateLow', String(estimate.low));
    formData.set('estimateHigh', String(estimate.high));

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
            const response = await fetch('/api/cost-estimator-lead', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: normalizedEmail,
                name: String(name || '').trim(),
                ...selectionsPayload,
                estimateLow: estimate.low,
                estimateHigh: estimate.high,
              }),
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
    <div className="cost-results">
      <form
        name="website-cost-estimator"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        hidden
      >
        <input type="hidden" name="form-name" value="website-cost-estimator" />
        <input name="bot-field" type="text" />
        <input name="email" type="email" />
        <input name="name" type="text" />
      </form>

      <motion.section
        className="cost-results__hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="cost-results__tag">Here&apos;s the damage</p>
        <h2>{formatRange(displayLow, displayHigh)}</h2>
        {estimate.hasMaintenance && (
          <p className="cost-results__maintenance">
            Plus maintenance: {formatRange(estimate.monthlyLow, estimate.monthlyHigh, '/mo')}
          </p>
        )}
        <p className="cost-results__timeline">Estimated timeline: {timeline.label}</p>
      </motion.section>

      <div className="cost-results__grid">
        <motion.section
          className="cost-results__panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <h3>Summary</h3>
          <ul className="cost-results__list">
            {summaryRows.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          className="cost-results__panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <h3>What&apos;s included right now</h3>
          <ul className="cost-results__list cost-results__list--plain">
            <li>Total one-time estimate range</li>
            <li>Your selected scope summary</li>
            <li>Estimated timeline for delivery</li>
          </ul>
        </motion.section>
      </div>

      <motion.section
        className="cost-results__gate"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <div className="cost-results__gate-header">
          <Lock size={16} />
          <h3>Unlock the full breakdown</h3>
        </div>

        {!isUnlocked && (
          <form className="cost-results__form" onSubmit={handleEmailSubmit}>
            <label>
              Email (required)
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
                placeholder="you@company.com"
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

            {submitError && <p className="cost-results__error">{submitError}</p>}

            <button type="submit" className="cost-btn cost-btn--primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="cost-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Reveal full estimate
                </>
              )}
            </button>
          </form>
        )}

        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              className="cost-results__unlocked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="cost-results__unlocked-head">
                <Sparkles size={16} />
                <p>Full breakdown unlocked</p>
              </div>

              <div className="cost-results__grid">
                <section className="cost-results__panel">
                  <h3>Line-item estimate</h3>
                  <ul className="cost-results__breakdown">
                    {lineItems.map((item) => (
                      <li key={item.id}>
                        <span>{item.label}</span>
                        <span>{formatRange(item.low, item.high, item.type === 'monthly' ? '/mo' : '')}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="cost-results__panel">
                  <h3>What to expect when hiring a developer</h3>
                  <ul className="cost-results__list cost-results__list--plain">
                    {COST_TIPS.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="cost-results__panel">
                <h3>DIY vs template vs custom</h3>
                <div className="cost-results__compare">
                  <article>
                    <h4>DIY Builder</h4>
                    <p>Lowest upfront cost, but highest owner time investment.</p>
                  </article>
                  <article>
                    <h4>Template Build</h4>
                    <p>Fastest route to launch for most small businesses.</p>
                  </article>
                  <article>
                    <h4>Custom Build</h4>
                    <p>Best for unique workflows, scaling, and premium brand positioning.</p>
                  </article>
                </div>
              </section>

              <a href="/contact" className="cost-btn cost-btn--primary cost-results__cta">
                Talk to TSH
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
};

export default EstimateResults;
