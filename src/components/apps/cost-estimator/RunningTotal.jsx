import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatRange } from './pricingData';

const ANIMATION_MS = 350;

const RunningTotal = ({
  low,
  high,
  onNext,
  onBack,
  canGoNext,
  canGoBack,
  isLastStep,
  monthlyLow = 0,
  monthlyHigh = 0,
  hasMaintenance = false,
}) => {
  const [displayLow, setDisplayLow] = useState(low);
  const [displayHigh, setDisplayHigh] = useState(high);

  useEffect(() => {
    const startLow = displayLow;
    const startHigh = displayHigh;
    const targetLow = low;
    const targetHigh = high;
    const startTime = performance.now();
    let frameId = null;

    const animate = (now) => {
      const progress = Math.min((now - startTime) / ANIMATION_MS, 1);
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
  }, [low, high]);

  return (
    <div className="cost-total" role="region" aria-label="Running estimate">
      <div className="cost-total__summary">
        <p className="cost-total__label">Estimated cost</p>
        <p className="cost-total__value">{formatRange(displayLow, displayHigh)}</p>
        {hasMaintenance && (
          <p className="cost-total__meta">Maintenance: {formatRange(monthlyLow, monthlyHigh, '/mo')}</p>
        )}
      </div>

      <div className="cost-total__actions">
        <button
          type="button"
          className="cost-btn cost-btn--secondary"
          onClick={onBack}
          disabled={!canGoBack}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          type="button"
          className="cost-btn cost-btn--primary"
          onClick={onNext}
          disabled={!canGoNext}
        >
          {isLastStep ? 'See Results' : 'Next'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default RunningTotal;
