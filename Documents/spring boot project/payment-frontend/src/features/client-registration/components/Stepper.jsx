
import useI18n from '../../../hooks/useI18n';

export default function Stepper({ steps, currentStep, onStepClick }) {
  const { translate } = useI18n();
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          onClick={() => index < currentStep && onStepClick(index)}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-title">{translate(step.title)}</div>
        </div>
      ))}
    </div>
  );
}
