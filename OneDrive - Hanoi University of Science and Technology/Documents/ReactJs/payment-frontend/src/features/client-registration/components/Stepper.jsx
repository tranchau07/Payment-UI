
export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          onClick={() => index < currentStep && onStepClick(index)}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-title">{step.title}</div>
        </div>
      ))}
    </div>
  );
}
