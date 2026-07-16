import type { ComponentProps } from 'react';
import { Modal } from '../Modal';
import { TokenSelector, type TokenWithChain } from '../TokenSelector';

interface TokenPickerModalProps {
  /** Modal chrome shared with every other view of the widget. */
  chrome: Omit<ComponentProps<typeof Modal>, 'title' | 'children'>;
  title: string;
  tokens: TokenWithChain[];
  selectedTokenAddress: string;
  selectedChainId: number | null;
  onSelect: (chainId: number, tokenAddress: string) => void;
  onBack: () => void;
}

/** Source and destination pickers differ only in title and list. */
export function TokenPickerModal({
  chrome,
  title,
  tokens,
  selectedTokenAddress,
  selectedChainId,
  onSelect,
  onBack,
}: TokenPickerModalProps) {
  return (
    <Modal {...chrome} title={title} onBack={onBack}>
      <TokenSelector
        tokens={tokens}
        selectedTokenAddress={selectedTokenAddress}
        selectedChainId={selectedChainId}
        onSelect={(addr, cid) => onSelect(cid, addr)}
        onBack={onBack}
      />
    </Modal>
  );
}
