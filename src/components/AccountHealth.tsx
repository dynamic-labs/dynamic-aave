import { safeParseUSD, safeParseHealthFactor } from "../lib/utils";
import type { MarketUserState as AaveUserMarketState } from "@aave/react";

interface AccountHealthProps {
  userMarketState: AaveUserMarketState | undefined;
}

export function AccountHealth({ userMarketState }: AccountHealthProps) {
  if (!userMarketState) return null;

  return (
    <div className="bg-yellow-50 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Account Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Health Factor</h3>
          <p
            className={`text-2xl font-bold ${
              parseFloat(safeParseHealthFactor(userMarketState.healthFactor)) >
              1.5
                ? "text-green-600"
                : parseFloat(
                    safeParseHealthFactor(userMarketState.healthFactor)
                  ) > 1.0
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {safeParseHealthFactor(userMarketState.healthFactor)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Net Worth</h3>
          <p className="text-2xl font-bold text-green-600">
            {safeParseUSD(userMarketState.netWorth)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">eMode</h3>
          <p className="text-2xl font-bold text-blue-600">
            {userMarketState.eModeEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    </div>
  );
}
