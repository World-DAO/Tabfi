// @ts-nocheck
import { useEffect, useState } from "react";
import { TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import { queryDynamicFields } from "@/lib/query";
import { gqlClient } from "@/lib/query";

interface lendTx {
  data: any[],
  isLoading: boolean
}

export const useFetchTx = (account: string) => {
  const [result, setResult] = useState<lendTx>({
    data: [],
    isLoading: false
  });
  
  const fetchTx = async () => {
    if(!account){
      return
    }
    setResult({
      data: [],
      isLoading: true
    });
    const data = (await gqlClient.query({
      query: queryDynamicFields,
      variables: {
        id: TIME_REG
      }
    })).data?.owner?.dynamicFields?.nodes.map((node: any) => node.value.json);
    const filterData = data.filter((item: any) => item.receiver === account&&item.deadline);
    setResult({
      data:filterData.map((item: any) => ({
        from: item.borrower,
        amount: item.amountToPay,
        deadline: item.deadline,
        lendObj: item.id,
        alreadyRepaid: item.amountAlreadyPaid
      })),
      isLoading: false
    });
  };

  useEffect(() => {
    fetchTx();
  }, [account]);

  return {result, fetchTx}
}
