"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { ConnectButton } from '@mysten/dapp-kit';
/** 隐藏地址显示，例如 0x1234...abcd */
export function shortenAddress(address: string) {
  if (!address) return "";
  return address.slice(0, 7) + "..." + address.slice(-5);
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  useEffect(() => {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("jwt");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("walletChanged"));
    }
  }, []);

  return (
    <>
      <Toaster />
      {/* 主导航栏 */}
      <nav className="grotesk fixed top-0 left-0 w-full flex items-center justify-between mb-6 px-4 py-3 md:px-6 lg:py-4 border-b border-b-gray-400 bg-white z-50 upper">
        {/* 左侧 Logo 和导航链接 */}
        <div className="flex items-center space-x-8 ml-4">
          <Link
            href="/"
            className="flex items-center text-xl md:text-3xl font-bold text-black uppercase"
          >
            <Image
              src="/images/logo2.svg"
              width={100}
              height={82}
              alt="Tabfi"
              className="hidden lg:inline-flex"
            />
            <p className="mt-1">Tabfi</p>
          </Link>
        </div>
        {/* 右侧：钱包按钮与移动端菜单图标 */}
        <div className="flex items-center space-x-8">
          <div className="hidden lg:inline-flex">
            <Link
              href="/enroll"
              className="text-xl text-black hover:underline hover:text-blue-400"
            >
              Enroll
            </Link>
          </div>
          <div className="hidden lg:inline-flex">
            <Link
              href="/dashboard"
              className="text-xl text-black hover:underline hover:text-blue-400"
            >
              Merchant
            </Link>
          </div>
          <div className="hidden lg:inline-flex">
            <Link
              href="/consumer"
              className="text-xl text-black hover:underline hover:text-blue-400"
            >
              Use Case
            </Link>
          </div>
          <div className="lg:inline-flex">
            <ConnectButton />
          </div>
          

          {/* 移动端菜单图标 */}
          <div className="lg:hidden ml-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <svg
                  className="text-black"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="text-black"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端菜单：仅在小屏幕且菜单展开时显示 */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-30 md:top-25 left-0 w-full bg-white shadow-md z-40">
          <div className="flex flex-col items-center space-y-4 py-4">
            <Link
              href="/enroll"
              className="text-xl text-black hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Enroll
            </Link>
          </div>
          <div className="flex flex-col items-center space-y-4 py-4">
            <Link
              href="/dashboard"
              className="text-xl text-black hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Merchant
            </Link>
          </div>
          <div className="flex flex-col items-center space-y-4 py-4">
            <Link
              href="/consumer"
              className="text-xl text-black hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Use Case
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
