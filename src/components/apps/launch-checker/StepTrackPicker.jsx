import React from 'react';
import { Globe, Rocket } from 'lucide-react';
import SelectableCard from '../cost-estimator/SelectableCard';

const TRACK_OPTIONS = [
  {
    id: 'product',
    label: 'Product / App',
    description: 'SaaS, mobile app, or digital product launch.',
    icon: Rocket,
  },
  {
    id: 'website',
    label: 'Website',
    description: 'Business website, portfolio, or online store launch.',
    icon: Globe,
  },
];

const StepTrackPicker = ({ selectedTrack, onSelect }) => {
  return (
    <div className="launch-step">
      <header className="launch-step__header">
        <h2>What are you launching?</h2>
        <p>Choose the track that matches your launch so we can score what matters most.</p>
      </header>

      <div className="launch-track-grid">
        {TRACK_OPTIONS.map((option) => (
          <SelectableCard
            key={option.id}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={selectedTrack === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepTrackPicker;
