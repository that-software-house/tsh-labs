import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { formatRange } from './pricingData';

const SelectableCard = ({
  icon: Icon,
  label,
  description,
  selected = false,
  onClick,
  priceRange,
  priceText = '',
}) => {
  const showPrice = priceRange && Number.isFinite(priceRange.low) && Number.isFinite(priceRange.high);

  return (
    <motion.button
      type="button"
      className={`cost-card ${selected ? 'cost-card--selected' : ''}`}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={selected}
    >
      {selected && (
        <span className="cost-card__check" aria-hidden="true">
          <Check size={14} />
        </span>
      )}

      {Icon && (
        <span className="cost-card__icon" aria-hidden="true">
          <Icon size={20} />
        </span>
      )}

      <span className="cost-card__label">{label}</span>
      <span className="cost-card__description">{description}</span>

      {showPrice && (
        <span className="cost-card__price">
          {formatRange(priceRange.low, priceRange.high, priceRange.suffix || '')}
        </span>
      )}
      {!showPrice && priceText && <span className="cost-card__price">{priceText}</span>}
    </motion.button>
  );
};

export default SelectableCard;
