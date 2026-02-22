"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getTeReo } from "@/lib/te-reo";

interface BilingualContextType {
  teReoEnabled: boolean;
  toggleTeReo: () => void;
  t: (english: string) => string;
}

const BilingualContext = createContext<BilingualContextType>({
  teReoEnabled: false,
  toggleTeReo: () => {},
  t: (english: string) => english,
});

export function BilingualProvider({ children }: { children: React.ReactNode }) {
  const [teReoEnabled, setTeReoEnabled] = useState(false);

  const toggleTeReo = useCallback(() => {
    setTeReoEnabled((prev) => !prev);
  }, []);

  const t = useCallback(
    (english: string) => {
      if (!teReoEnabled) return english;
      const maori = getTeReo(english);
      return maori || english;
    },
    [teReoEnabled]
  );

  return (
    <BilingualContext.Provider value={{ teReoEnabled, toggleTeReo, t }}>
      {children}
    </BilingualContext.Provider>
  );
}

export function useBilingual() {
  return useContext(BilingualContext);
}
