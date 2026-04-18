import React from 'react';
import { Briefcase, Heart, Home, ShoppingBag, Sparkles, Utensils } from 'lucide-react';
import SelectableCard from './SelectableCard';
import { INDUSTRY_OPTIONS } from './pricingData';

const ICONS = {
  Utensils,
  ShoppingBag,
  Briefcase,
  Heart,
  Home,
  Sparkles,
};

const StepIndustry = ({ selectedIndustry, onSelect }) => {
  return (
    <div className="cost-step">
      <header className="cost-step__header">
        <h2>First things first, what&apos;s your vibe?</h2>
        <p>Pick the option that feels closest to your business type.</p>
      </header>

      <div className="cost-grid cost-grid--industry">
        {INDUSTRY_OPTIONS.map((option) => {
          const Icon = ICONS[option.icon] || Sparkles;

          return (
            <SelectableCard
              key={option.id}
              icon={Icon}
              label={option.label}
              description={option.description}
              selected={selectedIndustry === option.id}
              onClick={() => onSelect(option.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StepIndustry;
