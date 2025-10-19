import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OnboardingModal.module.css';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup?: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSignup }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      image: '/assets/teacher_base.png',
      caption: 'Meet your cat professor - ready to help you learn!'
    },
    {
      image: '/assets/teacher_talking.png',
      caption: 'You will be asked questions to test your understanding'
    },
    {
      image: '/assets/teacher_explanation.png',
      caption: 'Learn step-by-step by being prompted to explain your problem solving process'
    },
    {
      image: '/assets/teacher_pleased.png',
      caption: 'Master concepts with additional questions after solving a problem'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Open signup modal on the last step
      if (onSignup) {
        onSignup();
      } else {
        navigate('/login?mode=signup');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate('/login?mode=signup');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Welcome to educat!</h2>
          <button className={styles['close-button']} onClick={onClose}>×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['image-container']}>
            <img 
              src={steps[currentStep].image} 
              alt={`Step ${currentStep + 1}`}
              className={styles['step-image']}
            />
          </div>
          
          <div className={styles['caption-container']}>
            <p className={styles['step-caption']}>{steps[currentStep].caption}</p>
          </div>
          
          <div className={styles['progress-indicators']}>
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`${styles['progress-dot']} ${index === currentStep ? styles['active'] : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
        </div>
        
        <div className={styles['modal-footer']}>
          <div className={styles['button-group']}>
            {(
              <button className={`${styles['nav-button']} ${styles['previous']}`} onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className={`${styles['nav-button']} ${styles['skip']}`} onClick={handleSkip}>
              Skip
            </button>
            <button className={`${styles['nav-button']} ${styles['next']}`} onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
