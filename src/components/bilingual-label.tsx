"use client";

import { useBilingual } from "./bilingual-provider";
import { getTeReo } from "@/lib/te-reo";

interface BilingualLabelProps {
  children: string;
  className?: string;
  subtitleClassName?: string;
}

export function BilingualLabel({ children, className, subtitleClassName }: BilingualLabelProps) {
  const { teReoEnabled } = useBilingual();
  const maori = getTeReo(children);

  return (
    <span className={className}>
      {children}
      {teReoEnabled && maori && (
        <span className={subtitleClassName || "block text-[10px] opacity-60 font-normal leading-tight"}>
          {maori}
        </span>
      )}
    </span>
  );
}
