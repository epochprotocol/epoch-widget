import type { CSSProperties } from 'react';
import { s } from '../styles';
import { t } from '../theme';
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
    <div className={className} style={className ? undefined : s.progressContainer}>
      <p style={s.progressTitle}>Transaction progress</p>
      {PROGRESS_STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = activeStep > stepNum;
        const isActive = activeStep === stepNum;
        const isLast = stepNum === PROGRESS_STEPS.length;

        const iconStyle: CSSProperties = {
          width: '20px',
          minWidth: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1px',
        };

        let iconContent;
        if (isComplete) {
          iconContent = <CheckIcon style={{ color: t.success }} />;
        } else if (isActive) {
          iconContent = (
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: `2px solid ${t.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'epoch-spin 0.8s linear infinite',
              }}
            />
          );
        } else {
          iconContent = (
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: `2px solid ${t.border}`,
                display: 'inline-block',
              }}
            />
          );
        }

        const textStyle: CSSProperties = {
          fontSize: '13px',
          lineHeight: 1.4,
          color: isActive ? t.text : isComplete ? t.textSecondary : t.textMuted,
          fontWeight: isActive ? 600 : 400,
        };

        return (
          <div key={stepNum}>
            <div style={s.progressStep}>
              <div style={iconStyle}>{iconContent}</div>
              <div style={{ flex: 1 }}>
                <span style={textStyle}>{label}</span>
                {stepNum === 4 && isActive && (
                  <div style={s.progressBar}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: t.primary,
                        borderRadius: '999px',
                        width: `${statusProgress}%`,
                        transition: 'width 0.15s ease',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div style={isComplete ? s.progressConnectorActive : s.progressConnector} />
            )}
          </div>
        );
      })}
    </div>
  );
}
