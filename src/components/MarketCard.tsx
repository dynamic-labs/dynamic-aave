import { safeParseUSD, safeParseHealthFactor } from "../lib/utils";
import type { Market as AaveMarket } from "@aave/react";

interface PrimaryWallet {
  address: string;
}

type PrimaryWalletOrNull = PrimaryWallet | null;

interface MarketCardProps {
  market: AaveMarket;
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
}

export function MarketCard({
  market,
  isOperating,
  primaryWallet,
  onSupply,
  onBorrow,
}: MarketCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-2">{market.name}</h3>
      <p className="text-sm text-gray-600 mb-2">Chain: {market.chain.name}</p>
      <p className="text-sm text-gray-600 mb-2">
        Total Market Size: {safeParseUSD(market.totalMarketSize)}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        Available Liquidity: {safeParseUSD(market.totalAvailableLiquidity)}
      </p>
      <p className="text-sm text-gray-600">
        Reserves: {market.supplyReserves.length} supply,{" "}
        {market.borrowReserves.length} borrow
      </p>
      {market.userState && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-green-600">
            Net Worth: {safeParseUSD(market.userState.netWorth)}
          </p>
          <p className="text-sm font-medium text-blue-600">
            Health Factor:{" "}
            {safeParseHealthFactor(market.userState.healthFactor)}
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
              defaultValue="1.0"
              step="0.1"
              min="0"
              id={`supply-amount-${market.address}`}
            />
            <button
              onClick={() => {
                const firstReserve = market.supplyReserves[0];
                if (firstReserve) {
                  const input = document.getElementById(
                    `supply-amount-${market.address}`
                  ) as HTMLInputElement;
                  const amount = input?.value || "1.0";
                  onSupply(
                    market.address,
                    firstReserve.underlyingToken.address,
                    amount
                  );
                }
              }}
              disabled={isOperating || !primaryWallet}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
            >
              Supply
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
              defaultValue="1.0"
              step="0.1"
              min="0"
              id={`borrow-amount-${market.address}`}
            />
            <button
              onClick={() => {
                const firstReserve = market.borrowReserves[0];
                if (firstReserve) {
                  const input = document.getElementById(
                    `borrow-amount-${market.address}`
                  ) as HTMLInputElement;
                  const amount = input?.value || "1.0";
                  onBorrow(
                    market.address,
                    firstReserve.underlyingToken.address,
                    amount
                  );
                }
              }}
              disabled={isOperating || !primaryWallet}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded"
            >
              Borrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
