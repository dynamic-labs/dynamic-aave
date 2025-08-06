interface Transaction {
  type: string;
  hash: string;
  timestamp: number;
}

interface PrimaryWallet {
  address: string;
}

interface TransactionStatusProps {
  isOperating: boolean;
  operationError: Error | null;
  lastTransaction: Transaction | null;
  primaryWallet: PrimaryWallet | null;
}

export function TransactionStatus({
  isOperating,
  operationError,
  lastTransaction,
  primaryWallet,
}: TransactionStatusProps) {
  return (
    <>
      <div className="text-center text-sm text-gray-500 mb-6">
        {primaryWallet ? (
          <span>✅ Connected: {primaryWallet.address}</span>
        ) : (
          <span>❌ Wallet Not Connected</span>
        )}
      </div>

      {isOperating && (
        <div className="text-center text-sm text-blue-600 mb-4">
          ⏳ Processing transaction...
        </div>
      )}

      {operationError && (
        <div className="text-center text-sm text-red-600 mb-4">
          ❌ Error: {String(operationError)}
        </div>
      )}

      {lastTransaction && (
        <div className="text-center text-sm text-green-600 mb-4">
          ✅ {lastTransaction.type} successful! Hash:{" "}
          <a
            href={`https://basescan.org/tx/${lastTransaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {lastTransaction.hash}
          </a>
        </div>
      )}
    </>
  );
}
