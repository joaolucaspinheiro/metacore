"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, type Locale } from "./dictionaries";

const STORAGE_KEY = "metacore-locale";

type Namespace = keyof typeof dictionaries.pt;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored);
    } else if (!navigator.language.toLowerCase().startsWith("pt")) {
      setLocaleState("en");
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

export function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replaceAll(`{{${key}}}`, String(val)),
    str
  );
}

export function useT<N extends Namespace>(namespace: N) {
  const { locale } = useLocale();
  return useCallback(
    (key: keyof typeof dictionaries.pt[N], vars?: Record<string, string | number>) =>
      interpolate(dictionaries[locale][namespace][key] as string, vars),
    [locale, namespace]
  );
}

export type { Namespace };
