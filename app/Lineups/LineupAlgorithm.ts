import type { Player } from './types';

const EPS = 1e-9;

type Metrics = {
  obr: number;
  bip: number;
  pwr: number;
  spd: number;
};

export type PlayerScores = {
  player: Player;
  metrics: Metrics;
  norm: { obr: number; bip: number; pwr: number; spd: number };
  slotScores: { [k: string]: number };
};

function computeRawMetrics(players: Player[]): Map<number, Metrics> {
  const map = new Map<number, Metrics>();
  players.forEach((p) => {
    const s = p.stats ?? {};
    const PA = s.pa ?? 0;
    const H = s.h ?? 0;
    const BB = s.bb ?? 0;
    const SO = s.so ?? 0;
    const XBH = s.xbh ?? 0;
    const ROE = s.roe ?? 0;
    const SPD = s.spd ?? 0;

    const obr = PA > 0 ? (H + BB + ROE) / PA : 0; // youth-friendly OBR
    const bip = PA > 0 ? 1 - (SO / PA) : 0; // BIP
    const pwr = PA > 0 ? XBH / PA : 0; // PWR
    const spd = Math.max(0, Math.min(10, SPD)); // 0-10

    map.set(p.id, { obr, bip, pwr, spd });
  });
  return map;
}

function minMaxNormalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const denom = Math.max(1e-9, max - min);
  return values.map((v) => (v - min) / denom);
}

export function computePlayerScores(players: Player[]): PlayerScores[] {
  const raw = computeRawMetrics(players);
  const obrVals: number[] = [];
  const bipVals: number[] = [];
  const pwrVals: number[] = [];
  const spdVals: number[] = [];

  players.forEach((p) => {
    const m = raw.get(p.id)!;
    obrVals.push(m.obr);
    bipVals.push(m.bip);
    pwrVals.push(m.pwr);
    spdVals.push(m.spd);
  });

  const obrN = minMaxNormalize(obrVals);
  const bipN = minMaxNormalize(bipVals);
  const pwrN = minMaxNormalize(pwrVals);
  const spdN = spdVals.map((v) => v / 10);

  const out: PlayerScores[] = players.map((p, i) => {
    const m = raw.get(p.id)!;
    const norm = { obr: obrN[i], bip: bipN[i], pwr: pwrN[i], spd: spdN[i] };
    const o = norm.obr;
    const c = norm.bip;
    const pwr = norm.pwr;
    const s = norm.spd;
    const slotScores: { [k: string]: number } = {};

    slotScores['S1'] = 0.5 * o + 0.35 * s + 0.15 * c;
    slotScores['S2'] = 0.45 * c + 0.45 * o + 0.10 * s;
    slotScores['S3'] = 0.45 * o + 0.30 * c + 0.25 * pwr;
    slotScores['S4'] = 0.55 * pwr + 0.30 * o + 0.15 * c;
    slotScores['S5'] = 0.45 * pwr + 0.35 * o + 0.20 * c;
    slotScores['Smid'] = 0.45 * o + 0.40 * c + 0.15 * s;
    slotScores['S8'] = 0.40 * c + 0.40 * o + 0.20 * s;
    slotScores['S9'] = 0.45 * o + 0.35 * s + 0.20 * c;

    return { player: p, metrics: m, norm, slotScores };
  });

  return out;
}

function totalPermutations(n: number, k: number) {
  // P(n,k) = n!/(n-k)!
  let prod = 1;
  for (let i = 0; i < k; i++) prod *= (n - i);
  return prod;
}

function generatePermutations<T>(arr: T[], k: number) {
  // generate all ordered k-length permutations of arr
  const results: T[][] = [];
  const n = arr.length;
  const used = Array(n).fill(false);
  const current: T[] = [];

  function backtrack() {
    if (current.length === k) {
      results.push(current.slice());
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(arr[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  }
  backtrack();
  return results;
}

export type GenerateOptions = {
  lineupSize?: number; // default 9
  strategy?: 'brute' | 'greedy';
  bruteThreshold?: number; // max permutations to run brute-force
};

export function generateOptimalLineup(players: Player[], options: GenerateOptions = {}) {
  const lineupSize = Math.min(options.lineupSize ?? 9, players.length);
  const strategy = options.strategy ?? 'brute';
  const threshold = options.bruteThreshold ?? 500000; // safe default

  const scores = computePlayerScores(players);

  const slotKeys: string[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'Smid', 'Smid', 'S8', 'S9'];

  const computeTotal = (perm: typeof scores) => {
    let total = 0;
    for (let i = 0; i < lineupSize; i++) {
      const slot = slotKeys[i] || 'Smid';
      total += perm[i].slotScores[slot];
    }
    return total;
  };

  const n = scores.length;
  const permutationsCount = totalPermutations(n, lineupSize);

  // If brute forced and under threshold
  if (strategy === 'brute' && permutationsCount <= threshold) {
    const playerPerms = generatePermutations(scores, lineupSize);
    let best: typeof scores | null = null;
    let bestScore = -Infinity;
    let bestTieBreak = null as null | { obrSum15: number; pwr4: number; ids: number[] };

    for (const perm of playerPerms) {
      const total = computeTotal(perm);
      let tieKey = null as any;
      if (total > bestScore + EPS) {
        best = perm;
        bestScore = total;
        // tie-break values
        const obrSum15 = perm.slice(0, Math.min(5, perm.length)).reduce((s, p) => s + p.norm.obr, 0);
        const pwr4 = perm[3] ? perm[3].norm.pwr : 0;
        const ids = perm.map((p) => p.player.id);
        bestTieBreak = { obrSum15, pwr4, ids };
      } else if (Math.abs(total - bestScore) < EPS && best) {
        // tie-break
        const obrSum15 = perm.slice(0, Math.min(5, perm.length)).reduce((s, p) => s + p.norm.obr, 0);
        if (obrSum15 > (bestTieBreak?.obrSum15 ?? -Infinity)) {
          best = perm;
          bestTieBreak = { obrSum15, pwr4: perm[3] ? perm[3].norm.pwr : 0, ids: perm.map((p) => p.player.id) };
        } else if (Math.abs(obrSum15 - (bestTieBreak?.obrSum15 ?? 0)) < EPS) {
          const pwr4 = perm[3] ? perm[3].norm.pwr : 0;
          if (pwr4 > (bestTieBreak?.pwr4 ?? -Infinity)) {
            best = perm;
            bestTieBreak = { obrSum15, pwr4, ids: perm.map((p) => p.player.id) };
          } else if (Math.abs(pwr4 - (bestTieBreak?.pwr4 ?? 0)) < EPS) {
            // lexicographic ids
            const ids = perm.map((p) => p.player.id);
            const curIds = bestTieBreak!.ids;
            const lex = ids.join(',') > curIds.join(',');
            if (lex) {
              best = perm;
              bestTieBreak = { obrSum15, pwr4, ids };
            }
          }
        }
      }
    }

    if (!best) return { lineup: scores.slice(0, lineupSize).map((s) => s.player), reason: 'fallback' };
    return { lineup: best.slice(0, lineupSize).map((s) => s.player), reason: 'brute' };
  }

  // Greedy assignment fallback / default
  // For each slot in order, pick available player with highest slot score
  const available = new Set(scores.map((s) => s.player.id));
  const lineup: Player[] = [];
  for (let i = 0; i < lineupSize; i++) {
    const slot = slotKeys[i] || 'Smid';
    let bestPlayer: PlayerScores | null = null;
    for (const ps of scores) {
      if (!available.has(ps.player.id)) continue;
      if (!bestPlayer || ps.slotScores[slot] > bestPlayer.slotScores[slot]) bestPlayer = ps;
      else if (Math.abs(ps.slotScores[slot] - (bestPlayer.slotScores[slot] ?? 0)) < EPS) {
        // tie-breaker prefer higher obr
        if (ps.norm.obr > (bestPlayer.norm.obr ?? 0)) bestPlayer = ps;
      }
    }
    if (bestPlayer) {
      lineup.push(bestPlayer.player);
      available.delete(bestPlayer.player.id);
    }
  }

  return { lineup, reason: 'greedy' };
}
