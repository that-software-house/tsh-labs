import React from 'react';
import SelectableCard from './SelectableCard';
import { FEATURE_OPTIONS } from './pricingData';

const StepFeatures = ({ selectedFeatures = [], onToggle }) => {
  return (
    <div className="cost-step">
      <header className="cost-step__header">
        <h2>Now the fun part, pick your features</h2>
        <p>Select as many as you need. You can always change this later.</p>
      </header>

      <div className="cost-grid cost-grid--features">
        {FEATURE_OPTIONS.map((option) => (
          <SelectableCard
            key={option.id}
            label={option.label}
            description={option.description}
            selected={selectedFeatures.includes(option.id)}
            onClick={() => onToggle(option.id)}
            priceRange={{ low: option.low, high: option.high }}
          />
        ))}
      </div>
    </div>
  );
};

export default StepFeatures;
