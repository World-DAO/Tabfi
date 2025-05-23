import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  return Math.floor(futureDate.getTime() / 1000);
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

export const getBCS = (data: any)=>{
  
}