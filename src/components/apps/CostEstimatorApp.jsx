import React, { useMemo, useReducer, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressBar from './cost-estimator/ProgressBar';
import RunningTotal from './cost-estimator/RunningTotal';
import StepIndustry from './cost-estimator/StepIndustry';
import StepSiteSize from './cost-estimator/StepSiteSize';
import StepFeatures from './cost-estimator/StepFeatures';
import StepExtras from './cost-estimator/StepExtras';
import EstimateResults from './cost-estimator/EstimateResults';
import { calculateEstimate } from './cost-estimator/pricingData';
import './CostEstimatorApp.css';

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  'Business type',
  'Site size',
  'Features',
  'Design and add-ons',
  'Results',
];

const INITIAL_STATE = {
  step: 1,
  industry: '',
  siteSize: '',
  features: [],
  extras: {
    designLevel: 'template',
    addons: [],
  },
  email: '',
};

function toggleValue(values = [], target) {
  return values.includes(target)
    ? values.filter((value) => value !== target)
    : [...values, target];
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INDUSTRY':
      return { ...state, industry: action.payload };
    case 'SET_SITE_SIZE':
      return { ...state, siteSize: action.payload };
    case 'TOGGLE_FEATURE':
      return { ...state, features: toggleValue(state.features, action.payload) };
    case 'SET_DESIGN_LEVEL':
      return {
        ...state,
        extras: {
          ...state.extras,
          designLevel: action.payload,
        },
      };
    case 'TOGGLE_ADDON':
      return {
        ...state,
        extras: {
          ...state.extras,
          addons: toggleValue(state.extras.addons, action.payload),
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
        step: Math.min(TOTAL_STEPS, state.step + 1),
      };
    case 'PREV_STEP':
      return {
        ...state,
        step: Math.max(1, state.step - 1),
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
    filter: 'blur(0px)',
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

const CostEstimatorApp = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [direction, setDirection] = useState(1);

  const selections = useMemo(
    () => ({
      industry: state.industry,
      siteSize: state.siteSize,
      features: state.features,
      extras: state.extras,
    }),
    [state.industry, state.siteSize, state.features, state.extras],
  );

  const estimate = useMemo(() => calculateEstimate(selections), [selections]);

  const canGoBack = state.step > 1;
  const canGoNext =
    (state.step === 1 && Boolean(state.industry)) ||
    (state.step === 2 && Boolean(state.siteSize)) ||
    state.step === 3 ||
    state.step === 4;

  const isInputStep = state.step < TOTAL_STEPS;
  const isLastInputStep = state.step === TOTAL_STEPS - 1;

  const handleNext = () => {
    if (!canGoNext || !isInputStep) return;
    setDirection(1);
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleBack = () => {
    if (!canGoBack) return;
    setDirection(-1);
    dispatch({ type: 'PREV_STEP' });
  };

  const currentStep = (() => {
    switch (state.step) {
      case 1:
        return (
          <StepIndustry
            selectedIndustry={state.industry}
            onSelect={(industryId) => dispatch({ type: 'SET_INDUSTRY', payload: industryId })}
          />
        );
      case 2:
        return (
          <StepSiteSize
            selectedSiteSize={state.siteSize}
            onSelect={(siteSizeId) => dispatch({ type: 'SET_SITE_SIZE', payload: siteSizeId })}
          />
        );
      case 3:
        return (
          <StepFeatures
            selectedFeatures={state.features}
            onToggle={(featureId) => dispatch({ type: 'TOGGLE_FEATURE', payload: featureId })}
          />
        );
      case 4:
        return (
          <StepExtras
            selectedDesignLevel={state.extras.designLevel}
            selectedAddons={state.extras.addons}
            onDesignLevelChange={(designId) => dispatch({ type: 'SET_DESIGN_LEVEL', payload: designId })}
            onToggleAddon={(addonId) => dispatch({ type: 'TOGGLE_ADDON', payload: addonId })}
          />
        );
      case 5:
      default:
        return (
          <EstimateResults
            selections={selections}
            estimate={estimate}
            email={state.email}
            onEmailChange={(value) => dispatch({ type: 'SET_EMAIL', payload: value })}
            onEmailCaptured={(value) => dispatch({ type: 'SET_EMAIL', payload: value })}
          />
        );
    }
  })();

  return (
    <div className="cost-estimator-app">
      <div className="cost-estimator-shell">
        <ProgressBar
          currentStep={state.step}
          totalSteps={TOTAL_STEPS}
          stepLabel={STEP_LABELS[state.step - 1]}
        />

        <div className={`cost-estimator-stage ${isInputStep ? 'cost-estimator-stage--with-total' : ''}`}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={`cost-step-${state.step}`}
              className="cost-estimator-step"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currentStep}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {isInputStep && (
        <RunningTotal
          low={estimate.low}
          high={estimate.high}
          monthlyLow={estimate.monthlyLow}
          monthlyHigh={estimate.monthlyHigh}
          hasMaintenance={estimate.hasMaintenance}
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          isLastStep={isLastInputStep}
        />
      )}
    </div>
  );
};

export default CostEstimatorApp;
