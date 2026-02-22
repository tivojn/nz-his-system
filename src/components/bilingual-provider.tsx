"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getTeReo, getZhCN } from "@/lib/te-reo";

export type Language = "en" | "cn" | "mi";

interface BilingualContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  teReoEnabled: boolean;
  toggleTeReo: () => void;
  t: (english: string) => string;
}

const BilingualContext = createContext<BilingualContextType>({
  language: "en",
  setLanguage: () => {},
  teReoEnabled: false,
  toggleTeReo: () => {},
  t: (english: string) => english,
});

export function BilingualProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("cn");

  const teReoEnabled = language === "mi";

  const toggleTeReo = useCallback(() => {
    setLanguage((prev) => {
      if (prev === "en") return "cn";
      if (prev === "cn") return "mi";
      return "en";
    });
  }, []);

  const t = useCallback(
    (english: string) => {
      if (language === "cn") {
        return getZhCN(english) || english;
      }
      if (language === "mi") {
        return getTeReo(english) || english;
      }
      return english;
    },
    [language]
  );

  return (
    <BilingualContext.Provider value={{ language, setLanguage, teReoEnabled, toggleTeReo, t }}>
      {children}
    </BilingualContext.Provider>
  );
}

export function useBilingual() {
  return useContext(BilingualContext);
}
