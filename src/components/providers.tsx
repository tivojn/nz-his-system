"use client";

import { BilingualProvider } from "./bilingual-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BilingualProvider>
      {children}
    </BilingualProvider>
  );
}
