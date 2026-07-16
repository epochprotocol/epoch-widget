import type { EpochClassNames } from '../types';
import { Banner } from './Banner';
import { CheckIcon } from './Icons';
import { ProgressStepper } from './ProgressStepper';

interface IntentProgressProps {
  status: string;
  /**
   * Statuses this flow shows the tracker for. Flows disagree — Pay/Swap tracks
   * `polling`, Earn tracks `sent` — so each states its own rule.
   */
  showFor: readonly string[];
  activeStep: number;
  statusProgress: number;
  /** Flow-specific wording once the intent lands. */
  successMessage: string;
  classNames?: EpochClassNames;
}

/**
 * Step tracker plus the success banner, for any flow that submits an intent.
 *
 * `complete` pins the stepper to step 5 — the flow stops reporting an active
 * step once it's done, and the tracker would otherwise snap backwards.
 */
export function IntentProgress({
  status,
  showFor,
  activeStep,
  statusProgress,
  successMessage,
  classNames: cs,
}: IntentProgressProps) {
  if (!showFor.includes(status)) return null;
  const complete = status === 'complete';
  return (
    <>
      <ProgressStepper
        activeStep={complete ? 5 : activeStep}
        statusProgress={statusProgress}
        className={cs?.progress}
      />
      {complete && (
        <div className="animate-overlay-in">
          <Banner variant="success" className={cs?.banner}>
            <div className="flex items-center gap-2">
              <CheckIcon />
              <span>{successMessage}</span>
            </div>
          </Banner>
        </div>
      )}
    </>
  );
}
