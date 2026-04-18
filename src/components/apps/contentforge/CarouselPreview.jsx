import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';

const gradients = [
  'contentforge-carousel-gradient--1',
  'contentforge-carousel-gradient--2',
  'contentforge-carousel-gradient--3',
  'contentforge-carousel-gradient--4',
  'contentforge-carousel-gradient--5',
  'contentforge-carousel-gradient--6',
];

function CarouselPreview({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="contentforge-carousel">
      <div className="contentforge-carousel-stage">
        <div
          className={`contentforge-carousel-frame ${gradients[currentSlide % gradients.length]}`}
        >
          <div className="contentforge-carousel-frame__orb contentforge-carousel-frame__orb--top"></div>
          <div className="contentforge-carousel-frame__orb contentforge-carousel-frame__orb--bottom"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.3 }}
              className="contentforge-carousel-frame__copy"
            >
              <p>{slides[currentSlide]}</p>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="contentforge-carousel-nav contentforge-carousel-nav--prev"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="contentforge-carousel-nav contentforge-carousel-nav--next"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          <div className="contentforge-carousel-counter">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>

      <div className="contentforge-carousel-dots">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`contentforge-carousel-dot ${index === currentSlide ? 'is-active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="contentforge-carousel-grid">
        {slides.map((slide, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`contentforge-carousel-thumb ${index === currentSlide ? 'is-active' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`contentforge-carousel-thumb__wash ${gradients[index % gradients.length]}`}
            ></div>

            <div className="contentforge-carousel-thumb__copy">
              <div className="contentforge-carousel-thumb__head">
                <span className="contentforge-carousel-thumb__label">
                  Slide {index + 1}
                </span>
                {index === currentSlide && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="contentforge-carousel-thumb__pulse"
                  ></motion.div>
                )}
              </div>
              <div className="contentforge-carousel-thumb__text">
                {slide}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default CarouselPreview;
