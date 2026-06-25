"use client";

import { useT, type Namespace } from "@/lib/i18n/context";
import { dictionaries } from "@/lib/i18n/dictionaries";

export function T<N extends Namespace>({
  ns,
  k,
  vars,
}: {
  ns: N;
  k: keyof typeof dictionaries.pt[N];
  vars?: Record<string, string | number>;
}) {
  const t = useT(ns);
  return <>{t(k, vars)}</>;
}
