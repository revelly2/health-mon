import React, { useState, Children, ReactNode } from 'react';
import { motion } from 'motion/react';
import './Stepper.css';

interface StepperProps {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: any;
  nextButtonProps?: any;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: any) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      updateStep(currentStep + 1);
    }
  };

  return (
    <div className="outer-container" {...rest}>
      <div className={`step-circle-container ${stepCircleContainerClassName}`}>
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked: number) => {
                      updateStep(clicked);
                    }
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked: number) => {
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          currentStep={currentStep}
          className={`step-content-default ${contentClassName}`}
        >
          {stepsArray}
        </StepContentWrapper>

        <div className={`footer-container ${footerClassName}`}>
          <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
            {currentStep !== 1 && (
              <button
                type="button"
                onClick={handleBack}
                className={`back-button ${currentStep === 1 ? 'inactive' : ''}`}
                {...backButtonProps}
              >
                {backButtonText}
              </button>
            )}
            
            {/* If it's the last step, render a submit button. Otherwise render a regular button that calls handleNext */}
            {isLastStep ? (
              <button 
                type="submit"
                className="next-button" 
                onClick={onFinalStepCompleted}
                {...nextButtonProps}
              >
                Complete
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleNext} 
                className="next-button" 
                {...nextButtonProps}
              >
                {nextButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContentWrapper({ currentStep, children, className }: any) {
  // We keep all children in the DOM but slide them horizontally so we don't break HTML form validation
  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}
        animate={{ x: `-${(currentStep - 1) * 100}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      >
        {children.map((child: any, idx: number) => (
          <div key={idx} style={{ minWidth: '100%', flexShrink: 0, opacity: currentStep === idx + 1 ? 1 : 0.3, transition: 'opacity 0.4s' }}>
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return <div className="step-default">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: any) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div onClick={handleClick} className="step-indicator" style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.5 } : {}} animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' },
          active: { scale: 1, backgroundColor: 'var(--color-primary)', color: 'white' },
          complete: { scale: 1, backgroundColor: 'var(--color-primary)', color: 'white' }
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === 'complete' ? (
          <CheckIcon className="check-icon" />
        ) : status === 'active' ? (
          <div className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: 'var(--color-primary)' }
  };

  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
