// data/transactions.ts

export interface Transaction {
    transactionHash: string;
    buyer: string;
    amount: string;
    time: string;
    repaymentTime: string;
    isRepaid: boolean;
  }
  
  export const transactions: Transaction[] = [
    {
      transactionHash: "0xabc123",
      buyer: "0x323",
      amount: "$300",
      time: "Jan 13 2025, 10:00 AM",
      repaymentTime: "Jan 20 2025, 10:00 AM",
      isRepaid: false,
    },
    {
      transactionHash: "0xdef456",
      buyer: "0x323",
      amount: "$500",
      time: "Jan 14 2025, 11:00 AM",
      repaymentTime: "Jan 21 2025, 11:00 AM",
      isRepaid: false,
    },
    {
      transactionHash: "0xghi789",
      buyer: "0x323",
      amount: "$250",
      time: "Jan 15 2025, 12:00 PM",
      repaymentTime: "Jan 22 2025, 12:00 PM",
      isRepaid: false,
    },
  ];
  