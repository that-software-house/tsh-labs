import React from 'react';
import { Linkedin, Twitter, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const formats = [
  {
    id: 'linkedin',
    label: 'LinkedIn Post',
    icon: Linkedin,
    description: 'Professional post with key insights',
  },
  {
    id: 'twitter',
    label: 'Twitter Thread',
    icon: Twitter,
    description: 'Multi-tweet thread format',
  },
  {
    id: 'carousel',
    label: 'Carousel Slides',
    icon: Layout,
    description: 'Instagram/LinkedIn carousel',
  },
];

function OutputFormatSelector({ selectedFormats, setSelectedFormats }) {
  const toggleFormat = (formatId) => {
    if (selectedFormats.includes(formatId)) {
      setSelectedFormats(selectedFormats.filter((f) => f !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };

  return (
    <div className="contentforge-format-list">
      {formats.map((format, index) => {
        const isSelected = selectedFormats.includes(format.id);
        const Icon = format.icon;

        return (
          <motion.button
            key={format.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => toggleFormat(format.id)}
            className={`contentforge-format-card ${isSelected ? 'is-selected' : ''}`}
          >
            <div className="contentforge-format-card__inner">
              <div className="contentforge-format-card__icon">
                <Icon className="h-6 w-6" />
              </div>
              <div className="contentforge-format-card__copy">
                <div className="contentforge-format-card__row">
                  <h4>{format.label}</h4>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="contentforge-format-card__check"
                    >
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p>{format.description}</p>
              </div>
            </div>
          </motion.button>
        );
      })}

      {selectedFormats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="contentforge-format-warning"
        >
          <svg
            className="h-5 w-5 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p>Please select at least one output format to continue</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default OutputFormatSelector;
