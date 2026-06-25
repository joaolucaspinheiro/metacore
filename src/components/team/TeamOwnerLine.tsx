"use client";

import { useT } from "@/lib/i18n/context";

export function TeamOwnerLine({ ownerName }: { ownerName: string | null }) {
  const t = useT("teamPage");
  return (
    <p className="text-zinc-500 text-sm">
      {t("createdBy")} <span className="text-zinc-300">{ownerName || t("defaultOwnerName")}</span>
    </p>
  );
}
