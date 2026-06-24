import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "82-0 Challenge: Full Rotation Edition" },
      { name: "description", content: "Manage a complete 10-minute rotation and chase the perfect 82-0 NBA season in this fast browser basketball sim." },
      { property: "og:title", content: "82-0 Challenge: Full Rotation Edition" },
      { property: "og:description", content: "Build the perfect rotation. Keep your stars fresh. Go undefeated." },
    ],
  }),
  component: Game,
});

// ---------- Types ----------
type Pos = "PG" | "SG" | "SF" | "PF" | "C";
type Player = {
  id: string;
  name: string;
  pos: Pos;
  rating: number; // 60-99
  stamina: number; // 0-100
  // game stats
  pts: number;
  reb: number;
  ast: number;
  minPlayed: number; // seconds in current game
  // season totals
  sPts: number;
  sReb: number;
  sAst: number;
  sGames: number;
};

type GameLogEntry = { t: number; text: string; tone: "us" | "them" | "sub" | "info" };
type SeasonGame = { n: number; opp: string; us: number; them: number; win: boolean };

// ---------- Roster ----------
const ROSTER_SEED: Omit<Player, "stamina" | "pts" | "reb" | "ast" | "minPlayed" | "sPts" | "sReb" | "sAst" | "sGames">[] = [
  { id: "p1", name: "M. Castillo", pos: "PG", rating: 94 },
  { id: "p2", name: "J. Reeves", pos: "SG", rating: 91 },
  { id: "p3", name: "D. Okafor", pos: "SF", rating: 93 },
  { id: "p4", name: "T. Brennan", pos: "PF", rating: 89 },
  { id: "p5", name: "K. Volkov", pos: "C", rating: 92 },
  { id: "p6", name: "A. Nakamura", pos: "PG", rating: 82 },
  { id: "p7", name: "R. Diallo", pos: "SG", rating: 84 },
  { id: "p8", name: "C. Holloway", pos: "SF", rating: 81 },
  { id: "p9", name: "S. Petrov", pos: "PF", rating: 80 },
  { id: "p10", name: "B. Mensah", pos: "C", rating: 79 },
];

const OPPONENTS = [
  "Phoenix", "Boston", "Denver", "Miami", "Dallas", "Memphis", "Brooklyn",
  "Chicago", "Atlanta", "Toronto", "Seattle", "Portland", "Orlando", "Detroit",
  "Houston", "Cleveland", "Sacramento", "Minnesota", "Charlotte", "Utah",
];

const GAME_LEN = 600; // 10 minute game = 600s of game-clock; we tick every 1s sim
const TICK_MS = 80; // wall-clock per simulated second
const SUB_AUTO_THRESHOLD = 30; // stamina

function freshPlayer(p: typeof ROSTER_SEED[number]): Player {
  return { ...p, stamina: 100, pts: 0, reb: 0, ast: 0, minPlayed: 0, sPts: 0, sReb: 0, sAst: 0, sGames: 0 };
}

function fmtClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Game() {
  const [roster, setRoster] = useState<Player[]>(() => ROSTER_SEED.map(freshPlayer));
  const [onCourt, setOnCourt] = useState<string[]>(() => ROSTER_SEED.slice(0, 5).map(p => p.id));
  const [clock, setClock] = useState(GAME_LEN);
  const [us, setUs] = useState(0);
  const [them, setThem] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x 2x 4x
  const [log, setLog] = useState<GameLogEntry[]>([]);
  const [season, setSeason] = useState<SeasonGame[]>([]);
  const [gameNum, setGameNum] = useState(1);
  const [opp, setOpp] = useState(OPPONENTS[0]);
  const [oppRating, setOppRating] = useState(85);
  const [gameOver, setGameOver] = useState(false);
  const [autoSub, setAutoSub] = useState(true);
  const [showRoster, setShowRoster] = useState(false);

  const stateRef = useRef({ roster, onCourt, clock, us, them });
  stateRef.current = { roster, onCourt, clock, us, them };

  const wins = season.filter(g => g.win).length;
  const losses = season.length - wins;
  const streakBroken = losses > 0;

  const courtPlayers = useMemo(
    () => onCourt.map(id => roster.find(p => p.id === id)!).filter(Boolean),
    [onCourt, roster]
  );
  const bench = useMemo(
    () => roster.filter(p => !onCourt.includes(p.id)),
    [onCourt, roster]
  );

  const addLog = useCallback((entry: Omit<GameLogEntry, "t">) => {
    setLog(l => [{ ...entry, t: Date.now() }, ...l].slice(0, 60));
  }, []);

  // Substitution
  const sub = useCallback((outId: string, inId: string) => {
    setOnCourt(curr => curr.map(id => (id === outId ? inId : id)));
    const o = stateRef.current.roster.find(p => p.id === outId);
    const i = stateRef.current.roster.find(p => p.id === inId);
    if (o && i) addLog({ tone: "sub", text: `SUB: ${i.name} in for ${o.name}` });
  }, [addLog]);

  // Auto sub logic — when a player drops below threshold, swap with freshest bench player at any position
  const tryAutoSub = useCallback(() => {
    if (!autoSub) return;
    const { roster: r, onCourt: oc } = stateRef.current;
    const tired = oc
      .map(id => r.find(p => p.id === id)!)
      .filter(p => p.stamina < SUB_AUTO_THRESHOLD)
      .sort((a, b) => a.stamina - b.stamina);
    if (!tired.length) return;
    const benchSorted = r.filter(p => !oc.includes(p.id)).sort((a, b) => b.stamina - a.stamina);
    let benchIdx = 0;
    let newOC = [...oc];
    for (const t of tired) {
      // find fresh bench player, prefer same position
      const samePos = benchSorted.find((b, i) => b.pos === t.pos && b.stamina > 60 && !newOC.includes(b.id));
      const pick = samePos ?? benchSorted.find((b, i) => b.stamina > 60 && !newOC.includes(b.id));
      if (pick) {
        newOC = newOC.map(id => (id === t.id ? pick.id : id));
        addLog({ tone: "sub", text: `AUTO SUB: ${pick.name} in for ${t.name}` });
        benchIdx++;
      }
    }
    if (benchIdx > 0) setOnCourt(newOC);
  }, [autoSub, addLog]);

  // Tick simulation
  useEffect(() => {
    if (!running || gameOver) return;
    const iv = setInterval(() => {
      setClock(c => {
        const next = c - 1;
        // Each sim tick: update stamina, score events
        setRoster(curr => {
          const onSet = new Set(stateRef.current.onCourt);
          return curr.map(p => {
            if (onSet.has(p.id)) {
              return { ...p, stamina: Math.max(0, p.stamina - (0.35 + (100 - p.rating) * 0.01)), minPlayed: p.minPlayed + 1 };
            }
            // bench recovers
            return { ...p, stamina: Math.min(100, p.stamina + 0.5) };
          });
        });

        // Possession events every ~6s
        if (next % 6 === 0 && next > 0) {
          const { roster: r, onCourt: oc } = stateRef.current;
          const onPlayers = oc.map(id => r.find(p => p.id === id)!).filter(Boolean);
          if (onPlayers.length) {
            const teamPower = onPlayers.reduce((s, p) => s + p.rating * (0.5 + p.stamina / 200), 0) / onPlayers.length;
            const usEdge = teamPower - oppRating;
            // Our possession
            const makeProb = Math.max(0.32, Math.min(0.72, 0.5 + usEdge * 0.012));
            if (Math.random() < makeProb) {
              const scorer = weightedPick(onPlayers, p => p.rating * (0.5 + p.stamina / 200));
              const three = Math.random() < 0.36;
              const pts = three ? 3 : 2;
              const assister = Math.random() < 0.55
                ? weightedPick(onPlayers.filter(p => p.id !== scorer.id), p => (p.pos === "PG" ? 3 : 1))
                : null;
              setRoster(curr => curr.map(p => {
                if (p.id === scorer.id) return { ...p, pts: p.pts + pts };
                if (assister && p.id === assister.id) return { ...p, ast: p.ast + 1 };
                return p;
              }));
              setUs(v => v + pts);
              addLog({ tone: "us", text: `${scorer.name} ${three ? "drains a three" : "scores"}${assister ? ` (ast: ${assister.name})` : ""}` });
            } else {
              // missed — rebound
              const rebounder = weightedPick(onPlayers, p => (p.pos === "C" || p.pos === "PF" ? 3 : 1));
              setRoster(curr => curr.map(p => p.id === rebounder.id ? { ...p, reb: p.reb + 1 } : p));
            }
            // Opponent possession
            const oppMake = Math.max(0.3, Math.min(0.62, 0.46 - usEdge * 0.01));
            if (Math.random() < oppMake) {
              const oppThree = Math.random() < 0.32;
              const oppPts = oppThree ? 3 : 2;
              setThem(v => v + oppPts);
              addLog({ tone: "them", text: `${opp} ${oppThree ? "hits a 3" : "scores"} (+${oppPts})` });
            }
          }
        }

        if (next % 5 === 0) tryAutoSub();

        if (next <= 0) {
          // End of game
          setRunning(false);
          finalizeGame();
          return 0;
        }
        return next;
      });
    }, TICK_MS / speed);
    return () => clearInterval(iv);
  }, [running, gameOver, speed, oppRating, opp, addLog, tryAutoSub]);

  const finalizeGame = useCallback(() => {
    setGameOver(true);
    const { us: finalUs, them: finalThem } = stateRef.current;
    const win = finalUs > finalThem;
    setSeason(s => [...s, { n: gameNum, opp, us: finalUs, them: finalThem, win }]);
    // commit season stats
    setRoster(curr => curr.map(p => ({
      ...p,
      sPts: p.sPts + p.pts,
      sReb: p.sReb + p.reb,
      sAst: p.sAst + p.ast,
      sGames: p.sGames + (p.minPlayed > 0 ? 1 : 0),
    })));
    addLog({ tone: "info", text: win ? `W: ${finalUs}-${finalThem} vs ${opp}` : `L: ${finalUs}-${finalThem} vs ${opp}` });
  }, [gameNum, opp, addLog]);

  const nextGame = useCallback(() => {
    const nextNum = gameNum + 1;
    setGameNum(nextNum);
    const newOpp = OPPONENTS[(nextNum - 1) % OPPONENTS.length];
    setOpp(newOpp);
    setOppRating(78 + Math.floor(Math.random() * 14));
    setUs(0); setThem(0); setClock(GAME_LEN); setGameOver(false);
    setLog([]);
    setRoster(curr => curr.map(p => ({ ...p, stamina: 100, pts: 0, reb: 0, ast: 0, minPlayed: 0 })));
    setOnCourt(ROSTER_SEED.slice(0, 5).map(p => p.id));
  }, [gameNum]);

  const resetSeason = useCallback(() => {
    setRoster(ROSTER_SEED.map(freshPlayer));
    setOnCourt(ROSTER_SEED.slice(0, 5).map(p => p.id));
    setUs(0); setThem(0); setClock(GAME_LEN); setGameOver(false);
    setGameNum(1); setOpp(OPPONENTS[0]); setOppRating(85);
    setSeason([]); setLog([]);
  }, []);

  const lastFive = season.slice(-5);

  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-md bg-background/70 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center display text-2xl shadow-[0_0_30px_oklch(0.72_0.18_50/0.4)]">
              82
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl leading-none">82-0 CHALLENGE</h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Full Rotation Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`px-3 py-1.5 rounded-md border ${streakBroken ? "border-destructive/50 text-destructive bg-destructive/10" : "border-success/40 text-success bg-success/10"} font-mono font-bold`}>
              {wins}-{losses}
            </div>
            <button onClick={resetSeason} className="px-3 py-1.5 rounded-md text-xs uppercase tracking-wider border border-border hover:bg-secondary transition">
              Reset Season
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left column — game */}
        <div className="space-y-5">
          {/* Scoreboard */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
              <span>Game {gameNum} of 82</span>
              <span>vs {opp} <span className="text-muted-foreground/60">· OVR {oppRating}</span></span>
            </div>
            <div className="grid grid-cols-3 items-center px-4 py-5 gap-4">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">HOME</div>
                <div className="display text-5xl sm:text-6xl text-primary scoreboard-glow">{us}</div>
              </div>
              <div className="text-center">
                <div className="display text-3xl sm:text-4xl font-mono">{fmtClock(clock)}</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">Q1 · 10:00 GAME</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{opp.toUpperCase()}</div>
                <div className="display text-5xl sm:text-6xl scoreboard-glow">{them}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-border px-4 py-3 flex flex-wrap items-center gap-2">
              {!gameOver ? (
                <>
                  <button
                    onClick={() => setRunning(r => !r)}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground display tracking-wider hover:brightness-110 transition shadow-[0_0_24px_oklch(0.72_0.18_50/0.35)]"
                  >
                    {running ? "Pause" : clock === GAME_LEN ? "Tip-off" : "Resume"}
                  </button>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {[1, 2, 4, 8].map(s => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-3 py-2 text-xs font-mono ${speed === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >{s}x</button>
                    ))}
                  </div>
                  <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
                    <input type="checkbox" checked={autoSub} onChange={e => setAutoSub(e.target.checked)} className="accent-primary" />
                    Auto-sub at {SUB_AUTO_THRESHOLD}% stamina
                  </label>
                </>
              ) : (
                <>
                  <div className={`display text-2xl ${us > them ? "text-success" : "text-destructive"}`}>
                    {us > them ? "VICTORY" : "DEFEAT"}
                  </div>
                  <button
                    onClick={nextGame}
                    className="ml-auto px-4 py-2 rounded-md bg-primary text-primary-foreground display tracking-wider hover:brightness-110 transition"
                  >
                    Next Game →
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Court / Lineup */}
          <section className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground bg-card border-b border-border">
              <span>On the Floor</span>
              <button onClick={() => setShowRoster(true)} className="text-primary hover:underline normal-case tracking-normal text-xs">
                Manage rotation →
              </button>
            </div>
            <div className="court-bg p-4 sm:p-6 relative">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--court-line)]/40" />
                <div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 border border-[var(--court-line)]/40 rounded-full" />
              </div>
              <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-3">
                {courtPlayers.map(p => (
                  <PlayerCard key={p.id} p={p} onClick={() => setShowRoster(true)} />
                ))}
              </div>
            </div>
          </section>

          {/* Box score */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
              Box Score
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-3 py-2">Player</th>
                    <th className="text-right px-2 py-2">MIN</th>
                    <th className="text-right px-2 py-2">PTS</th>
                    <th className="text-right px-2 py-2">REB</th>
                    <th className="text-right px-2 py-2">AST</th>
                    <th className="text-right px-3 py-2">STM</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(p => {
                    const isOn = onCourt.includes(p.id);
                    return (
                      <tr key={p.id} className={`border-t border-border/50 ${isOn ? "bg-primary/[0.04]" : ""}`}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOn ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
                            <span className="font-medium">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.pos} · {p.rating}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-muted-foreground">{Math.floor(p.minPlayed / 60)}:{(p.minPlayed % 60).toString().padStart(2, "0")}</td>
                        <td className="px-2 py-2 text-right font-mono">{p.pts}</td>
                        <td className="px-2 py-2 text-right font-mono">{p.reb}</td>
                        <td className="px-2 py-2 text-right font-mono">{p.ast}</td>
                        <td className="px-3 py-2 text-right">
                          <StaminaBar value={p.stamina} compact />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column — sidebar */}
        <aside className="space-y-5">
          {/* Season strip */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border flex justify-between">
              <span>Season</span>
              <span className="font-mono">{wins}-{losses}</span>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 82 }).map((_, i) => {
                  const g = season[i];
                  return (
                    <div
                      key={i}
                      title={g ? `G${g.n} ${g.win ? "W" : "L"} ${g.us}-${g.them} vs ${g.opp}` : `Game ${i + 1}`}
                      className={`aspect-square rounded-sm border ${
                        g ? (g.win ? "bg-success border-success/60" : "bg-destructive border-destructive/60") :
                        i + 1 === gameNum && !gameOver ? "border-primary bg-primary/20 animate-pulse" :
                        "border-border/40 bg-secondary/40"
                      }`}
                    />
                  );
                })}
              </div>
              {!streakBroken && wins >= 1 && (
                <div className="mt-3 text-center text-xs text-success display tracking-wider">
                  PERFECT · {wins}-0
                </div>
              )}
              {streakBroken && (
                <div className="mt-3 text-center text-xs text-destructive display tracking-wider stripe-warn py-1 rounded">
                  STREAK BROKEN
                </div>
              )}
            </div>
          </section>

          {/* Recent results */}
          <section className="rounded-xl border border-border bg-card">
            <div className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
              Last 5
            </div>
            <ul className="divide-y divide-border/50">
              {lastFive.length === 0 && (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">No games played yet</li>
              )}
              {[...lastFive].reverse().map(g => (
                <li key={g.n} className="px-4 py-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono text-xs">G{g.n}</span>
                  <span className="flex-1 px-3 truncate">vs {g.opp}</span>
                  <span className={`font-mono ${g.win ? "text-success" : "text-destructive"}`}>
                    {g.win ? "W" : "L"} {g.us}-{g.them}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Play-by-play */}
          <section className="rounded-xl border border-border bg-card">
            <div className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
              Play-by-Play
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border/30">
              {log.length === 0 && (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">Tip-off to begin</li>
              )}
              {log.map((e, i) => (
                <li key={i} className={`px-4 py-1.5 text-xs flex gap-2 ${
                  e.tone === "us" ? "text-primary" :
                  e.tone === "them" ? "text-destructive/90" :
                  e.tone === "sub" ? "text-accent" :
                  "text-muted-foreground"
                }`}>
                  <span className="font-mono opacity-60 shrink-0">·</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      {/* Rotation manager modal */}
      {showRoster && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4" onClick={() => setShowRoster(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-t-2xl sm:rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="display text-2xl">Rotation Manager</h2>
                <p className="text-xs text-muted-foreground">Tap a starter then a bench player to swap.</p>
              </div>
              <button onClick={() => setShowRoster(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <RotationManager
              onCourt={courtPlayers}
              bench={bench}
              onSub={sub}
            />
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-[11px] text-muted-foreground">
        82-0 Challenge · Full Rotation Edition · Built for desktop & mobile coaches
      </footer>
    </div>
  );
}

function PlayerCard({ p, onClick }: { p: Player; onClick: () => void }) {
  const low = p.stamina < SUB_AUTO_THRESHOLD;
  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-lg p-3 backdrop-blur border transition ${
        low ? "bg-destructive/20 border-destructive/50 stripe-warn" : "bg-background/80 border-border hover:border-primary/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="display text-lg leading-none">{p.name.split(" ").slice(-1)[0]}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{p.pos}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-xs text-muted-foreground">OVR</span>
        <span className="font-mono text-sm">{p.rating}</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">{p.pts} PTS</span>
      </div>
      <div className="mt-2">
        <StaminaBar value={p.stamina} />
      </div>
    </button>
  );
}

function StaminaBar({ value, compact = false }: { value: number; compact?: boolean }) {
  const color =
    value > 60 ? "var(--color-success)" :
    value > SUB_AUTO_THRESHOLD ? "var(--color-primary)" :
    "var(--color-destructive)";
  return (
    <div className={`relative ${compact ? "h-1.5 w-20 inline-block" : "h-2 w-full"} rounded-full bg-secondary overflow-hidden`}>
      <div className="h-full transition-[width] duration-300" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function RotationManager({
  onCourt, bench, onSub,
}: { onCourt: Player[]; bench: Player[]; onSub: (outId: string, inId: string) => void }) {
  const [selectedOut, setSelectedOut] = useState<string | null>(null);

  return (
    <div className="overflow-y-auto p-5 grid sm:grid-cols-2 gap-5">
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Starters</h3>
        <ul className="space-y-2">
          {onCourt.map(p => (
            <li key={p.id}>
              <button
                onClick={() => setSelectedOut(s => s === p.id ? null : p.id)}
                className={`w-full text-left rounded-md border p-3 transition ${
                  selectedOut === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.pos} · OVR {p.rating}</div>
                  </div>
                  <StaminaBar value={p.stamina} compact />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Bench {selectedOut && "· tap to sub in"}</h3>
        <ul className="space-y-2">
          {bench.map(p => (
            <li key={p.id}>
              <button
                disabled={!selectedOut}
                onClick={() => { if (selectedOut) { onSub(selectedOut, p.id); setSelectedOut(null); } }}
                className={`w-full text-left rounded-md border p-3 transition ${
                  selectedOut ? "border-accent/60 hover:bg-accent/10 cursor-pointer" : "border-border opacity-70 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.pos} · OVR {p.rating}</div>
                  </div>
                  <StaminaBar value={p.stamina} compact />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------- Utils ----------
function weightedPick<T>(arr: T[], weight: (t: T) => number): T {
  const total = arr.reduce((s, x) => s + weight(x), 0);
  let r = Math.random() * total;
  for (const x of arr) {
    r -= weight(x);
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}
