"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Match, BracketPlayer } from "@/types";

const countryFlags: Record<string, string> = {
  RU: "🇷🇺", US: "🇺🇸", DE: "🇩🇪", JP: "🇯🇵", GB: "🇬🇧",
  FR: "🇫🇷", CN: "🇨🇳", IT: "🇮🇹", SE: "🇸🇪", IL: "🇮🇱",
};



interface Vec2 { x: number; y: number; }
interface LinePoints { x1: number; y1: number; x2: number; y2: number; }
interface Props { matches: Match[]; }

function TBDCard() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/40 border border-dashed border-border">
      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
        <span className="text-xs text-primary/20 font-bold">?</span>
      </div>
      <span className="text-sm font-medium text-primary/20">TBD</span>
    </div>
  );
}

function PlayerCard({ player }: { player: BracketPlayer | null }) {
  if (!player) return <TBDCard />;

  const isWon = player.status === "won";
  const isEliminated = player.status === "eliminated";
  const isPlaying = player.status === "playing";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isEliminated ? 0.45 : 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300
        ${isWon
          ? "border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg shadow-amber-200/40"
          : isPlaying
            ? "border-blue-300 bg-gradient-to-r from-blue-50 to-sky-50 shadow-md shadow-blue-200/30"
            : isEliminated
              ? "border-slate-200 bg-white/50"
              : "border-border bg-white hover:border-secondary/30 hover:shadow-md"
        }`}
    >
      <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0
        ${isWon ? "bg-accent shadow-md shadow-amber-200/50" : isPlaying ? "bg-blue-500" : isEliminated ? "bg-slate-300" : "bg-primary/60"}`}
      >
        {isWon ? "🏆" : player.name.charAt(0).toUpperCase()}
        {isPlaying && <span className="absolute -inset-0.5 rounded-full border-2 border-blue-300 animate-ping opacity-30" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-sm font-bold truncate ${isWon ? "text-amber-800" : isEliminated ? "text-slate-400" : "text-primary"}`}>
            {player.name}
          </span>
          <span className="text-base shrink-0">{countryFlags[player.country] ?? ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-primary/40 flex items-center gap-1">
            {player.vehicleType === "air" ? "✈" : "⬡"} Tier {player.vehicleTier}
          </span>
        </div>
      </div>
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0
        ${isWon ? "bg-amber-100 text-amber-700"
        : isPlaying ? "bg-blue-100 text-blue-700"
        : isEliminated ? "bg-slate-100 text-slate-400"
        : "bg-emerald-100 text-emerald-700"}`}
      >
        {player.status === "ready" ? "Ready" : player.status.charAt(0).toUpperCase() + player.status.slice(1)}
      </span>
    </motion.div>
  );
}

function MatchBlock({ match }: { match: Match }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: match.position * 0.05 }}
      className="flex flex-col w-full"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold text-primary/40">Match #{match.matchNumber}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
          ${match.status === "Live" || match.status === "Playing" ? "bg-red-50 text-red-600"
          : match.status === "Ready" ? "bg-emerald-50 text-emerald-600"
          : match.status === "Completed" ? "bg-slate-100 text-slate-500"
          : "bg-slate-50 text-slate-400"}`}
        >
          {match.status}
        </span>
      </div>
      <PlayerCard player={match.player1} />
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-border/70" />
        <span className="text-xs font-bold text-primary/25 uppercase tracking-widest shrink-0">VS</span>
        <div className="flex-1 h-px bg-border/70" />
      </div>
      <PlayerCard player={match.player2} />
      <div className="mt-1.5 text-center">
        <span className="text-[10px] font-medium text-primary/25">{match.scheduledTime}</span>
      </div>
    </motion.div>
  );
}

function ChampionCard({ player }: { player: BracketPlayer | null }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-[11px] font-bold text-accent uppercase tracking-[0.15em] mb-4">Champion</div>
      {!player ? (
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/60 border-2 border-dashed border-accent/30 rounded-2xl p-6 text-center min-w-[160px]">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-sm text-primary/30 font-medium">TBD</div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-accent/15 rounded-2xl blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-2 border-accent/40 rounded-2xl p-7 shadow-2xl shadow-accent/20 min-w-[180px] text-center">
            <div className="text-4xl mb-3">🏆</div>
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-2">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="block text-base font-bold text-primary">{player.name}</span>
            <span className="text-xl mt-1">{countryFlags[player.country] ?? ""}</span>
            <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 mt-2">
              {player.vehicleType === "air" ? "✈ Air" : "⬡ Ground"} Tier {player.vehicleTier}
            </span>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-t-2xl" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ConnectorSVG({ lines }: { lines: LinePoints[] }) {
  return (
    <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

export default function BracketView({ matches }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<LinePoints[]>([]);

  const fMatch = matches.find((m) => m.round === "F");
  const champion: BracketPlayer | null =
    fMatch?.winner
      ? matches.flatMap((m) => [m.player1, m.player2]).find((p) => p?.name === fMatch.winner) ?? null
      : fMatch?.player1?.status === "won" ? fMatch.player1
      : fMatch?.player2?.status === "won" ? fMatch.player2
      : null;

  const qfMatches = matches.filter((m) => m.round === "QF").sort((a, b) => a.position - b.position);
  const sfMatches = matches.filter((m) => m.round === "SF").sort((a, b) => a.position - b.position);
  const fMatches = matches.filter((m) => m.round === "F");

  const setCellRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) cellRefs.current.set(key, el);
    else cellRefs.current.delete(key);
  }, []);

  const drawLines = useCallback(() => {
    if (!gridRef.current) return;
    const gr = gridRef.current.getBoundingClientRect();
    const newLines: LinePoints[] = [];
    const mid = (a: number, b: number) => (a + b) / 2;
    const getC = (key: string): Vec2 | null => {
      const el = cellRefs.current.get(key);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: mid(r.left, r.right), y: mid(r.top, r.bottom) };
    };

    for (let i = 0; i < 4; i += 2) {
      const top = getC(`QF-${i + 1}`);
      const bot = getC(`QF-${i + 2}`);
      const sf = getC(`SF-${i / 2 + 1}`);
      if (top && sf) {
        const mx = mid(top.x, sf.x);
        newLines.push({ x1: top.x - gr.left, y1: top.y - gr.top, x2: mx - gr.left, y2: top.y - gr.top });
        newLines.push({ x1: mx - gr.left, y1: top.y - gr.top, x2: mx - gr.left, y2: sf.y - gr.top });
        newLines.push({ x1: mx - gr.left, y1: sf.y - gr.top, x2: sf.x - gr.left, y2: sf.y - gr.top });
      }
      if (bot && sf) {
        const mx = mid(bot.x, sf.x);
        newLines.push({ x1: bot.x - gr.left, y1: bot.y - gr.top, x2: mx - gr.left, y2: bot.y - gr.top });
        newLines.push({ x1: mx - gr.left, y1: bot.y - gr.top, x2: mx - gr.left, y2: sf.y - gr.top });
        newLines.push({ x1: mx - gr.left, y1: sf.y - gr.top, x2: sf.x - gr.left, y2: sf.y - gr.top });
      }
    }

    const f = getC("F-1");
    for (let i = 0; i < 2; i++) {
      const sf = getC(`SF-${i + 1}`);
      if (sf && f) {
        const mx = mid(sf.x, f.x);
        newLines.push({ x1: sf.x - gr.left, y1: sf.y - gr.top, x2: mx - gr.left, y2: sf.y - gr.top });
        newLines.push({ x1: mx - gr.left, y1: sf.y - gr.top, x2: mx - gr.left, y2: f.y - gr.top });
        newLines.push({ x1: mx - gr.left, y1: f.y - gr.top, x2: f.x - gr.left, y2: f.y - gr.top });
      }
    }

    setLines(newLines);
  }, []);

  useEffect(() => {
    requestAnimationFrame(drawLines);
    const observer = new ResizeObserver(drawLines);
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [drawLines]);

  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-[900px] mx-auto">
        <div ref={gridRef} className="relative" style={{ minHeight: 680 }}>
          <ConnectorSVG lines={lines} />

          <div className="grid grid-cols-[1fr_40px_1fr_40px_1fr_40px_0.65fr] grid-rows-8 h-full">

            {/* ROUND LABELS - span across all columns */}
            <div className="col-span-7 row-span-1 grid grid-cols-subgrid mb-2">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>

            {/* QF Column */}
            {[0, 1, 2, 3].map((i) => (
              <div key={`QF-${i + 1}`} className="col-start-1 row-start-${i * 2 + 2} row-span-2 flex items-center z-10 pr-2">
                <div ref={(el) => setCellRef(`QF-${i + 1}`, el)} className="w-full">
                  {qfMatches[i] && <MatchBlock match={qfMatches[i]} />}
                </div>
              </div>
            ))}

            {/* QF → SF connector column (col 2) */}
            <div className="col-start-2 row-span-8" />

            {/* SF Column */}
            <div className="col-start-3 row-start-2 row-span-4 flex items-center z-10 px-2">
              <div ref={(el) => setCellRef("SF-1", el)} className="w-full">
                {sfMatches[0] && <MatchBlock match={sfMatches[0]} />}
              </div>
            </div>
            <div className="col-start-3 row-start-6 row-span-4 flex items-center z-10 px-2">
              <div ref={(el) => setCellRef("SF-2", el)} className="w-full">
                {sfMatches[1] && <MatchBlock match={sfMatches[1]} />}
              </div>
            </div>

            {/* SF → F connector column (col 4) */}
            <div className="col-start-4 row-span-8" />

            {/* F Column */}
            <div className="col-start-5 row-start-2 row-span-8 flex items-center z-10 px-2">
              <div ref={(el) => setCellRef("F-1", el)} className="w-full">
                {fMatches[0] && <MatchBlock match={fMatches[0]} />}
              </div>
            </div>

            {/* F → Champion connector column (col 6) */}
            <div className="col-start-6 row-span-8" />

            {/* Champion Column */}
            <div className="col-start-7 row-span-8 flex items-center z-10 pl-3">
              <ChampionCard player={champion} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
