"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, Pencil } from "lucide-react";
import { SpriteImg } from "@/components/pokemon/atoms";
import { NicknameModal } from "@/components/team/NicknameModal";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { updateNickname } from "@/server/actions/user-actions";
import { useT } from "@/lib/i18n/context";

export function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const t = useT("header");

  const navLinks = [
    { href: "/team-finder", label: t("teamFinder") },
    { href: "/builder", label: t("teamBuilder") },
  ];

  const user = session?.user as { name?: string | null; nickname?: string | null } | undefined;
  const displayName = user?.nickname || user?.name;

  async function handleConfirmNickname(nickname: string) {
    await updateNickname(nickname);
    await update({ nickname });
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-emerald-500/10 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors overflow-hidden">
            <SpriteImg name="Metagross" size={28} />
          </div>
          <span className="font-rajdhani text-xl font-bold text-white tracking-wide">
            MetaCore
          </span>
        </Link>

        {pathname !== "/" && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith(link.href)
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {status === "authenticated" ? (
            <>
              <Link href="/my-teams" className="text-zinc-400 hover:text-zinc-200 text-sm hidden sm:block">
                {t("myTeams")}
              </Link>
              <button
                onClick={() => setShowNicknameModal(true)}
                className="flex items-center gap-1.5 text-zinc-300 text-sm hidden sm:flex hover:text-white transition-colors group"
                title={t("editNickname")}
              >
                {displayName}
                <Pencil className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
              >
                {t("signOut")}
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">{t("signInGoogle")}</span>
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </div>

      <NicknameModal
        open={showNicknameModal}
        initialNickname={displayName ?? ""}
        onClose={() => setShowNicknameModal(false)}
        onConfirm={handleConfirmNickname}
      />
    </header>
  );
}
