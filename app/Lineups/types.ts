export type Player = {
  id: string | number;
  first_name: string;
  last_name: string;
  jersey?: number;
  // raw per-player stats (mock)
  stats?: {
    ba?: number; // batting average
    obp?: number;
    slg?: number;
    rbi?: number;
    games?: number;
    qab_pct?: number;
  };
};

export type Position = {
  id: string;
  label: string;
  name: string;
  top: string;
  left: string;
};

export const POSITIONS: Position[] = [
  { id: "P", label: "P", name: "Pitcher", top: "55%", left: "37.5%" },
  { id: "C", label: "C", name: "Catcher", top: "77.5%", left: "37.5%" },
  { id: "1B", label: "1B", name: "First Base", top: "52.5%", left: "65%" },
  { id: "2B", label: "2B", name: "Second Base", top: "32.5%", left: "51.25%" },
  { id: "3B", label: "3B", name: "Third Base", top: "52.5%", left: "10%" },
  { id: "SS", label: "SS", name: "Shortstop", top: "32.5%", left: "23.75%" },
  { id: "LF", label: "LF", name: "Left Field", top: "7.5%", left: "0%" },
  { id: "CF", label: "CF", name: "Center Field", top: "2.5%", left: "37.5%" },
  { id: "RF", label: "RF", name: "Right Field", top: "7.5%", left: "75%" },
];

{/*}
export const SAMPLE_ROSTER: Player[] = [
  { id: 1, first_name: "Ava", last_name: "Smith", jersey: 12, stats: { pa: 60, h: 27, bb: 6, so: 8, xbh: 8, roe: 2, spd: 7, avg: 0.375, hits: 27 } },
  { id: 2, first_name: "Bella", last_name: "Jones", jersey: 4, stats: { pa: 64, h: 20, bb: 8, so: 10, xbh: 6, roe: 1, spd: 5, avg: 0.312, hits: 20 } },
  { id: 3, first_name: "Carla", last_name: "Brown", jersey: 9, stats: { pa: 62, h: 18, bb: 4, so: 12, xbh: 4, roe: 3, spd: 6, avg: 0.290, hits: 18 } },
  { id: 4, first_name: "Diana", last_name: "Garcia", jersey: 22, stats: { pa: 70, h: 28, bb: 10, so: 6, xbh: 12, roe: 0, spd: 5, avg: 0.400, hits: 28 } },
  { id: 5, first_name: "Ella", last_name: "Davis", jersey: 7, stats: { pa: 58, h: 15, bb: 5, so: 14, xbh: 2, roe: 1, spd: 8, avg: 0.259, hits: 15 } },
  { id: 6, first_name: "Faith", last_name: "Miller", jersey: 1, stats: { pa: 60, h: 19, bb: 7, so: 9, xbh: 5, roe: 0, spd: 4, avg: 0.317, hits: 19 } },
  { id: 7, first_name: "Gwen", last_name: "Wilson", jersey: 15, stats: { pa: 55, h: 16, bb: 4, so: 11, xbh: 3, roe: 2, spd: 6, avg: 0.291, hits: 16 } },
  { id: 8, first_name: "Hannah", last_name: "Moore", jersey: 6, stats: { pa: 63, h: 21, bb: 9, so: 7, xbh: 7, roe: 0, spd: 9, avg: 0.333, hits: 21 } },
  { id: 9, first_name: "Ivy", last_name: "Taylor", jersey: 18, stats: { pa: 50, h: 14, bb: 3, so: 15, xbh: 1, roe: 1, spd: 8, avg: 0.280, hits: 14 } },
];
*/}
