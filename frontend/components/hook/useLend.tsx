// @ts-nocheck
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { CLOCK_ID, TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import { getAllCoins } from "@/lib/utils";
import toast from "react-hot-toast";

interface LendResult {
    digest: string;
    isLoading: boolean;
    error: Error | null;
}

export const useLend = (chain: `${string}:${string}` = "sui:testnet") => {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [result, setResult] = useState<LendResult>({
        digest: "",
        isLoading: false,
        error: null,
    });

    const lend = async (
      account: string,
      target: string,
      deadline: number,
      amount: number
    ) => {
      setResult((prev) => ({ ...prev, isLoading: true, error: null }));
      const tx = new Transaction();
      const coins = (await getAllCoins(account)).map(i => i.address)
      const primaryCoin = tx.object(coins[0])
      const mergedCoins = coins.slice(1).map(coin => tx.object(coin))
      if(coins.length > 1) {
        tx.mergeCoins(primaryCoin, mergedCoins);
      }
      const [coinToPay] = tx.splitCoins(primaryCoin, [tx.pure.u64(amount)]);
      const id = tx.moveCall({
        target: `${TIME_PACKAGE_ID}::lend::lend_to_others`,
        arguments: [
          coinToPay,
          tx.object(target),
          tx.pure.u64(deadline),
          tx.object(CLOCK_ID),
          tx.object(TIME_REG),
        ],
      })
      signAndExecuteTransaction({
          transaction: tx,
          chain
      },
      {
        onSuccess: (data) => {
          setResult({
            digest: data.digest,
            isLoading: false,
            error: null,
          });
          toast.success("Payment Success!");
        },
        onError: (error) => {
          setResult({
            digest: "",
            isLoading: false,
            error: error,
          });
          toast.error("Payment failed. Please try again.");
        }
      });
  };

  return {
      lend,
      digest: result.digest,
      isLoading: result.isLoading,
      error: result.error,
  };
};
