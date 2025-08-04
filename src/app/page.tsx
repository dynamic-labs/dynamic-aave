"use client";

import { MarketsInterface } from "@/components/MarketsInterface";
import { DynamicWidget } from "@/lib/dynamic";
import Image from "next/image";

export default function Main() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-100 text-gray-800">
      <div className="absolute top-0 flex items-center justify-between w-full p-4 border-b border-gray-200 dark:border-gray-700">
        <Image
          className="h-8 pl-4 object-contain"
          src="/logo-dark.png"
          alt="dynamic"
          width="300"
          height="60"
        />
        <div className="flex gap-3 pr-4">
          <DynamicWidget />

          <button
            className="px-5 py-2.5 rounded-xl border font-bold transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${
              isDarkMode 
                ? 'border-white text-white' 
                : 'border-gray-800 text-gray-800'
            }"
            onClick={() =>
              window.open(
                "https://docs.dynamic.xyz",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Docs
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold transition-colors duration-300 hover:bg-blue-700"
            onClick={() =>
              window.open(
                "https://app.dynamic.xyz",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Get started
          </button>
        </div>
      </div>

      <MarketsInterface />
    </div>
  );
}
