"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getTime } from "@/lib/utils";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useLend } from "@/components/hook/useLend";
import { COFFEE_ADDRESS } from "@/data/SuiConfig";

export default function CoffeePage() {
  const account = useCurrentAccount();
  const { lend, digest, error } = useLend();

  // Coffee list with image paths added
  const coffeeList = [
    { name: "Latte", price: 4, image: "/images/latte.svg" },
    { name: "Americano", price: 4, image: "/images/americano.svg" },
    { name: "Espresso", price: 5, image: "/images/espresso.svg" },
    { name: "Lungo", price: 5, image: "/images/lungo.svg" },
    { name: "Corretto", price: 4, image: "/images/corretto.svg" },
    { name: "Macchiato", price: 5, image: "/images/macchiato.svg" },
    { name: "Espresso Romano", price: 5, image: "/images/espresso-romano.svg" },
    { name: "Galao", price: 5, image: "/images/galao.svg" },
  ];

  // Selected coffee state
  const [selectedCoffee, setSelectedCoffee] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  // Toggle mode: false => "Select repayment time", true => "Input amount"
  const [isAmountToTime, setIsAmountToTime] = useState(false);

  // Input values
  const [inputTime, setInputTime] = useState<number | null>(null);
  const [inputAmount, setInputAmount] = useState<number | null>(null);

  // Calculated results
  const [calculatedTime, setCalculatedTime] = useState<string>(""); // For input amount -> calculated time
  const [calculatedAmount, setCalculatedAmount] = useState<string>(""); // For input time -> calculated amount

  const [isLoading, setIsLoading] = useState(false);

  // Handle coffee selection
  const handleSelectCoffee = (coffeeName: string, coffeePrice: number) => {
    if (selectedCoffee === coffeeName) {
      // Deselect if clicked again
      setSelectedCoffee(null);
      setSelectedPrice(0);
    } else {
      setSelectedCoffee(coffeeName);
      setSelectedPrice(coffeePrice);
    }
    // Reset payment inputs and calculations
    setInputTime(null);
    setInputAmount(null);
    setCalculatedTime("");
    setCalculatedAmount("");
  };

  // Handle dropdown selection (input time -> calculate amount)
  const handleTimeChange = (value: string) => {
    const m = parseInt(value, 10);
    setInputTime(m);
    const monthlyRate = 0.0033333; // 每月利率
    if (selectedPrice <= 0 || m <= 0) {
      setCalculatedAmount("0");
      return;
    }
    // 计算公式：balance * monthlyRate * m >= selectedPrice
    // 最小 balance = selectedPrice / (monthlyRate * m)
    const requiredBalance =
      Math.ceil((selectedPrice / (monthlyRate * m)) * 100) / 100; // 保留两位小数
    setCalculatedAmount(requiredBalance.toString());
  };

  // Handle input change (input amount -> calculate time)
  const handleAmountChange = (value: string) => {
    const amountVal = parseFloat(value);
    setInputAmount(amountVal);
    const monthlyRate = 0.0033333; // 每月利率
    if (selectedPrice <= 0 || amountVal <= 0) {
      setCalculatedTime("0");
      return;
    }
    // 计算公式：amountVal * monthlyRate * m >= selectedPrice
    // 最小 m = selectedPrice / (amountVal * monthlyRate)
    const m = Math.ceil(selectedPrice / (amountVal * monthlyRate));
    setCalculatedTime(m.toString());
  };

  // Handle checkout button click
  const handleSend = async () => {
    // Validate if a coffee is selected
    if (!selectedCoffee) {
      toast.error("Please order first.");
      return;
    }
    // Validate wallet connection
    if (!account) {
      toast.error("Please connect your wallet.");
      return;
    }

    if (!isAmountToTime) {
      // Mode: "Select repayment time" -> calculated amount is used.
      if (!inputTime) {
        toast.error("Please select repayment time.");
        return;
      }
      if (calculatedAmount === "" || parseFloat(calculatedAmount) <= 0) {
        toast.error("Calculated amount is invalid.");
        return;
      }
    } else {
      // Mode: "Input amount" -> calculated repayment time is used.
      if (!inputAmount || inputAmount <= 0) {
        toast.error("Please input fund.");
        return;
      }
      if (calculatedTime === "" || parseInt(calculatedTime) <= 0) {
        toast.error("Calculated repayment time is invalid.");
        return;
      }
      if (parseInt(calculatedTime) > 24) {
        toast.error(
          "Amount is too low, exceeding the maximum loan duration limit. Please add more funds."
        );
        return;
      }
    }

    setIsLoading(true);

    // Prepare parameters for contract call;
    let amountParam: string | number, repayTimeParam: string | number;
    if (!isAmountToTime) {
      // Mode: "Select repayment time"
      amountParam = calculatedAmount; // calculated amount (string)
      repayTimeParam = inputTime!; // selected month (number)
    } else {
      // Mode: "Input amount"
      amountParam = inputAmount!; // input amount (number)
      repayTimeParam = calculatedTime; // calculated month (string)
    }

    try {
      const amount =
        typeof amountParam === "string"
          ? parseFloat(amountParam.toString()) * 10 ** 6
          : amountParam*10**6;
      const response = await sendLoan(COFFEE_ADDRESS, amount, Number(repayTimeParam));
      // here post history in the json server.
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendLoan = async (seller: string, amount: number, month: number) => {
    if (account == null) {
      toast.error("Please connect your wallet.");
      return;
    }
    const time = getTime(month);
    // lend
    try {
      const response = await lend(account.address, seller, time, amount);
      return response;
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 lg:py-8">
      <Toaster />

      {/* Left side: Coffee selection */}
      <div className="bg-white px-4 lg:py-8 rounded-lg">
        <h2 className="text-3xl font-bold">Tabfi Coffee</h2>
        <p className="mt-2 text-gray-600">Pick what you want</p>

        <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4 ">
          {coffeeList.map((coffee) => (
            <div
              key={coffee.name}
              onClick={() => handleSelectCoffee(coffee.name, coffee.price)}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer
              ${
                selectedCoffee === coffee.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {/* Display coffee image if available */}
              {coffee.image && (
                <img
                  src={coffee.image}
                  alt={coffee.name}
                  className="h-16 w-16 object-cover mb-2"
                />
              )}
              <div className="text-sm font-semibold text-center lg:text-xl">
                {coffee.name}
              </div>
              <div className="mt-2 text-gray-600">${coffee.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Cart and calculation area */}
      <div className="bg-white p-8 rounded-lg flex flex-col justify-between">
        {/* Selected coffee info */}
        <div>
          <h2 className="text-2xl font-bold">Your Selection:</h2>
          {selectedCoffee ? (
            <div>
              <p className="mt-2 pl-4 text-gray-700 font-semibold text-lg">
                {selectedCoffee}
              </p>
              <p className="mt-6 text-gray-700 font-semibold text-lg text-right">
                Total cost: <strong>${selectedPrice}</strong>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-gray-400">No coffee selected.</p>
          )}
        </div>

        {/* Divider */}
        <hr className="my-4" />

        {/* Toggle: Two tag buttons for selecting mode */}
        <div className="mb-4 flex gap-0">
          <button
            onClick={() => {
              if (isAmountToTime) {
                setIsAmountToTime(false);
                // Clear previous inputs and results when switching mode
                setInputTime(null);
                setInputAmount(null);
                setCalculatedTime("");
                setCalculatedAmount("");
              }
            }}
            className={`w-full text-lg font-semibold p-3 rounded-bl-lg rounded-tl-lg transition-all duration-200 border-2 cursor-pointer ${
              !isAmountToTime
                ? "bg-blue-400 text-white border-blue-400"
                : "bg-white text-blue-500 border-blue-400 hover:bg-blue-400 hover:text-white"
            }`}
          >
            Select repayment time
          </button>
          <button
            onClick={() => {
              if (!isAmountToTime) {
                setIsAmountToTime(true);
                // Clear previous inputs and results when switching mode
                setInputTime(null);
                setInputAmount(null);
                setCalculatedTime("");
                setCalculatedAmount("");
              }
            }}
            className={`w-full text-lg font-semibold p-3 rounded-br-lg rounded-tr-lg transition-all duration-200 border-2 cursor-pointer ${
              isAmountToTime
                ? "bg-blue-400 text-white border-blue-400"
                : "bg-white text-blue-500 border-blue-400 hover:bg-blue-400 hover:text-white"
            }`}
          >
            Input amount
          </button>
        </div>

        {!isAmountToTime ? (
          // When selecting repayment time to calculate amount
          <div>
            <label className="block text-gray-700 mb-2">
              Please select repayment time
            </label>
            <select
              value={inputTime ?? ""}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg mb-2"
            >
              <option value="" disabled>
                Select repayment time (months)
              </option>
              {[1, 3, 6, 9, 12, 18, 24].map((m) => (
                <option key={m} value={m}>
                  {m} month{m > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            {/* Display calculated amount */}
            {inputTime && (
              <p className="text-gray-700 mt-2">
                The corresponding calculated amount:{" "}
                <strong>${calculatedAmount}</strong>
              </p>
            )}
          </div>
        ) : (
          // When inputting amount to calculate repayment time
          <div>
            <label className="block text-gray-700 mb-2">
              Please input lending amount
            </label>
            <input
              type="number"
              min="0"
              placeholder="Input amount"
              value={inputAmount ?? ""}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg mb-2"
            />
            <p className="text-gray-700 mt-2">
              {!inputAmount || inputAmount == 0 ? (
                "Please enter an amount"
              ) : parseInt(calculatedTime) > 24 ? (
                "Amount is too low. Please add more funds."
              ) : (
                <>
                  Calculated repayment time:{" "}
                  <strong>
                    {calculatedTime}{" "}
                    {calculatedTime === "1" ? "month" : "months"}
                  </strong>
                </>
              )}
            </p>
          </div>
        )}

        <hr className="my-4" />

        {/* Checkout button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          className={`mt-4 w-full text-lg font-semibold p-3 rounded-lg transition-all duration-200 border-2 ${
            isLoading
              ? "bg-gray-400 text-blue-50 cursor-not-allowed border-gray-400"
              : "text-blue-500 bg-transparent border-blue-400 hover:bg-blue-400 hover:text-white cursor-pointer"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              {/* Tailwind CSS Spinner */}
              <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            "Check Out"
          )}
        </button>
      </div>
    </div>
  );
}
