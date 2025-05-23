import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { CLOCK_ID, TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";

interface LendResult {
    digest: string;
    isLoading: boolean;
    error: Error | null;
}

export const useLend = (target: string, deadline: number) => {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [result, setResult] = useState<PublishResult>({
        digest: "",
        isLoading: false,
        error: null,
    });

    const lend = async (
        chain: `${string}:${string}` = "sui:testnet"
    ) => {
      setResult((prev) => ({ ...prev, isLoading: true, error: null }));
      const tx = new Transaction();
      tx.moveCall({
        target: `${TIME_PACKAGE_ID}::lend::lend_to_others`,
        arguments: [
          tx.object(TIME_REG),
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
      lend,
      digest: result.digest,
      isLoading: result.isLoading,
      error: result.error,
  };
};
