import { safeParseFloat, safeParseUSD } from "../lib/utils";
import type { MarketUserReserveBorrowPosition as AaveBorrowPosition } from "@aave/react";

interface PrimaryWallet {
  address: string;
}

type PrimaryWalletOrNull = PrimaryWallet | null;

interface BorrowCardProps {
  borrow: AaveBorrowPosition;
  isOperating: boolean;
  primaryWallet: PrimaryWalletOrNull;
  onRepay: (
    marketAddress: string,
    currencyAddress: string,
    amount: string | "max"
  ) => void;
}

export function BorrowCard({
  borrow,
  isOperating,
  primaryWallet,
  onRepay,
}: BorrowCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-2">{borrow.currency.symbol}</h3>
      <p className="text-sm text-gray-600 mb-2">Market: {borrow.market.name}</p>
      <p className="text-sm text-gray-600 mb-2">
        Borrowed: {safeParseFloat(borrow.debt.amount, 6)}{" "}
        {borrow.currency.symbol}
      </p>
      <p className="text-sm text-gray-600 mb-3">
        USD Value: {safeParseUSD(borrow.debt.usd)}
      </p>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
            defaultValue="1.0"
            step="0.1"
            min="0"
            id={`repay-amount-${borrow.market.address}-${borrow.currency.address}`}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                `repay-amount-${borrow.market.address}-${borrow.currency.address}`
              ) as HTMLInputElement;
              const amount = input?.value || "1.0";
              onRepay(borrow.market.address, borrow.currency.address, amount);
            }}
            disabled={isOperating || !primaryWallet}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
          >
            Repay
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onRepay(borrow.market.address, borrow.currency.address, "max");
            }}
            disabled={isOperating || !primaryWallet}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
          >
            Repay Max
          </button>
        </div>
      </div>
    </div>
  );
}
