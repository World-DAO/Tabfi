// @ts-nocheck
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CLOCK_ID, TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import { getAllCoins } from "@/lib/utils";
import toast from "react-hot-toast";
import { useFetchTx } from "./useFetchTx";

interface RepayResult {
    digest: string;
    isLoading: boolean;
    error: Error | null;
}

export const useRepay = () => {
    const chain = "sui:testnet";
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [result, setResult] = useState<RepayResult>({
        digest: "",
        isLoading: true,
        error: null,
    });

    const repay = async (
        lend: string,
        amount: number,
        account: string
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

      tx.moveCall({
        target: `${TIME_PACKAGE_ID}::lend::repay`,
        arguments: [
          coinToPay,
          tx.object(lend),
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
          console.log(1);
          toast.success("Repayment successful");
        },
        onError: (error) => {
          setResult({
            digest: "",
            isLoading: false,
            error: error,
          });
          toast.error("Repayment failed");
        }
      });
  };

  return {
      repay,
      digest: result.digest,
      isLoading: result.isLoading,
      error: result.error,
  };
};
