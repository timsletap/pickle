import { updatePlayerStats } from '../../config/FirebaseConfig';
import BattingOrder from '../Lineups/BattingOrder';

type Props = {
  roster: any[];
  sortMode: any;
  setSortMode: (m: any) => void;
  openStats: (p: any) => void;
  battingOrder?: any[];
  setBattingOrder: (o: any[] | null) => void;
  selectedBatSlot?: number | null;
  setSelectedBatSlot?: (i: number | null) => void;
  user: any;
};

export default function LineupsOffense({ roster, sortMode, setSortMode, openStats, battingOrder, setBattingOrder, selectedBatSlot, setSelectedBatSlot, user }: Props) {
  return (
    <BattingOrder
      roster={roster}
      sortMode={sortMode}
      setSortMode={setSortMode}
      openStats={openStats}
      battingOrder={battingOrder}
      selectedBatSlot={selectedBatSlot}
      setSelectedBatSlot={setSelectedBatSlot}
      onAutoGenerate={async () => {
        const alg = require('../Lineups/LineupAlgorithm') as typeof import('../Lineups/LineupAlgorithm');
        const result = alg.generateOptimalLineup(roster, { lineupSize: Math.min(9, roster.length) });
        try {
          const raw = alg.computeRawMetrics(roster);
          await Promise.all(
            roster.map(async (p) => {
              const rcv = raw.get(p.id)?.rcv ?? 0;
              const merged = { ...(p.stats ?? {}), rcv };
              try {
                await updatePlayerStats(user!.uid, String(p.id), merged);
              } catch (e) {}
            })
          );
        } catch (e) {}
        setBattingOrder(result.lineup);
      }}
      onClearOrder={() => setBattingOrder(null)}
    />
  );
}
