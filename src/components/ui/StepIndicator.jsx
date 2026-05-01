import { CheckCircleIcon } from '@heroicons/react/20/solid';

export default function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator">
      <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
        <div className="step-number">{currentStep > 1 ? <CheckCircleIcon className="w-4 h-4" /> : 1}</div>
        <span>Cuenta</span>
      </div>
      <div className="step-divider"></div>
      <div className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
        <div className="step-number">{currentStep > 2 ? <CheckCircleIcon className="w-4 h-4" /> : 2}</div>
        <span>Datos</span>
      </div>
      <div className="step-divider"></div>
      <div className={`step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
        <div className="step-number">{currentStep > 3 ? <CheckCircleIcon className="w-4 h-4" /> : 3}</div>
        <span>Ubicación</span>
      </div>
    </div>
  );
}
