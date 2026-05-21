import { cn } from '../lib/cn';
import { CheckIcon } from './Icons';

export const PROGRESS_STEPS = [
  'Sending intent to Epoch',
  'Executing intent',
  'Intent submitted',
  'Checking execution status',
] as const;

interface ProgressStepperProps {
  /** 1..4 for the currently active step, 0 when idle. */
  activeStep: number;
  /** 0..100 for the status-check progress bar under step 4. */
  statusProgress: number;
  className?: string;
}

export function ProgressStepper({ activeStep, statusProgress, className }: ProgressStepperProps) {
  return (
    <div
      className={cn(
        'rounded-sm border border-line bg-surface p-4',
        className,
      )}
    >
      <p className="m-0 mb-3 text-[13px] font-semibold text-fg">Transaction progress</p>
      {PROGRESS_STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = activeStep > stepNum;
        const isActive = activeStep === stepNum;
        const isLast = stepNum === PROGRESS_STEPS.length;

        let iconContent;
        if (isComplete) {
          iconContent = <CheckIcon style={{ color: 'var(--epoch-color-success)' }} />;
        } else if (isActive) {
          iconContent = (
            <span className="inline-block h-3.5 w-3.5 animate-spin-epoch rounded-full border-2 border-primary border-t-transparent" />
          );
        } else {
          iconContent = (
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-line" />
          );
        }

        const textClasses = cn(
          'text-[13px] leading-snug',
          isActive
            ? 'font-semibold text-fg'
            : isComplete
              ? 'text-fg-secondary'
              : 'text-fg-muted',
        );

        return (
          <div key={stepNum}>
            <div className="flex items-start gap-2.5">
              <div className="mt-px flex w-5 min-w-[20px] items-center justify-center">
                {iconContent}
              </div>
              <div className="flex-1">
                <span className={textClasses}>{label}</span>
                {stepNum === 4 && isActive && (
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
                      style={{ width: `${statusProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'ml-2.5 h-3 w-0.5',
                  isComplete ? 'bg-success' : 'bg-line',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
