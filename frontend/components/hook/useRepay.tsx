import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CLOCK_ID, TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";

interface RepayResult {
    digest: string;
    isLoading: boolean;
    error: Error | null;
}

export const useRepay = () => {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [result, setResult] = useState<RepayResult>({
        digest: "",
        isLoading: true,
        error: null,
    });

    const getCredit = async (
        chain: `${string}:${string}` = "sui:testnet",
        lend: string
    ) => {
      setResult((prev) => ({ ...prev, isLoading: true, error: null }));
      const tx = new Transaction();
      const [coin] = 
      tx.moveCall({
        target: `${TIME_PACKAGE_ID}::lend::get_new_credit`,
        arguments: [
          tx.object(),
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
        },
        onError: (error) => {
          setResult({
            digest: "",
            isLoading: false,
            error: error,
          });
        }
      });
  };

  return {
      getCredit,
      digest: result.digest,
      isLoading: result.isLoading,
      error: result.error,
  };
};
