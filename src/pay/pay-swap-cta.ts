import type { EpochChain, EpochToken, EpochIntentWidgetProps } from '../types';

export type PaySwapCtaAction =
  | 'switch'
  | 'submit'
  | 'disabled'
  | 'connectMiden';
export type PaySwapCtaTone = 'primary' | 'warning' | 'success';

export interface PaySwapCtaState {
  action: PaySwapCtaAction;
  label: string;
  tone?: PaySwapCtaTone;
}

/** Every label the CTA can show, with integrator overrides already applied. */
export interface PaySwapCtaLabels {
  submit: string;
  switchNetwork: (chainName: string) => string;
  quoting: string;
  preparing: string;
  signing: string;
  submitting: string;
  polling: string;
  complete: string;
  insufficientBalance: (tokenSymbol: string) => string;
  configureRequired: string;
}

type CtaLabelOverrides = EpochIntentWidgetProps['ctaLabels'];

/**
 * Fill integrator overrides in over the defaults.
 *
 * `submit` and `configureRequired` have no fixed default — they read differently
 * per flow ("Pay" vs "Swap") — so the caller supplies them.
 */
export function resolvePaySwapCtaLabels(
  overrides: CtaLabelOverrides,
  fallbacks: { submit: string; configureRequired: string },
): PaySwapCtaLabels {
  return {
    submit: overrides?.submit ?? fallbacks.submit,
    switchNetwork:
      overrides?.switchNetwork ?? ((chain: string) => `Switch to ${chain}`),
    quoting: overrides?.quoting ?? 'Fetching quote…',
    preparing: overrides?.preparing ?? 'Preparing…',
    signing: overrides?.signing ?? 'Signing…',
    submitting: overrides?.submitting ?? 'Submitting…',
    polling: overrides?.polling ?? 'Waiting for execution…',
    complete: overrides?.complete ?? 'Completed ✓',
    insufficientBalance:
      overrides?.insufficientBalance ??
      ((sym: string) => `Insufficient ${sym} balance`),
    configureRequired: overrides?.configureRequired ?? fallbacks.configureRequired,
  };
}

export interface ResolvePaySwapCtaParams {
  labels: PaySwapCtaLabels;
  /** The integrator's intent resolved — without it there is nothing to submit. */
  hasIntent: boolean;
  /** Why the flat-prop intent failed to build, if it did. */
  buildError: string | null;
  /** Fixed-output flows must wait on a quote to know what the user pays. */
  fixedOutput: boolean;
  flow: {
    isQuoting: boolean;
    status: string;
    activeStep: number;
  };
  isWrongNetwork: boolean;
  selectedChain: EpochChain | null | undefined;
  insufficientBalance: boolean;
  selectedToken: EpochToken | null;
  /** Source is the Miden virtual chain (Miden→EVM). */
  isMidenSource: boolean;
  /** Destination is the Miden virtual chain (EVM→Miden). */
  isMidenDest: boolean;
  /** The Miden wallet adapter reports a connected account. */
  midenConnected: boolean;
}

/** Which submit step each `activeStep` corresponds to, for the busy label. */
const SUBMIT_STEP_LABEL: Record<number, keyof PaySwapCtaLabels> = {
  1: 'preparing',
  2: 'signing',
  3: 'submitting',
};

/**
 * Decides what the Pay/Swap button says and does.
 *
 * Order is the point: in-flight states win over "you haven't configured this",
 * which wins over the wrong-network nudge, which wins over balance. Reversing
 * any pair would surface a complaint the user can't act on yet. Pure and free of
 * React so the whole table can be reasoned about — and tested — on its own.
 */
export function resolvePaySwapCta({
  labels,
  hasIntent,
  buildError,
  fixedOutput,
  flow,
  isWrongNetwork,
  selectedChain,
  insufficientBalance,
  selectedToken,
  isMidenSource,
  isMidenDest,
  midenConnected,
}: ResolvePaySwapCtaParams): PaySwapCtaState {
  // Nothing to submit. A build error is the more specific reason, so prefer it.
  if (!hasIntent) {
    return { action: 'disabled', label: buildError ?? labels.configureRequired };
  }

  if (fixedOutput && flow.isQuoting) {
    return { action: 'disabled', label: labels.quoting };
  }

  if (flow.status === 'submitting') {
    const key = SUBMIT_STEP_LABEL[flow.activeStep];
    if (key) return { action: 'disabled', label: labels[key] as string };
  }
  if (flow.status === 'polling') {
    return { action: 'disabled', label: labels.polling };
  }
  if (flow.status === 'complete') {
    return { action: 'disabled', label: labels.complete, tone: 'success' };
  }

  // Miden is a virtual chain: it can't be both ends of a swap, and either end
  // needs its wallet connected before the flow can proceed. Both checks precede
  // the EVM wrong-network nudge (which the engine already skips for a Miden
  // source), so a user is never told to switch to a chain that doesn't exist.
  if (isMidenSource && isMidenDest) {
    return { action: 'disabled', label: 'Select a different destination' };
  }
  if ((isMidenSource || isMidenDest) && !midenConnected) {
    return { action: 'connectMiden', label: 'Connect Miden wallet' };
  }

  // `!isMidenSource` is belt-and-suspenders: the engine already forces
  // `isWrongNetwork` false for a Miden source, but guarding here means a "Switch
  // to Miden" (an impossible EVM chain switch) can never surface even if it leaks.
  if (isWrongNetwork && selectedChain && !isMidenSource) {
    return {
      action: 'switch',
      label: labels.switchNetwork(selectedChain.name),
      tone: 'warning',
    };
  }
  if (insufficientBalance && selectedToken) {
    return {
      action: 'disabled',
      label: labels.insufficientBalance(selectedToken.symbol),
    };
  }

  return { action: 'submit', label: labels.submit };
}

export function isPaySwapCtaEnabled(action: PaySwapCtaAction): boolean {
  return (
    action === 'submit' || action === 'switch' || action === 'connectMiden'
  );
}
