import type { Player } from './types';

const EPS = 1e-9;

// Batting order weights for positions 1..9
const BATTER_WEIGHTS: number[] = [1.05, 1.10, 1.12, 1.15, 1.08, 1.00, 0.95, 0.92, 0.97];

// Slot order mapping used by the algorithm (index -> slot key)
const SLOT_ORDER: string[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'Smid', 'Smid', 'S8', 'S9'];

type Metrics = { rcv: number };

export type PlayerScores = {
  player: Player;
  metrics: Metrics;
  norm: { rcv: number };
  slotScores: { [k: string]: number };
};

export function computeRawMetrics(players: Player[]): Map<string | number, Metrics> {
  const map = new Map<string | number, Metrics>();
  players.forEach((p) => {
    const s = p.stats ?? {};
    const obp = s.obp ?? 0;
    const slg = s.slg ?? 0;
    const ba = s.ba ?? 0;
    const rbi = s.rbi ?? 0;
    const games = s.games ?? 0;
    const qab_pct = s.qab_pct ?? 0;

    const rcv = 0.35 * obp + 0.25 * slg + 0.15 * ba + (games > 0 ? rbi / games : 0) + 0.10 * qab_pct;

    map.set(p.id, { rcv });
  });
  return map;
}

export function generateOptimalLineup(players: Player[], options: { lineupSize?: number } = {}) {
  const lineupSize = Math.min(options.lineupSize ?? 9, players.length);

  const raw = computeRawMetrics(players);

  const ranked = players.map((p) => ({ player: p, rcv: raw.get(p.id)?.rcv ?? 0 }));
  ranked.sort((a, b) => b.rcv - a.rcv);

  const topPlayers = ranked.slice(0, lineupSize).map((r) => r.player);

  // order batting positions by descending weight (highest weight first)
  const indices = Array.from({ length: lineupSize }, (_, i) => i);
  indices.sort((a, b) => (BATTER_WEIGHTS[b] ?? 1) - (BATTER_WEIGHTS[a] ?? 1));

  const arranged: Array<Player | null> = Array(lineupSize).fill(null);
  for (let i = 0; i < topPlayers.length; i++) {
    arranged[indices[i]] = topPlayers[i];
  }

  const lineup: Player[] = arranged.map((p) => p as Player);
  return { lineup, reason: 'weight-assign' };
}
