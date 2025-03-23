import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui';

type ConnectWalletProps = {
  compact?: boolean;
  hideAddress?: boolean;
};

export default function ConnectWallet({ compact = false, hideAddress = false }: ConnectWalletProps) {
  const { connected, address } = useWallet();

  return (
    <div className={`flex items-center gap-2 ${compact ? 'connect-wallet--compact' : 'connect-wallet'}`}>
      <WalletMultiButton />
      {connected && address && !hideAddress && (
        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/55 font-mono sm:inline">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
      )}
    </div>
  );
}
