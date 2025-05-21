"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPayTime } from "@/lib/utils";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

interface Transaction {
  id: string;
  transactionHash: string;
  buyer: string;
  amount: string;
  time: string;
  repaymentTime: string;
  isRepaid: boolean;
}

const TransactionHistory: React.FC = () => {
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // 点击还款按钮后，调用 PATCH 接口更新 isRepaid 状态，并更新本地 state
  const handleRepay = async (tx: Transaction, index: number) => {
    try {
      await repay(tx);
      // if (response.ok) {
      //   const updatedTx: Transaction = await response.json();
      //   const updatedTxList = [...txList];
      //   updatedTxList[index] = updatedTx;
      //   setTxList(updatedTxList);
      // } else {
      //   console.error("Failed to update transaction");
      // }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };
  
  const repay = async (tx: Transaction) => {
    if (account == null) {
      toast.error("Please connect your wallet.");
      return;
    }

    try {
      // repay
      // if you want to wait for transaction
    } catch (error) {
      console.error(error);
    } finally {
      toast.success("Repayment successful");
    }
  }
  
  if (loading) {
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
                Transaction Hash
              </th>
              <th className="py-2 px-4 text-gray-600 font-semibold">
                Consumer
              </th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Amount</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Time</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">
                Repayment Time
              </th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {txList.map((tx, idx) => (
              <tr key={tx.id} className="border-b border-gray-100">
                <td className="py-3 px-4 max-w-[100px] truncate">{tx.transactionHash}</td>
                <td className="py-3 px-4 max-w-[100px] truncate">{tx.buyer}</td>
                <td className="py-3 px-4">{tx.amount}</td>
                <td className="py-3 px-4">{tx.time}</td>
                <td className="py-3 px-4">{getPayTime(Number(tx.repaymentTime), tx.time)}</td>
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
