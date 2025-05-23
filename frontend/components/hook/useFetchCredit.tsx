// @ts-nocheck
import { useEffect, useState } from "react";
import { TIME_PACKAGE_ID, TIME_REG } from "@/data/SuiConfig";
import { queryCoin, queryDynamicFields, queryField } from "@/lib/query";
import { gqlClient } from "@/lib/query";
import { getAddressBCS } from "@/lib/utils";

interface Credit {
    currCredit: number,
    maxCredit: number,
    balance: string,
    number: number,
    isLoading: boolean
}

export const useFetchCredit = (account: string) => {
  const [result, setResult] = useState<Credit>({
    currCredit: 0,
    maxCredit: 0,
    balance:"0",
    number: 0,
    isLoading: false
  });

  useEffect(() => {
    const fetchCredit = async () => {
      if(!account){
        return
      }
      const creditData = (await gqlClient.query({
        query: queryField,
        variables: {
          address: TIME_REG,
          type: 'address',
          bcs: getAddressBCS(account)
        }
      })).data?.object?.dynamicField?.value?.data?.Struct as any;
      const max = creditData ? creditData.find((item: any) => item.name === "max")?.value.Number : 0;
      const current = creditData ? creditData.find((item: any) => item.name === "current")?.value.Number : 0;
      const coinData = (await gqlClient.query({
        query: queryCoin,
        variables: {
          address: account,
          coinType: `${TIME_PACKAGE_ID}::usdv::USDV`
        }
      })).data?.address?.balance as {
        coinObjectCount: number;
        totalBalance: string;
      };

      setResult({
        currCredit: current,
        maxCredit: max,
        balance: coinData.totalBalance,
        number: 2,
        isLoading: false
      });
    };
    
    fetchCredit();
  }, [account]);
  
  return result
}
