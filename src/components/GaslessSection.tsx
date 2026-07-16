import type { UseGaslessWalletResult } from '../hooks/use-gasless-wallet-check';
import { GaslessEnableButton } from './GaslessEnableButton';

interface GaslessSectionProps {
  /** Render nothing when the wallet can't do gasless at all. */
  allowed: boolean;
  wallet: UseGaslessWalletResult;
  gasless: boolean;
  onChange: (next: boolean) => void;
}

/** Wires `useGaslessWallet` to its button. Shared by every flow's footer area. */
export function GaslessSection({
  allowed,
  wallet,
  gasless,
  onChange,
}: GaslessSectionProps) {
  if (!allowed) return null;
  return (
    <GaslessEnableButton
      gasless={gasless}
      disabledReason={wallet.unavailableReason}
      needsEpochSetup={wallet.needsEpochSetup}
      onSwitchSmartAccount={() => wallet.switchToEpochSmartAccount()}
      setupBusy={wallet.setupBusy}
      setupError={wallet.setupError}
      checking={wallet.checking}
      onEnable={() => onChange(true)}
      onDisable={() => onChange(false)}
    />
  );
}
