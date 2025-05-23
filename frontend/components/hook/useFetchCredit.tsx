import { useEffect, useState } from "react";
import { TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import { queryDynamicFields } from "@/lib/query";
import { gqlClient } from "@/lib/query";

interface Credit {
    currCredit: number,
    maxCredit: number,
    balance: number,
    number: number,
    isLoading: boolean
}

export const useFetchCredit = async(account: string) => {
  const [result, setResult] = useState<Credit>({
    currCredit: 0,
    maxCredit: 0,
    balance: 0,
    number: 0,
    isLoading: false
  });
  useEffect(() => {
    const fetchCredit = async () => {
      const data = await gqlClient.query({
        query: queryDynamicFields,
        variables: {
          id: account
        }
      });
    };
    fetchCredit();
  }, [account]);
  
  return result
}
