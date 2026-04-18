import React from 'react';
import SelectableCard from './SelectableCard';
import { SITE_SIZE_OPTIONS } from './pricingData';

const StepSiteSize = ({ selectedSiteSize, onSelect }) => {
  return (
    <div className="cost-step">
      <header className="cost-step__header">
        <h2>How much real estate are we talking?</h2>
        <p>This sets the base range for your estimate.</p>
      </header>

      <div className="cost-grid cost-grid--sizes">
        {SITE_SIZE_OPTIONS.map((option) => (
          <SelectableCard
            key={option.id}
            label={option.label}
            description={option.description}
            selected={selectedSiteSize === option.id}
            onClick={() => onSelect(option.id)}
            priceRange={{ low: option.low, high: option.high }}
          />
        ))}
      </div>
    </div>
  );
};

export default StepSiteSize;
