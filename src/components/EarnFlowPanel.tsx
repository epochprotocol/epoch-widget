import { cn } from '../lib/cn';
import type { EpochEarnMarket } from '../types';
import { formatAmount, formatBalancePortionForInput, truncateAddress } from '../utils';
import { Avatar } from './Avatar';
import { MarketSelectButton } from './MarketSelectButton';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { TokenChainPill } from './TokenChainPill';

const SECTION_LABEL = 'text-xs font-semibold tracking-[0.02em] text-fg-muted';
const PAY_CARD =
  'relative rounded-md border border-line bg-canvas px-4.5 pb-3.5 pt-4 shadow-sm';
const AMOUNT_INPUT =
  'flex-1 min-w-0 bg-transparent border-0 outline-0 p-0 text-[32px] font-bold leading-tight -tracking-[0.03em] tabular-nums text-fg placeholder:text-fg-muted';
const PCT_BTN =
  'cursor-pointer rounded-full border border-line bg-surface px-3 py-1.25 text-[11px] font-semibold text-fg-secondary transition-[background-color,border-color,color] duration-100 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  selected: EpochEarnMarket | null;
  onPickMarket: () => void;
  amount: string;
  onAmountChange: (v: string) => void;
  buildError: string | null;
  /** Source token + chain (same picker as pay flow). */
  sourceTokenSymbol: string;
  sourceChainName: string;
  sourceTokenLogoURI?: string;
  sourceChainLogoURI?: string;
  onSelectSourceToken: () => void;
  walletConnected: boolean;
  walletAddress?: string;
  walletIcon?: string;
  /** Raw balance for Max / % shortcuts; null if unknown. */
  walletBalance: bigint | null;
  sourceTokenDecimals: number;
  balanceLoading?: boolean;
  /** When true, show EVM / Miden funding toggle (testnet + adapter provided). */
  midenEnabled?: boolean;
  fundingSource?: 'evm' | 'miden';
  onFundingSourceChange?: (source: 'evm' | 'miden') => void;
  midenConnected?: boolean;
  onConnectMiden?: () => void;
}

export function EarnFlowPanel({
  selected,
  onPickMarket,
  amount,
  onAmountChange,
  buildError,
  sourceTokenSymbol,
  sourceChainName,
  sourceTokenLogoURI,
  sourceChainLogoURI,
  onSelectSourceToken,
  walletConnected,
  walletAddress,
  walletIcon,
  walletBalance,
  sourceTokenDecimals,
  balanceLoading,
  midenEnabled = false,
  fundingSource = 'evm',
  onFundingSourceChange,
  midenConnected = false,
  onConnectMiden,
}: Props) {
  const balanceHuman =
    walletBalance !== null && walletConnected
      ? formatAmount(walletBalance, sourceTokenDecimals, 8)
      : null;

  const applyPortion = (num: number, den: number) => {
    if (walletBalance === null || walletBalance === 0n) return;
    onAmountChange(formatBalancePortionForInput(walletBalance, num, den, sourceTokenDecimals));
  };
  const applyMax = () => {
    if (walletBalance === null) return;
    onAmountChange(formatBalancePortionForInput(walletBalance, 1, 1, sourceTokenDecimals));
  };

  return (
    <div className="flex flex-col">
      {midenEnabled && onFundingSourceChange && (
        <div className="mb-3">
          <SegmentedTabs<'evm' | 'miden'>
            tabs={[
              { value: 'evm', label: 'EVM wallet' },
              { value: 'miden', label: 'Miden' },
            ]}
            value={fundingSource}
            onChange={onFundingSourceChange}
            size="sm"
          />
        </div>
      )}
      <div className={PAY_CARD}>
        <div className="mb-3 flex items-center justify-between gap-2.5">
          <span className={SECTION_LABEL}>You pay with</span>
          {fundingSource === 'miden' ? (
            midenConnected ? (
              <span className="text-xs font-semibold text-fg-secondary">Miden connected</span>
            ) : (
              <button
                type="button"
                className="cursor-pointer rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-primary"
                onClick={() => onConnectMiden?.()}
              >
                Connect Miden
              </button>
            )
          ) : walletConnected && walletAddress ? (
            <div
              className="flex items-center gap-1.5 rounded-full border border-[rgba(124,58,237,0.22)] py-1 pl-1.25 pr-2.5 text-xs font-semibold text-[#5b21b6]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.10) 100%)',
              }}
              title={walletAddress}
            >
              {walletIcon ? <Avatar src={walletIcon} label="Wallet" size={16} /> : null}
              <span className="tabular-nums">{truncateAddress(walletAddress, 4)}</span>
              <span className="ml-0.5 opacity-65">›</span>
            </div>
          ) : fundingSource === 'evm' ? (
            <span className={cn(SECTION_LABEL, 'font-medium')}>Connect wallet</span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className={AMOUNT_INPUT}
            aria-label="Deposit amount"
          />
          <TokenChainPill
            tokenSymbol={sourceTokenSymbol}
            tokenLogoURI={sourceTokenLogoURI}
            chainName={sourceChainName}
            chainLogoURI={sourceChainLogoURI}
            onClick={onSelectSourceToken}
            ariaLabel="Change source token"
          />
        </div>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs tabular-nums text-fg-muted">≈ $—</span>
          <div className="flex flex-wrap items-center gap-2">
            {balanceLoading ? (
              <span className="text-xs text-fg-muted">Balance: …</span>
            ) : balanceHuman != null ? (
              <span className="text-xs font-semibold tabular-nums text-fg-secondary">
                Balance: {balanceHuman}
              </span>
            ) : (
              <span className="text-xs text-fg-muted">Balance: —</span>
            )}
            <div className="flex gap-1.5">
              <button type="button" className={PCT_BTN} onClick={() => applyPortion(20, 100)} disabled={!walletBalance}>20%</button>
              <button type="button" className={PCT_BTN} onClick={() => applyPortion(50, 100)} disabled={!walletBalance}>50%</button>
              <button type="button" className={PCT_BTN} onClick={applyMax} disabled={!walletBalance}>Max</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <MarketSelectButton selected={selected} onClick={onPickMarket} />
      </div>

      {buildError && (
        <p className="mt-3 mb-0 text-[13px] text-error">{buildError}</p>
      )}
    </div>
  );
}
