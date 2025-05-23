"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPayMonth} from "@/lib/utils";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useFetchTx } from "./hook/useFetchTx";
import { useRepay } from "./hook/useRepay";

interface Transaction {
  lendObj: string;
  amount: number;
  deadline: string;
  alreadyRepaid: number;
  from: string;
}

const TransactionHistory: React.FC = () => {
  const account = useCurrentAccount();
  const {result: tx, fetchTx} = useFetchTx(account?.address ?? '');
  const {repay, digest, isLoading, error} = useRepay();

  // 点击还款按钮后，调用 PATCH 接口更新 isRepaid 状态，并更新本地 state
  const handleRepay = async (tx: Transaction, index: number) => {
    try {
      await repay(tx.lendObj, tx.amount, account?.address ?? '');
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
    fetchTx();
  };
  
  if (tx.isLoading) {
    return (
      <div className="bg-white p-4 rounded-md shadow-sm">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 px-4 text-gray-600 font-semibold">
                Purchase ID
              </th>
              <th className="py-2 px-4 text-gray-600 font-semibold">
                Consumer
              </th>
              <th className="py-2 px-4 text-gray-600 font-semibold">All Amount</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Paid Amount</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">
                Repayment Time
              </th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {tx.data.map((tx, idx) => (
              <tr key={tx.id} className="border-b border-gray-100">
                <td className="py-3 px-4 max-w-[200px] truncate">{tx.lendObj}</td>
                <td className="py-3 px-4 max-w-[200px] truncate">{tx.from}</td>
                <td className="py-3 px-4">{(tx.amount)/1000000}U</td>
                <td className="py-3 px-4">{tx.alreadyRepaid/1000000}U</td>
                <td className="py-3 px-4">{getPayMonth(Number(tx.deadline))} Month</td>
                <td className="py-3 px-4">
                  {tx.isRepaid ? (
                    <span className="text-green-500">Paid</span>
                  ) : (
                    <button
                      onClick={() => handleRepay(tx, idx)}
                      className="text-lg p-2 rounded-lg transition-all duration-200 border-2 text-blue-500 bg-transparent border-blue-400 hover:bg-blue-400 hover:text-white cursor-pointer"
                    >
                      Repay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
