import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingModal.css';

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
      caption: 'Meet your AI tutor - ready to help you learn!'
    },
    {
      image: '/assets/teacher_talking.png',
      caption: 'Ask any question and get instant explanations'
    },
    {
      image: '/assets/teacher_explanation.png',
      caption: 'Learn step-by-step with detailed breakdowns'
    },
    {
      image: '/assets/teacher_pleased.png',
      caption: 'Master concepts with personalized guidance'
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Welcome to educat!</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="image-container">
            <img 
              src={steps[currentStep].image} 
              alt={`Step ${currentStep + 1}`}
              className="step-image"
            />
          </div>
          
          <div className="caption-container">
            <p className="step-caption">{steps[currentStep].caption}</p>
          </div>
          
          <div className="progress-indicators">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="button-group">
            {(
              <button className="nav-button previous" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="nav-button skip" onClick={handleSkip}>
              Skip
            </button>
            <button className="nav-button next" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
