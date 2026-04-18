import React from 'react';
import { motion } from 'framer-motion';

const OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure' },
];

const ChecklistItem = ({ question, answer, onAnswer, delay = 0 }) => {
  return (
    <motion.article
      className="launch-checklist-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
    >
      <p className="launch-checklist-item__text">{question.text}</p>

      <div className="launch-checklist-item__actions" role="radiogroup" aria-label={question.text}>
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={answer === option.id}
            className={`launch-checklist-item__btn launch-checklist-item__btn--${option.id} ${answer === option.id ? 'is-selected' : ''}`}
            onClick={() => onAnswer(question.id, option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </motion.article>
  );
};

export default ChecklistItem;
