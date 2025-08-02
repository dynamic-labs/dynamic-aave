import { safeParseFloat, safeParseUSD } from "../lib/utils";
import type { MarketUserReserveSupplyPosition as AaveSupplyPosition } from "@aave/react";

interface PrimaryWallet {
  address: string;
}

type PrimaryWalletOrNull = PrimaryWallet | null;

interface SupplyCardProps {
  supply: AaveSupplyPosition;
  isOperating: boolean;
  primaryWallet: PrimaryWalletOrNull;
  onSupply: (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => void;
  onBorrow: (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => void;
  onWithdraw: (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => void;
}

export function SupplyCard({
  supply,
  isOperating,
  primaryWallet,
  onSupply,
  onBorrow,
  onWithdraw,
}: SupplyCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-2">{supply.currency.symbol}</h3>
      <p className="text-sm text-gray-600 mb-2">Market: {supply.market.name}</p>
      <p className="text-sm text-gray-600 mb-2">
        Balance: {safeParseFloat(supply.balance.amount, 6)}{" "}
        {supply.currency.symbol}
      </p>
      <p className="text-sm text-gray-600 mb-3">
        USD Value: {safeParseUSD(supply.balance.usd)}
      </p>

      <div className="space-y-2">
        {/* Supply more */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
            defaultValue="1.0"
            step="0.1"
            min="0"
            id={`supply-more-amount-${supply.market.address}-${supply.currency.address}`}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                `supply-more-amount-${supply.market.address}-${supply.currency.address}`
              ) as HTMLInputElement;
              const amount = input?.value || "1.0";
              onSupply(supply.market.address, supply.currency.address, amount);
            }}
            disabled={isOperating || !primaryWallet}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
          >
            Supply More
          </button>
        </div>

        {/* Borrow */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
            defaultValue="1.0"
            step="0.1"
            min="0"
            id={`borrow-amount-${supply.market.address}-${supply.currency.address}`}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                `borrow-amount-${supply.market.address}-${supply.currency.address}`
              ) as HTMLInputElement;
              const amount = input?.value || "1.0";
              onBorrow(supply.market.address, supply.currency.address, amount);
            }}
            disabled={isOperating || !primaryWallet}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
          >
            Borrow
          </button>
        </div>

        {/* Withdraw */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
            defaultValue="1.0"
            step="0.1"
            min="0"
            id={`withdraw-amount-${supply.market.address}-${supply.currency.address}`}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                `withdraw-amount-${supply.market.address}-${supply.currency.address}`
              ) as HTMLInputElement;
              const amount = input?.value || "1.0";
              onWithdraw(
                supply.market.address,
                supply.currency.address,
                amount
              );
            }}
            disabled={isOperating || !primaryWallet}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
