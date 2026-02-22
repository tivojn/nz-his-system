"use client";

import { useBilingual } from "./bilingual-provider";
import { getTeReo, getZhCN } from "@/lib/te-reo";

interface BilingualLabelProps {
  children: string;
  className?: string;
  subtitleClassName?: string;
}

export function BilingualLabel({ children, className, subtitleClassName }: BilingualLabelProps) {
  const { language } = useBilingual();

  const subtitle =
    language === "cn"
      ? getZhCN(children)
      : language === "mi"
        ? getTeReo(children)
        : undefined;

  return (
    <span className={className}>
      {children}
      {subtitle && (
        <span className={subtitleClassName || "block text-[10px] opacity-60 font-normal leading-tight"}>
          {subtitle}
        </span>
      )}
    </span>
  );
}
