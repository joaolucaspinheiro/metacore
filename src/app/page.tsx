import Link from "next/link";
import { ArrowRight, Shield, Star, TrendingUp } from "lucide-react";
import { getMetaSnapshot } from "@/lib/meta/loader";
import { getTier, getTypes } from "@/lib/pokedex";
import { SpriteImg, TierBadge, TypeBadge } from "@/components/pokemon/atoms";

function regulationLabel(format: string): string {
  const match = format.match(/reg([a-z]+)$/i);
  if (!match) return format;
  const code = match[1];
  return code.length === 2
    ? `Reg ${code[0].toUpperCase()}-${code[1].toUpperCase()}`
    : `Reg ${code.toUpperCase()}`;
}

export default function Home() {
  const snapshot = getMetaSnapshot();
  const top3 = Object.values(snapshot.pokemon)
    .sort((a, b) => b.usagePercent - a.usagePercent)
    .slice(0, 3);

  const stats = [
    { value: `${Object.keys(snapshot.pokemon).length}`, label: "Pokémon analisados" },
    { value: `${(snapshot.totalBattles / 1_000_000).toFixed(1)}M`, label: "Batalhas analisadas" },
    { value: regulationLabel(snapshot.format), label: "Formato atual" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden pt-16">
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-4rem)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-medium mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Pokémon Champions VGC · {snapshot.sourceMonth}
          </div>

          <h1
            className="font-rajdhani font-bold leading-none tracking-tight mb-6 text-white flex items-center gap-4"
            style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
          >
            <span className="relative shrink-0 w-[0.9em] h-[0.9em] rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
              <SpriteImg name="Metagross" size={64} />
            </span>
            <span>
              Meta<span className="text-emerald-400">Core</span>
            </span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-10">
            Você já tem alguns Pokémon, mas não sabe fechar o time. Cruzamos seus Pokémon com{" "}
            <span className="text-zinc-200">dados reais de uso competitivo</span> e sugerimos os melhores
            parceiros para o seu time VGC.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Link
              href="/team-finder"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base rounded-xl transition-all hover:shadow-[0_8px_32px_rgba(16,185,129,0.35)] active:scale-95"
            >
              Encontrar meu time <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-mono font-bold text-2xl text-emerald-400">{s.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5 font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-3 items-stretch">
          {top3.map((p, i) => {
            const types = getTypes(p.name);
            const tier = getTier(p.usagePercent);
            return (
              <div
                key={p.name}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300"
                style={{
                  marginLeft: `${i * 20}px`,
                  opacity: 1 - i * 0.1,
                  borderColor: i === 0 ? "rgba(16,185,129,0.3)" : undefined,
                  boxShadow: i === 0 ? "0 0 24px rgba(16,185,129,0.08)" : undefined,
                }}
              >
                <div className="w-20 h-20 bg-zinc-800/80 rounded-xl flex items-center justify-center shrink-0">
                  <SpriteImg name={p.name} size={72} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TierBadge tier={tier} />
                    <span className="text-white font-semibold">{p.name}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                  <div className="text-zinc-500 text-xs font-mono">
                    Meta usage: <span className="text-emerald-400 font-bold">{p.usagePercent}%</span>
                  </div>
                </div>
                {i === 0 && (
                  <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
                    TOP META
                  </div>
                )}
              </div>
            );
          })}
          <div className="text-zinc-600 text-xs font-mono ml-5 mt-1">
            Fonte: dados públicos de uso do Pokémon Showdown/Smogon
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              Icon: TrendingUp,
              title: "Dados reais de meta",
              desc: "Baseado em dados públicos de uso do Pokémon Showdown/Smogon — não achismo.",
            },
            {
              Icon: Shield,
              title: "Combinações reais",
              desc: "Sugerimos parceiros com base em quão frequente cada dupla aparece em times de verdade.",
            },
            {
              Icon: Star,
              title: "Team Builder completo",
              desc: "Habilidade, item, Tera Type, golpes e EVs em um só lugar.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <f.Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-zinc-200 font-semibold text-sm mb-1">{f.title}</div>
                <div className="text-zinc-500 text-xs leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
