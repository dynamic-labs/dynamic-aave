import { safeParseFloat } from "../lib/utils";
import type { Market as AaveMarket, Reserve as AaveReserve } from "@aave/react";

interface MarketDetailsProps {
  firstMarket: AaveMarket | undefined;
}

export function MarketDetails({ firstMarket }: MarketDetailsProps) {
  if (!firstMarket) return null;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        Market Details: {firstMarket.name}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Supply Reserves</h3>
          <div className="space-y-2">
            {firstMarket.supplyReserves
              .slice(0, 5)
              .map((reserve: AaveReserve) => (
                <div
                  key={reserve.underlyingToken.address}
                  className="bg-white p-3 rounded shadow"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {reserve.underlyingToken.symbol}
                    </span>
                    <span className="text-sm text-gray-600">
                      {safeParseFloat(reserve.supplyInfo.apy, 2)}% APY
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Total: {safeParseFloat(reserve.size.amount, 2)}{" "}
                    {reserve.underlyingToken.symbol}
                  </p>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Borrow Reserves</h3>
          <div className="space-y-2">
            {firstMarket.borrowReserves
              .slice(0, 5)
              .map((reserve: AaveReserve) => (
                <div
                  key={reserve.underlyingToken.address}
                  className="bg-white p-3 rounded shadow"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {reserve.underlyingToken.symbol}
                    </span>
                    <span className="text-sm text-gray-600">
                      {safeParseFloat(
                        reserve.borrowInfo?.apy || { value: "0" },
                        2
                      )}
                      % APY
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Available:{" "}
                    {safeParseFloat(
                      reserve.borrowInfo?.availableLiquidity?.amount || {
                        value: "0",
                      },
                      2
                    )}{" "}
                    {reserve.underlyingToken.symbol}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
