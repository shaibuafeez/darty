import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { TransactionResult } from '../../lib/types';
import { explorerUrl } from '../../lib/aleo';

interface Props {
  result: TransactionResult | null;
  onDismiss: () => void;
}

export default function TransactionStatus({ result, onDismiss }: Props) {
  if (!result) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-toast-enter">
      <div
        className={`rounded-xl border p-4 shadow-2xl backdrop-blur-md ${
          result.status === 'success'
            ? 'bg-green-900/80 border-green-700 shadow-green-900/30'
            : result.status === 'error'
            ? 'bg-red-900/80 border-red-700 shadow-red-900/30'
            : 'bg-neutral-900/80 border-neutral-700 shadow-neutral-900/30'
        }`}
      >
        <div className="flex items-start gap-3">
          {result.status === 'pending' && (
            <Loader2 size={20} className="text-neutral-400 animate-spin mt-0.5" />
          )}
          {result.status === 'success' && (
            <CheckCircle size={20} className="text-green-400 mt-0.5" />
          )}
          {result.status === 'error' && (
            <XCircle size={20} className="text-red-400 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {result.status === 'pending' && 'Transaction Pending...'}
              {result.status === 'success' && 'Transaction Successful'}
              {result.status === 'error' && 'Transaction Failed'}
            </p>
            {result.message && (
              <p className="text-xs text-neutral-300 mt-1">{result.message}</p>
            )}
            {result.txId && result.status === 'success' && (
              <a
                href={explorerUrl(result.txId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2"
              >
                View on Explorer <ExternalLink size={12} />
              </a>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-md p-1 text-sm transition-colors"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
