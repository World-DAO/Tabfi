import { useEffect, useState } from "react";
import { TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import { queryDynamicFields } from "@/lib/query";
import { gqlClient } from "@/lib/query";

interface lendTx {
  data:{
    from: string,
    to: string,
    amount: number,
    timestamp: number,
    deadline: number,
    lendObj: string,
  },
  isLoading: boolean
}

export const useFetchTx = async(account: string) => {
  const [result, setResult] = useState<lendTx>({
    data: {
      from: "",
      to: "",
      amount: 0,
      timestamp: 0,
      deadline: 0,
      lendObj: ""
    },
    isLoading: false
  });
  
  useEffect(() => {
    const fetchCredit = async () => {
      const data = await gqlClient.query(queryDynamicFields, { id: account });
    };
    fetchCredit();
  }, [account]);

  return result
}
