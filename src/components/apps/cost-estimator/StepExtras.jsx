import React from 'react';
import SelectableCard from './SelectableCard';
import { ADDON_OPTIONS, DESIGN_LEVEL_OPTIONS } from './pricingData';

const StepExtras = ({ selectedDesignLevel, selectedAddons = [], onDesignLevelChange, onToggleAddon }) => {
  return (
    <div className="cost-step">
      <header className="cost-step__header">
        <h2>Almost there, any extras?</h2>
        <p>Choose your design style and any optional add-ons.</p>
      </header>

      <section className="cost-step__section">
        <h3>Design level</h3>
        <div className="cost-grid cost-grid--design">
          {DESIGN_LEVEL_OPTIONS.map((option) => (
            <SelectableCard
              key={option.id}
              label={option.label}
              description={option.description}
              selected={selectedDesignLevel === option.id}
              onClick={() => onDesignLevelChange(option.id)}
              priceRange={{ low: option.low, high: option.high }}
            />
          ))}
        </div>
      </section>

      <section className="cost-step__section">
        <h3>Add-ons</h3>
        <div className="cost-grid cost-grid--addons">
          {ADDON_OPTIONS.map((option) => {
            const suffix = option.pricingType === 'monthly' ? '/mo' : '';
            const priceRange = Number.isFinite(option.low) && Number.isFinite(option.high)
              ? { low: option.low, high: option.high, suffix }
              : null;
            const priceText = option.pricingType === 'multiplier' ? '+30% project total' : '';

            return (
              <SelectableCard
                key={option.id}
                label={option.label}
                description={option.description}
                selected={selectedAddons.includes(option.id)}
                onClick={() => onToggleAddon(option.id)}
                priceRange={priceRange}
                priceText={priceText}
              />
            );
          })}
        </div>

        <p className="cost-step__hint">
          Rush delivery adds +30% to the one-time build total. Maintenance stays separate as monthly pricing.
        </p>
      </section>
    </div>
  );
};

export default StepExtras;
