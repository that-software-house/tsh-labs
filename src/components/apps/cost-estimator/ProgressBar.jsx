import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, stepLabel }) => {
  return (
    <div className="cost-progress" aria-live="polite">
      <div className="cost-progress__meta">
        <span className="cost-progress__count">{currentStep} of {totalSteps}</span>
        <span className="cost-progress__label">{stepLabel}</span>
      </div>

      <div
        className="cost-progress__track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isFilled = index < currentStep;
          return (
            <span
              key={`segment-${index + 1}`}
              className={`cost-progress__segment ${isFilled ? 'cost-progress__segment--filled' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
