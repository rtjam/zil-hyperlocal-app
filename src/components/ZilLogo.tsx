"use client";

import React from "react";

interface ZilLogoProps {
  onClickBell?: () => void;
  size?: "sm" | "md";
}

export function ZilLogo({ onClickBell, size = "sm" }: ZilLogoProps) {
  return (
    <button
      type="button"
      onClick={onClickBell}
      title="ZiL — Ding-Dong!"
      className="group inline-flex items-center gap-1.5 select-none focus:outline-none active:scale-95 transition-transform"
    >
      {/* Minimalist Tactile Doorbell Icon */}
      <span
        className={`relative flex items-center justify-center rounded-xl bg-bosporus shadow-2xs ${
          size === "sm" ? "h-7 w-7" : "h-8 w-8"
        }`}
      >
        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-md bg-[#FAF8F5]">
          <span className="h-2.5 w-2.5 rounded-full bg-amberbell shadow-[0_0_6px_#F59E0B]" />
        </span>
      </span>

      {/* Wordmark ZiL */}
      <span className="inline-flex items-baseline font-black tracking-tight text-bosporus text-lg leading-none">
        <span>Z</span>
        <span className="relative mx-[1px] inline-flex flex-col items-center">
          <span className="h-1.5 w-1.5 rounded-full bg-amberbell mb-[1.5px]" />
          <span className="h-2.5 w-[3.5px] rounded-full bg-bosporus" />
        </span>
        <span>L</span>
      </span>
    </button>
  );
}
