import React, { useMemo, useReducer, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepTrackPicker from './launch-checker/StepTrackPicker';
import StepCategory from './launch-checker/StepCategory';
import ScoreResults from './launch-checker/ScoreResults';
import ProgressBar from './cost-estimator/ProgressBar';
import { getTrackById } from './launch-checker/checklistData';
import './CostEstimatorApp.css';
import './LaunchCheckerApp.css';

const TOTAL_STEPS = 7;

const INITIAL_STATE = {
  track: '',
  step: 0,
  answers: {},
  email: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        track: action.payload,
        step: 0,
        answers: {},
      };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.value,
        },
      };
    case 'SET_EMAIL':
      return {
        ...state,
        email: action.payload,
      };
    case 'NEXT_STEP':
      return {
        ...state,
        step: Math.min(TOTAL_STEPS - 1, state.step + 1),
      };
    case 'PREV_STEP':
      return {
        ...state,
        step: Math.max(0, state.step - 1),
      };
    default:
      return state;
  }
}

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0)',
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

function isCategoryComplete(category, answers) {
  if (!category) return false;
  return category.questions.every((question) => ['yes', 'no', 'unsure'].includes(answers[question.id]));
}

const LaunchCheckerApp = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [direction, setDirection] = useState(1);

  const selectedTrack = useMemo(() => getTrackById(state.track), [state.track]);
  const categories = selectedTrack?.categories || [];
  const currentCategory = state.step >= 1 && state.step <= 5 ? categories[state.step - 1] : null;

  const stepLabel = useMemo(() => {
    if (state.step === 0) return 'Choose track';
    if (state.step >= 1 && state.step <= 5) return currentCategory?.name || 'Checklist';
    return 'Results';
  }, [state.step, currentCategory?.name]);

  const showNavigation = state.step < TOTAL_STEPS - 1;
  const canGoBack = state.step > 0;

  const canGoNext = useMemo(() => {
    if (state.step === 0) return Boolean(state.track);
    if (state.step >= 1 && state.step <= 5) {
      return isCategoryComplete(currentCategory, state.answers);
    }
    return false;
  }, [state.step, state.track, currentCategory, state.answers]);

  const handleNext = () => {
    if (!canGoNext) return;
    setDirection(1);
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleBack = () => {
    if (!canGoBack) return;
    setDirection(-1);
    dispatch({ type: 'PREV_STEP' });
  };

  const currentStepView = (() => {
    if (state.step === 0) {
      return (
        <StepTrackPicker
          selectedTrack={state.track}
          onSelect={(trackId) => dispatch({ type: 'SET_TRACK', payload: trackId })}
        />
      );
    }

    if (state.step >= 1 && state.step <= 5) {
      return (
        <StepCategory
          category={currentCategory}
          answers={state.answers}
          onAnswer={(questionId, value) => dispatch({ type: 'SET_ANSWER', payload: { questionId, value } })}
        />
      );
    }

    return (
      <ScoreResults
        track={selectedTrack}
        answers={state.answers}
        email={state.email}
        onEmailChange={(value) => dispatch({ type: 'SET_EMAIL', payload: value })}
        onEmailCaptured={(value) => dispatch({ type: 'SET_EMAIL', payload: value })}
      />
    );
  })();

  return (
    <div className="launch-checker-app">
      <div className="launch-checker-shell">
        <ProgressBar
          currentStep={state.step + 1}
          totalSteps={TOTAL_STEPS}
          stepLabel={stepLabel}
        />

        <div className={`launch-checker-stage ${showNavigation ? 'launch-checker-stage--with-nav' : ''}`}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={`launch-step-${state.step}`}
              className="launch-checker-step"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currentStepView}
            </motion.div>
          </AnimatePresence>
        </div>

        {showNavigation && (
          <div className="launch-nav">
            <button
              type="button"
              className="launch-btn launch-btn--secondary"
              onClick={handleBack}
              disabled={!canGoBack}
            >
              Back
            </button>

            <button
              type="button"
              className="launch-btn launch-btn--primary"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              {state.step === 5 ? 'See score' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaunchCheckerApp;
