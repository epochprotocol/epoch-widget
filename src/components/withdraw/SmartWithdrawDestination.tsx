import { useMemo, type ReactNode } from 'react';
import { SECTION_LABEL } from '../../lib/styles';
import { getEpochChains, getEpochTokensByChainEnv } from '../../epoch-config';
import { MIDEN_VIRTUAL_CHAIN_ID } from '../../earn/miden';
import { Avatar } from '../Avatar';
import { Dropdown, type DropdownOption } from '../Dropdown';

interface SmartWithdrawDestinationProps {
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
  onPickDestChain: (chainId: number) => void;
  onPickDestToken: (address: string) => void;
  isTestnet: boolean;
  midenDestEnabled: boolean;
  midenRecipientAccount?: string | null;
  midenFaucets?: { faucetId: string; symbol: string; logoURI?: string }[];
}

function LabeledPicker({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className={SECTION_LABEL}>{label}</span>
      {children}
    </div>
  );
}

export function SmartWithdrawDestination({
  smartDestChainId,
  smartDestTokenAddress,
  onPickDestChain,
  onPickDestToken,
  isTestnet,
  midenDestEnabled,
  midenRecipientAccount,
  midenFaucets,
}: SmartWithdrawDestinationProps) {
  const isMidenDest = smartDestChainId === MIDEN_VIRTUAL_CHAIN_ID;

  const chainOptions: DropdownOption[] = useMemo(() => {
    const opts = getEpochChains(isTestnet).map((c) => ({
      value: String(c.id),
      label: c.name,
      leading: <Avatar src={c.logoURI} label={c.name} size={20} />,
    }));
    if (midenDestEnabled) {
      opts.push({
        value: String(MIDEN_VIRTUAL_CHAIN_ID),
        label: 'Miden',
        leading: <Avatar label="Miden" size={20} />,
      });
    }
    return opts;
  }, [isTestnet, midenDestEnabled]);

  const tokenOptions: DropdownOption[] = useMemo(() => {
    if (smartDestChainId == null) return [];
    // Miden faucet ids are the dropdown value; the flow reads them back as
    // `midenDest.faucetId`.
    if (smartDestChainId === MIDEN_VIRTUAL_CHAIN_ID) {
      return (midenFaucets ?? []).map((f) => ({
        value: f.faucetId,
        label: f.symbol,
        sublabel: 'Miden',
        leading: <Avatar src={f.logoURI} label={f.symbol} size={20} />,
      }));
    }
    return getEpochTokensByChainEnv(smartDestChainId, isTestnet).map((tok) => ({
      value: tok.address,
      label: tok.symbol,
      sublabel: tok.name,
      leading: <Avatar src={tok.logoURI} label={tok.symbol} size={20} />,
    }));
  }, [smartDestChainId, isTestnet, midenFaucets]);

  return (
    <>
      <div className="grid animate-overlay-in grid-cols-2 gap-3">
        <LabeledPicker label="Destination Chain">
          <Dropdown
            options={chainOptions}
            value={smartDestChainId != null ? String(smartDestChainId) : ''}
            onChange={(v) => onPickDestChain(Number(v))}
            ariaLabel="Destination chain"
            placeholder="Select chain"
            searchable={chainOptions.length > 6}
          />
        </LabeledPicker>
        <LabeledPicker label="Receive Token">
          <Dropdown
            options={tokenOptions}
            value={smartDestTokenAddress}
            onChange={onPickDestToken}
            ariaLabel="Receive token"
            placeholder={
              tokenOptions.length === 0
                ? 'No tokens on this chain'
                : 'Select token'
            }
            disabled={tokenOptions.length === 0}
            searchable={tokenOptions.length > 6}
          />
        </LabeledPicker>
      </div>

      {isMidenDest && (
        <div className="animate-overlay-in rounded-md border border-line bg-surface px-3 py-2">
          <span className={SECTION_LABEL}>Recipient (Miden)</span>
          {midenRecipientAccount ? (
            <div className="mt-1 truncate font-mono text-[12px] text-fg">
              {midenRecipientAccount}
            </div>
          ) : (
            <div className="mt-1 text-[12px] text-fg-muted">
              Connect a Miden account to deliver the withdrawal here.
            </div>
          )}
        </div>
      )}
    </>
  );
}
