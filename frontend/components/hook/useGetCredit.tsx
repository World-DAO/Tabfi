import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import toast from "react-hot-toast";

interface PublishResult {
    digest: string;
    isLoading: boolean;
    error: Error | null;
}

export const useGetCredit = () => {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [result, setResult] = useState<PublishResult>({
        digest: "",
        isLoading: false,
        error: null,
    });

    const getCredit = async (
        chain: `${string}:${string}` = "sui:testnet"
    ) => {
      setResult((prev) => ({ ...prev, isLoading: true, error: null }));
      const tx = new Transaction();
      tx.moveCall({
        target: `${TIME_PACKAGE_ID}::lend::get_new_credit`,
        arguments: [
          tx.object(TIME_REG)
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
          toast.success("Successfully registered!");
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
