// @ts-nocheck
import { bcs } from "@mysten/sui/bcs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { gqlClient } from "./query";
import { queryCoin } from "./query";
import { TIME_PACKAGE_ID } from "@/data/SuiConfig";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTime = (month: number) => {
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + month,
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds()
  );
  return Math.floor(futureDate.getTime());
}

export const getPayMonth = (time: number) => {
  const currentDate = new Date();
  const futureDate = new Date(time);
  const yearDiff = futureDate.getFullYear() - currentDate.getFullYear();
  const monthDiff = futureDate.getMonth() - currentDate.getMonth();
  
  return yearDiff * 12 + monthDiff;
}

export const getPayTime = (month: number, currentTime: string) => {
  try {
    // 解析日期字符串
    const parts = currentTime.split(' '); // 分割日期和时间
    if (parts.length !== 2) return `${month} 个月后`;
    
    const dateParts = parts[0].split('/'); // 分割年月日
    if (dateParts.length !== 3) return `${month} 个月后`;
    
    // 提取年月日
    const year = parseInt(dateParts[0]);
    const originalMonth = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    
    // 计算新的月份和年份
    let newMonth = originalMonth + month;
    let newYear = year;
    
    // 处理月份溢出
    while (newMonth > 12) {
      newMonth -= 12;
      newYear += 1;
    }
    
    // 格式化回原始格式
    return `${newYear}/${newMonth}/${day} ${parts[1]}`;
  } catch (error) {
    console.error("日期转换错误:", error);
    return `${month} 个月后`;
  }
}

export const getMap = (data: any)=>{
  const addressValueMap = new Map<string, string>();
  data.forEach((item: any) => {
    const address = item.name.json.addr;
    const value = item.value.json;
    addressValueMap.set(address, value);
  });
  
  return addressValueMap;
}

export const getAddressBCS = (address: string)=>{
  const add = bcs.Address.serialize(address).toBytes();
  const base = Buffer.from(add).toString('base64');
  return base;
}

export const getAllCoins = async (address: string)=>{
  const coins = await gqlClient.query({
    query: queryCoin,
    variables: {
      address: address,
      coinType: `${TIME_PACKAGE_ID}::usdv::USDV`
    }
  })
  return coins.data?.address.coins.nodes;
}