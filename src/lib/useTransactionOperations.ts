import { useSendTransaction } from "@aave/react/viem";
import { WalletClient, createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import {
  bigDecimal,
  chainId,
  evmAddress,
  useBorrow,
  useRepay,
  useSupply,
  useWithdraw,
} from "@aave/react";

export function useTransactionOperations(
  walletClient: WalletClient | null,
  selectedChainId: number
) {
  const [supply, supplying] = useSupply();
  const [borrow, borrowing] = useBorrow();
  const [repay, repaying] = useRepay();
  const [withdraw, withdrawing] = useWithdraw();
  const [sendTransaction, sending] = useSendTransaction(
    walletClient || undefined
  );

  const isOperating =
    supplying.loading ||
    borrowing.loading ||
    repaying.loading ||
    withdrawing.loading ||
    sending.loading;

  const operationError =
    supplying.error ||
    borrowing.error ||
    repaying.error ||
    withdrawing.error ||
    sending.error;

  const executeSupply = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => {
    if (!walletClient?.account?.address) {
      console.error("Wallet not connected");
      return;
    }

    // Debug logging
    console.log("=== SUPPLY DEBUG INFO ===");
    console.log("Wallet address:", walletClient.account.address);
    console.log("Market address:", marketAddress);
    console.log("Currency address:", currencyAddress);
    console.log("Amount to supply:", amount);
    console.log("Chain ID:", selectedChainId);
    console.log("Parsed amount:", parseFloat(amount));
    console.log("BigDecimal amount:", bigDecimal(parseFloat(amount)));

    // Check actual token balance on blockchain
    try {
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      // ERC20 balanceOf function
      const balanceOfAbi = parseAbiItem(
        "function balanceOf(address owner) view returns (uint256)"
      );
      const balanceResult = await publicClient.readContract({
        address: currencyAddress as `0x${string}`,
        abi: [balanceOfAbi],
        functionName: "balanceOf",
        args: [walletClient.account.address as `0x${string}`],
      });

      console.log("🔍 ACTUAL TOKEN BALANCE ON BLOCKCHAIN:");
      console.log("Raw balance:", balanceResult.toString());
      console.log("Balance in wei:", balanceResult);

      // Try to get token decimals
      const decimalsAbi = parseAbiItem(
        "function decimals() view returns (uint8)"
      );
      try {
        const decimals = await publicClient.readContract({
          address: currencyAddress as `0x${string}`,
          abi: [decimalsAbi],
          functionName: "decimals",
        });
        const humanReadableBalance =
          Number(balanceResult) / Math.pow(10, decimals);
        console.log("Token decimals:", decimals);
        console.log("Human readable balance:", humanReadableBalance);
        console.log("Amount trying to supply:", parseFloat(amount));
        console.log(
          "Balance sufficient?",
          humanReadableBalance >= parseFloat(amount)
        );
      } catch (decimalsError) {
        console.log("Could not fetch token decimals:", decimalsError);
      }
    } catch (balanceError) {
      console.log("Could not fetch token balance:", balanceError);
    }

    try {
      const result = await supply({
        market: evmAddress(marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(currencyAddress),
            value: bigDecimal(parseFloat(amount)),
          },
        },
        sender: evmAddress(walletClient.account.address),
        chainId: chainId(selectedChainId),
      }).andThen((plan) => {
        console.log("Transaction plan type:", plan.__typename);

        switch (plan.__typename) {
          case "TransactionRequest":
            console.log("Direct transaction request");
            return sendTransaction(plan);
          case "ApprovalRequired":
            console.log("Approval required, sending approval first");
            return sendTransaction(plan.approval).andThen(() =>
              sendTransaction(plan.originalTransaction)
            );
          case "InsufficientBalanceError":
            console.log("❌ INSUFFICIENT BALANCE ERROR");
            console.log("Required amount:", plan.required.value);
            console.log("Required amount raw:", plan.required.raw);
            console.log("Required amount decimals:", plan.required.decimals);
            throw new Error(
              `Insufficient balance: ${plan.required.value} required.`
            );
          default:
            console.log("Unknown plan type:", plan);
            throw new Error("Unknown transaction plan type");
        }
      });

      if (result.isErr()) {
        console.error("Supply failed:", result.error);
      } else {
        console.log("Supply successful with hash:", result.value);
        return result.value;
      }
    } catch (error) {
      console.error("Supply operation failed:", error);
      console.log("Full error details:", error);
      throw error;
    }
  };

  const executeBorrow = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => {
    if (!walletClient?.account?.address) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const result = await borrow({
        market: evmAddress(marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(currencyAddress),
            value: bigDecimal(parseFloat(amount)),
          },
        },
        sender: evmAddress(walletClient.account.address),
        chainId: chainId(selectedChainId),
      }).andThen((plan) => {
        switch (plan.__typename) {
          case "TransactionRequest":
            return sendTransaction(plan);
          case "ApprovalRequired":
            return sendTransaction(plan.approval).andThen(() =>
              sendTransaction(plan.originalTransaction)
            );
          case "InsufficientBalanceError":
            throw new Error(
              `Insufficient balance: ${plan.required.value} required.`
            );
          default:
            throw new Error("Unknown transaction plan type");
        }
      });

      if (result.isErr()) {
        console.error("Borrow failed:", result.error);
      } else {
        console.log("Borrow successful with hash:", result.value);
        return result.value;
      }
    } catch (error) {
      console.error("Borrow operation failed:", error);
      throw error;
    }
  };

  const executeRepay = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string | "max"
  ) => {
    if (!walletClient?.account?.address) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const result = await repay({
        market: evmAddress(marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(currencyAddress),
            value:
              amount === "max"
                ? { max: true }
                : { exact: bigDecimal(parseFloat(amount)) },
          },
        },
        sender: evmAddress(walletClient.account.address),
        chainId: chainId(selectedChainId),
      }).andThen((plan) => {
        switch (plan.__typename) {
          case "TransactionRequest":
            return sendTransaction(plan);
          case "ApprovalRequired":
            return sendTransaction(plan.approval).andThen(() =>
              sendTransaction(plan.originalTransaction)
            );
          case "InsufficientBalanceError":
            throw new Error(
              `Insufficient balance: ${plan.required.value} required.`
            );
          default:
            throw new Error("Unknown transaction plan type");
        }
      });

      if (result.isErr()) {
        console.error("Repay failed:", result.error);
      } else {
        console.log("Repay successful with hash:", result.value);
        return result.value;
      }
    } catch (error) {
      console.error("Repay operation failed:", error);
      throw error;
    }
  };

  const executeWithdraw = async (
    marketAddress: string,
    currencyAddress: string,
    amount: string
  ) => {
    if (!walletClient?.account?.address) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const result = await withdraw({
        market: evmAddress(marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(currencyAddress),
            value: {
              exact: bigDecimal(parseFloat(amount)),
            },
          },
        },
        sender: evmAddress(walletClient.account.address),
        chainId: chainId(selectedChainId),
      }).andThen((plan) => {
        switch (plan.__typename) {
          case "TransactionRequest":
            return sendTransaction(plan);
          case "ApprovalRequired":
            return sendTransaction(plan.approval).andThen(() =>
              sendTransaction(plan.originalTransaction)
            );
          case "InsufficientBalanceError":
            throw new Error(
              `Insufficient balance: ${plan.required.value} required.`
            );
          default:
            throw new Error("Unknown transaction plan type");
        }
      });

      if (result.isErr()) {
        console.error("Withdraw failed:", result.error);
      } else {
        console.log("Withdraw successful with hash:", result.value);
        return result.value;
      }
    } catch (error) {
      console.error("Withdraw operation failed:", error);
      throw error;
    }
  };

  return {
    isOperating,
    operationError,
    executeSupply,
    executeBorrow,
    executeRepay,
    executeWithdraw,
  };
}
