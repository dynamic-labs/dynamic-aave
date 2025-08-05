import {
  chainId,
  evmAddress,
  useAaveMarkets,
  useUserBorrows,
  useUserMarketState,
  useUserSupplies,
} from "@aave/react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { WalletClient } from "viem";
import { base } from "viem/chains";

import { AccountHealth } from "./AccountHealth";
import { BorrowCard } from "./BorrowCard";
import { MarketCard } from "./MarketCard";
import { MarketDetails } from "./MarketDetails";
import { SupplyCard } from "./SupplyCard";
import { TransactionStatus } from "./TransactionStatus";
import { useTransactionOperations } from "../lib/useTransactionOperations";

export function MarketsInterface() {
  const { primaryWallet } = useDynamicContext();
  const [selectedChainId] = useState(base.id);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [lastTransaction, setLastTransaction] = useState<{
    type: string;
    hash: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (primaryWallet && isEthereumWallet(primaryWallet)) {
      primaryWallet.getWalletClient().then(setWalletClient);
    }
  }, [primaryWallet]);

  useEffect(() => {
    if (lastTransaction) {
      const timer = setTimeout(() => {
        setLastTransaction(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [lastTransaction]);

  const {
    isOperating,
    operationError,
    executeSupply,
    executeBorrow,
    executeRepay,
    executeWithdraw,
  } = useTransactionOperations(walletClient, selectedChainId);

  const {
    data: markets,
    loading: marketsLoading,
    error: marketsError,
  } = useAaveMarkets({
    chainIds: [chainId(selectedChainId)],
    user: primaryWallet?.address
      ? evmAddress(primaryWallet.address)
      : undefined,
  });

  const {
    data: userSupplies,
    loading: userSuppliesLoading,
    error: userSuppliesError,
  } = useUserSupplies({
    markets:
      markets?.map((market) => ({
        chainId: market.chain.chainId,
        address: market.address,
      })) || [],
    user: primaryWallet?.address
      ? evmAddress(primaryWallet.address)
      : undefined,
  });

  const {
    data: userBorrows,
    loading: userBorrowsLoading,
    error: userBorrowsError,
  } = useUserBorrows({
    markets:
      markets?.map((market) => ({
        chainId: market.chain.chainId,
        address: market.address,
      })) || [],
    user: primaryWallet?.address
      ? evmAddress(primaryWallet.address)
      : undefined,
  });

  const firstMarket = markets?.[0];
  const { data: userMarketState } = useUserMarketState({
    market:
      firstMarket?.address ||
      evmAddress("0x0000000000000000000000000000000000000000"),
    user: primaryWallet?.address
      ? evmAddress(primaryWallet.address)
      : undefined,
    chainId: chainId(selectedChainId),
  });

  const handleSupply = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => {
    // Log market details when supply button is clicked
    const market = markets?.find((m) => m.address === marketAddress);
    if (market && primaryWallet?.address) {
      const marketDetails = {
        market: market.address,
        amount: {
          erc20: {
            currency: evmAddress(currencyAddress),
            value: amount,
          },
        },
        supplier: evmAddress(primaryWallet.address),
        chainId: market.chain.chainId,
      };
      console.log("Market Details:", marketDetails);
    }

    try {
      const hash = await executeSupply(marketAddress, currencyAddress, amount);
      if (hash) {
        setLastTransaction({
          type: "Supply",
          hash,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Supply failed:", error);
    }
  };

  const handleBorrow = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => {
    try {
      const hash = await executeBorrow(marketAddress, currencyAddress, amount);
      if (hash) {
        setLastTransaction({
          type: "Borrow",
          hash,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Borrow failed:", error);
    }
  };

  const handleRepay = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string | "max"
  ) => {
    try {
      const hash = await executeRepay(marketAddress, currencyAddress, amount);
      if (hash) {
        setLastTransaction({
          type: "Repay",
          hash,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Repay failed:", error);
    }
  };

  const handleWithdraw = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => {
    try {
      const hash = await executeWithdraw(
        marketAddress,
        currencyAddress,
        amount
      );
      if (hash) {
        setLastTransaction({
          type: "Withdraw",
          hash,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Aave V3 Markets</h1>
      <TransactionStatus
        isOperating={isOperating}
        operationError={operationError || null}
        lastTransaction={lastTransaction}
        primaryWallet={primaryWallet}
      />
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Available Markets</h2>
        {marketsLoading ? (
          <p className="text-gray-600">Loading markets...</p>
        ) : marketsError ? (
          <p className="text-red-600">
            Error loading markets: {String(marketsError)}
          </p>
        ) : markets && markets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => (
              <MarketCard
                key={market.address}
                market={market}
                isOperating={isOperating}
                primaryWallet={primaryWallet}
                onSupply={handleSupply}
                onBorrow={handleBorrow}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No markets found for this chain.</p>
        )}
      </div>
      {primaryWallet && (
        <>
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Supplies</h2>
            {userSuppliesLoading ? (
              <p className="text-gray-600">Loading supplies...</p>
            ) : userSuppliesError ? (
              <p className="text-red-600">
                Error loading supplies: {String(userSuppliesError)}
              </p>
            ) : userSupplies && userSupplies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSupplies.map((supply) => (
                  <SupplyCard
                    key={`${supply.market.address}-${supply.currency.address}`}
                    supply={supply}
                    isOperating={isOperating}
                    primaryWallet={primaryWallet}
                    onSupply={handleSupply}
                    onBorrow={handleBorrow}
                    onWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No supplies found.</p>
            )}
          </div>
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Borrows</h2>
            {userBorrowsLoading ? (
              <p className="text-gray-600">Loading borrows...</p>
            ) : userBorrowsError ? (
              <p className="text-red-600">
                Error loading borrows: {String(userBorrowsError)}
              </p>
            ) : userBorrows && userBorrows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBorrows.map((borrow) => (
                  <BorrowCard
                    key={`${borrow.market.address}-${borrow.currency.address}`}
                    borrow={borrow}
                    isOperating={isOperating}
                    primaryWallet={primaryWallet}
                    onRepay={handleRepay}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No borrows found.</p>
            )}
          </div>
          <AccountHealth userMarketState={userMarketState} />
        </>
      )}
      <MarketDetails firstMarket={firstMarket} />
    </div>
  );
}
