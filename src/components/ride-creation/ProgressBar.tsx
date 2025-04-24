interface ProgressBarProps {
  currentStep: 'details' | 'pricing' | 'verification'
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const getProgressWidth = () => {
    switch (currentStep) {
      case 'details':
        return '33%';
      case 'pricing':
        return '66%';
      case 'verification':
        return '100%';
      default:
        return '33%';
    }
  };

  return (
    <div className="h-1 w-full bg-gray-200 mb-8 relative">
      <div 
        className="h-1 bg-primary absolute top-0 left-0 transition-all duration-300" 
        style={{ width: getProgressWidth() }}
      />
    </div>
  )
}