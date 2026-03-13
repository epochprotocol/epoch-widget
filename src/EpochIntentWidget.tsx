import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useWalletClient, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { parseUnits, keccak256, toBytes } from 'viem';
import { TaskType } from '@epoch-protocol/epoch-commons-sdk';
import { EpochIntentSDK } from '@epoch-protocol/epoch-intents-sdk';
import { getEpochChains, getEpochTokensByChainEnv } from './epoch-config';
import { useTokenBalance } from './use-token-balance';
import { defaultStyles } from './styles';
import type { EpochIntentWidgetProps } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  if (remainder === 0n) return whole.toString();
  const fracStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
  const trimmed = fracStr.slice(0, Math.min(6, fracStr.length));
  return `${whole}.${trimmed}`;
}

function getStyleProps<K extends keyof typeof defaultStyles>(
  key: K,
  themeClass: string | undefined,
): { style?: React.CSSProperties; className?: string } {
  if (themeClass) return { className: themeClass };
  return { style: defaultStyles[key] as React.CSSProperties };
}

// ---------------------------------------------------------------------------
// Spinner keyframes injection (once)
// ---------------------------------------------------------------------------

let spinnerInjected = false;

function injectSpinnerStyle() {
  if (spinnerInjected) return;
  const style = document.createElement('style');
  style.textContent = `@keyframes epoch-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
  spinnerInjected = true;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const PROGRESS_STEPS = [
  'Sending intent to Epoch',
  'Executing intent',
  'Intent submitted',
  'Checking execution status',
];

interface ProgressStepperProps {
  progressStep: number; // 1-4 active step, 0=idle
  statusProgress: number; // 0-100 for step 4 progress bar
  isLoadingStatus: boolean;
  themeClass?: string;
}

function ProgressStepper({ progressStep, statusProgress, themeClass }: ProgressStepperProps) {
  return (
    <div {...getStyleProps('progressContainer', themeClass)}>
      <p style={defaultStyles.progressTitle as React.CSSProperties}>Transaction Progress</p>
      {PROGRESS_STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = progressStep > stepNum;
        const isActive = progressStep === stepNum;
        const isPending = progressStep < stepNum;
        const isLast = stepNum === PROGRESS_STEPS.length;

        let iconContent: React.ReactNode;
        if (isComplete) {
          iconContent = (
            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1 }}>
              ✓
            </span>
          );
        } else if (isActive) {
          iconContent = (
            <span
              style={{
                display: 'inline-block',
                width: '0.875rem',
                height: '0.875rem',
                border: '2px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'epoch-spin 0.8s linear infinite',
              }}
            />
          );
        } else {
          iconContent = (
            <span style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: 1 }}>○</span>
          );
        }

        const textStyle: React.CSSProperties = {
          fontSize: '0.8125rem',
          lineHeight: 1.4,
          color: isActive ? '#111827' : isComplete ? '#374151' : '#9ca3af',
          fontWeight: isActive ? 600 : 400,
        };

        return (
          <div key={stepNum}>
            <div style={defaultStyles.progressStep as React.CSSProperties}>
              <div
                style={{
                  width: '1.25rem',
                  minWidth: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '0.0625rem',
                }}
              >
                {iconContent}
              </div>
              <div style={{ flex: 1 }}>
                <span style={textStyle}>{label}</span>
                {stepNum === 4 && isActive && (
                  <div style={defaultStyles.progressBar as React.CSSProperties}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        borderRadius: '9999px',
                        width: `${statusProgress}%`,
                        transition: 'width 0.15s ease',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                style={
                  isComplete
                    ? (defaultStyles.progressConnectorActive as React.CSSProperties)
                    : (defaultStyles.progressConnector as React.CSSProperties)
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EpochIntentWidget(props: EpochIntentWidgetProps) {
  const {
    isOpen,
    onClose,
    requiredToken,
    requiredAmount,
    apiBaseUrl,
    customRpcUrls,
    testnetRpcUrls,
    intentConfig,
    onIntentSent,
    onIntentComplete,
    onError,
    title = 'Complete Action',
    description,
    submitButtonText = 'Submit Intent',
    destinationChainName,
    testnet = false,
    enableTestnet = false,
    defaultTestnet = false,
    theme,
  } = props;

  // ---- State ----
  // testnet=true forces testnet mode and hides the toggle
  const [useTestnet, setUseTestnet] = useState<boolean>(testnet || defaultTestnet);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [nonce, setNonce] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [statusProgress, setStatusProgress] = useState(0);
  const [isExecutionConfirmed, setIsExecutionConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const isCheckingStatusRef = useRef(false);

  // ---- Wagmi hooks ----
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // ---- Inject spinner animation once ----
  useEffect(() => {
    injectSpinnerStyle();
  }, []);

  // ---- Derived data ----
  const availableChains = useMemo(() => getEpochChains(useTestnet), [useTestnet]);

  const availableTokens = useMemo(
    () => (selectedChainId ? getEpochTokensByChainEnv(selectedChainId, useTestnet) : []),
    [selectedChainId, useTestnet],
  );

  const selectedToken = useMemo(
    () => availableTokens.find((t) => t.address === selectedTokenAddress) ?? null,
    [availableTokens, selectedTokenAddress],
  );

  // Use testnet RPC overrides when in testnet mode, mainnet overrides otherwise
  const activeRpcUrls = useTestnet ? testnetRpcUrls : customRpcUrls;

  const { balance, isLoading: isBalanceLoading } = useTokenBalance(
    selectedChainId,
    selectedTokenAddress,
    address,
    activeRpcUrls,
  );

  const isWrongNetwork = selectedChainId !== null && chainId !== selectedChainId;

  const canSubmit =
    !!walletClient &&
    !!address &&
    !!selectedChainId &&
    !!selectedTokenAddress &&
    !!selectedToken &&
    !isWrongNetwork &&
    !isSubmitting &&
    !isPolling;

  // Auto-select first token when tokens change
  useEffect(() => {
    if (availableTokens.length > 0) {
      setSelectedTokenAddress(availableTokens[0].address);
    } else {
      setSelectedTokenAddress('');
    }
  }, [availableTokens]);

  // Keep forced testnet mode in sync if prop changes
  useEffect(() => {
    if (testnet) setUseTestnet(true);
  }, [testnet]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setUseTestnet(defaultTestnet);
      setSelectedChainId(null);
      setSelectedTokenAddress('');
      setIsSubmitting(false);
      setProgressStep(0);
      setNonce(null);
      setIsPolling(false);
      setIsLoadingStatus(false);
      setStatusProgress(0);
      setIsExecutionConfirmed(false);
      setError(null);
    }
  }, [isOpen, defaultTestnet]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (progIntervalRef.current) clearInterval(progIntervalRef.current);
    };
  }, []);

  // ---- Handlers ----

  const checkIntentStatus = async (nonceStr: string, sdk: EpochIntentSDK) => {
    if (!address || isCheckingStatusRef.current) return;
    isCheckingStatusRef.current = true;
    setIsLoadingStatus(true);
    setStatusProgress(0);

    let p = 0;
    if (progIntervalRef.current) clearInterval(progIntervalRef.current);
    progIntervalRef.current = setInterval(() => {
      p = Math.min(p + 3, 90);
      setStatusProgress(p);
    }, 150);

    try {
      const statusList = await sdk.getIntentStatus(address, nonceStr);
      if (progIntervalRef.current) {
        clearInterval(progIntervalRef.current);
        progIntervalRef.current = null;
      }
      if (!mountedRef.current) return;
      setStatusProgress(100);

      const isComplete = Array.isArray(statusList)
        ? statusList.some(
            (s) =>
              s.status === 'completed' || s.status === 'finalized' || s.status === 'success',
          )
        : false;

      if (isComplete) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setIsPolling(false);
        setIsExecutionConfirmed(true);
        onIntentComplete?.({ nonce: nonceStr, status: statusList });
        setTimeout(() => { if (mountedRef.current) onClose(); }, 2000);
      } else {
        setTimeout(() => { if (mountedRef.current) setStatusProgress(0); }, 1500);
      }
    } catch {
      if (progIntervalRef.current) {
        clearInterval(progIntervalRef.current);
        progIntervalRef.current = null;
      }
      if (mountedRef.current) setStatusProgress(0);
    } finally {
      isCheckingStatusRef.current = false;
      if (mountedRef.current) setIsLoadingStatus(false);
    }
  };

  const handleSubmit = async () => {
    if (!walletClient || !address || !selectedChainId || !selectedTokenAddress || !selectedToken)
      return;
    if (chainId !== selectedChainId) return;

    setError(null);
    setIsSubmitting(true);
    setProgressStep(1);

    try {
      const destChainId = useTestnet
        ? (intentConfig.destinationTestnetChainId ?? 84532)
        : (intentConfig.destinationChainId ?? 8453);

      const outputAmountStr = formatAmount(requiredAmount, requiredToken.decimals);
      const inputAmountStr = intentConfig.fixedOutput ? '0' : outputAmountStr;

      const protocolHash =
        intentConfig.protocolHashIdentifier ?? keccak256(toBytes(intentConfig.protocol));

      let extraDataTypestring = 'bytes32 protocol,bytes32 action';
      if (intentConfig.extraDataTypestring) {
        extraDataTypestring += ',' + intentConfig.extraDataTypestring;
      }
      if (intentConfig.fixedOutput) {
        extraDataTypestring +=
          ',bool fixedOutcome,address fixedOutcomeToken,uint256 fixedOutcomeAmount';
      }

      const extraData: Record<string, unknown> = {
        protocol: keccak256(toBytes(intentConfig.protocol)),
        action: keccak256(toBytes(intentConfig.action)),
        ...(intentConfig.extraData ?? {}),
      };
      if (intentConfig.fixedOutput) {
        extraData.fixedOutcome = true;                        // boolean, not string
        extraData.fixedOutcomeToken = requiredToken.address;
        extraData.fixedOutcomeAmount = requiredAmount.toString();
      }

      const sdk = new EpochIntentSDK({ apiBaseUrl, walletClient: walletClient as any });

      const { taskTypeString, intentData } = await sdk.getTaskData({
        taskType: TaskType.ProtocolInteraction,
        intentData: {
          isNative: false,
          depositTokenAddress: selectedTokenAddress,
          tokenInAmount: parseUnits(inputAmountStr, selectedToken.decimals).toString(),
          outputTokenAddress: requiredToken.address,
          minTokenOut: parseUnits(outputAmountStr, requiredToken.decimals).toString(),
          destinationChainId: destChainId.toString(),
          protocolHashIdentifier: protocolHash,
          recipient: address as `0x${string}`,
        },
        extraDataTypestring,
        extraData,
      });

      setProgressStep(2);

      const data = await sdk.solveIntent({
        isNative: false,
        sponsorAddress: address as `0x${string}`,
        taskTypeString,
        intentData,
      });

      setProgressStep(3);

      const responseNonce: string | null =
        (data as any)?.allocationResponse?.nonce ??
        (data as any)?.submittedIntentData?.nonce ??
        (data as any)?.intentNonce ??
        null;

      if (responseNonce) {
        const nonceStr = responseNonce.toString();
        setNonce(nonceStr);
        onIntentSent?.({ nonce: nonceStr });
        setIsPolling(true);
        setProgressStep(4);

        checkIntentStatus(nonceStr, sdk);
        pollingRef.current = setInterval(() => checkIntentStatus(nonceStr, sdk), 3000);
      } else {
        onIntentComplete?.({ nonce: '', status: data });
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message ?? 'Unknown error');
      setError(error.message);
      onError?.(error);
      setProgressStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Auto-description ----
  const autoDescription =
    description ??
    `Supply ${formatAmount(requiredAmount, requiredToken.decimals)} ${requiredToken.symbol}${
      destinationChainName ? ` on ${destinationChainName}` : ''
    } from any supported chain.`;

  // ---- Toggle styles ----
  const toggleTrackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '2.25rem',
    height: '1.25rem',
    backgroundColor: useTestnet ? '#3b82f6' : '#d1d5db',
    borderRadius: '9999px',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const toggleThumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.125rem',
    left: useTestnet ? 'calc(100% - 1.125rem)' : '0.125rem',
    width: '1rem',
    height: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'left 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  };

  const buttonDisabledStyle: React.CSSProperties = canSubmit
    ? {}
    : (defaultStyles.buttonDisabled as React.CSSProperties);

  // ---- Render ----

  if (!isOpen) return null;

  const modal = (
    <div
      {...getStyleProps('overlay', theme?.overlay)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        {...getStyleProps('container', theme?.container)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div {...getStyleProps('header', theme?.header)}>
          <h2 {...getStyleProps('title', theme?.title)}>{title}</h2>
          <p {...getStyleProps('description', theme?.description)}>{autoDescription}</p>
        </div>

        {/* Scroll area */}
        <div {...getStyleProps('scrollArea', theme?.scrollArea)}>
          {/* Required amount alert */}
          <div {...getStyleProps('alert', theme?.alert)}>
            <strong>Required:</strong>{' '}
            {formatAmount(requiredAmount, requiredToken.decimals)} {requiredToken.symbol}
            {destinationChainName ? ` on ${destinationChainName}` : ''}
          </div>

          {/* Testnet toggle — hidden when testnet mode is forced via prop */}
          {enableTestnet && !testnet && (
            <div style={defaultStyles.switchRow as React.CSSProperties}>
              <label style={defaultStyles.switchContainer as React.CSSProperties}>
                <span>Mainnet</span>
                <input
                  type="checkbox"
                  checked={useTestnet}
                  onChange={(e) => {
                    setUseTestnet(e.target.checked);
                    setSelectedChainId(null);
                    setSelectedTokenAddress('');
                  }}
                  style={{ display: 'none' }}
                />
                <div style={toggleTrackStyle}>
                  <div style={toggleThumbStyle} />
                </div>
                <span>Testnet</span>
              </label>
            </div>
          )}

          {/* Source chain select */}
          <div>
            <label style={defaultStyles.label as React.CSSProperties}>Source Chain</label>
            <select
              {...getStyleProps('select', theme?.select)}
              value={selectedChainId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedChainId(val ? Number(val) : null);
                setSelectedTokenAddress('');
              }}
            >
              <option value="">Select a chain…</option>
              {availableChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source token select */}
          {selectedChainId !== null && (
            <div>
              <label style={defaultStyles.label as React.CSSProperties}>Source Token</label>
              <select
                {...getStyleProps('select', theme?.select)}
                value={selectedTokenAddress}
                onChange={(e) => setSelectedTokenAddress(e.target.value)}
              >
                {availableTokens.length === 0 ? (
                  <option value="">No tokens available</option>
                ) : (
                  availableTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} — {token.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Balance box */}
          {selectedChainId !== null && selectedTokenAddress && selectedToken && (
            <div {...getStyleProps('balanceBox', theme?.balanceBox)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#6b7280' }}>Your balance</span>
                <span style={{ fontWeight: 500 }}>
                  {isBalanceLoading
                    ? 'Loading…'
                    : balance !== null
                    ? `${formatAmount(balance, selectedToken.decimals)} ${selectedToken.symbol}`
                    : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Wrong network alert */}
          {isWrongNetwork && selectedChainId !== null && (
            <div {...getStyleProps('alertDestructive', theme?.alertDestructive)}>
              <span>
                Please switch to{' '}
                <strong>
                  {availableChains.find((c) => c.id === selectedChainId)?.name ??
                    `Chain ${selectedChainId}`}
                </strong>{' '}
                to continue.
              </span>
              <button
                style={defaultStyles.networkSwitchButton as React.CSSProperties}
                onClick={() => switchChain?.({ chainId: selectedChainId })}
              >
                Switch Network
              </button>
            </div>
          )}

          {/* Arrow separator */}
          <div style={defaultStyles.arrowSeparator as React.CSSProperties}>↓</div>

          {/* Destination display */}
          <div>
            <label style={defaultStyles.label as React.CSSProperties}>Destination</label>
            <input
              style={defaultStyles.input as React.CSSProperties}
              disabled
              readOnly
              value={`${requiredToken.symbol}${destinationChainName ? ` (${destinationChainName})` : ''}`}
            />
          </div>

          {/* Required amount display */}
          <div {...getStyleProps('balanceBox', theme?.balanceBox)}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#6b7280' }}>Amount required</span>
              <span style={{ fontWeight: 500 }}>
                {formatAmount(requiredAmount, requiredToken.decimals)} {requiredToken.symbol}
              </span>
            </div>
          </div>

          {/* Progress stepper */}
          {(progressStep > 0 || nonce !== null || isPolling) && (
            <ProgressStepper
              progressStep={progressStep}
              statusProgress={statusProgress}
              isLoadingStatus={isLoadingStatus}
              themeClass={theme?.progress}
            />
          )}

          {/* Execution confirmed */}
          {isExecutionConfirmed && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                fontSize: '0.8125rem',
                color: '#15803d',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              Intent executed successfully! Closing…
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                fontSize: '0.8125rem',
                color: '#991b1b',
                lineHeight: 1.5,
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={defaultStyles.footer as React.CSSProperties}>
          <button
            {...getStyleProps('button', theme?.button)}
            style={
              theme?.button
                ? undefined
                : {
                    ...(defaultStyles.button as React.CSSProperties),
                    ...buttonDisabledStyle,
                  }
            }
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting || isPolling ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'epoch-spin 0.8s linear infinite',
                    flexShrink: 0,
                  }}
                />
                {progressStep === 1
                  ? 'Sending intent…'
                  : progressStep === 2
                  ? 'Executing…'
                  : progressStep === 3
                  ? 'Intent submitted…'
                  : 'Checking status…'}
              </>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
