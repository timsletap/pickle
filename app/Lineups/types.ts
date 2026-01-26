import type { Player as BasePlayer } from '../types';
export type Player = BasePlayer;

export type Position = {
  id: string;
  label: string;
  name: string;
  top: string;
  left: string;
};

// Softball field positions - properly spaced for the diamond layout
export const POSITIONS: Position[] = [
  // Catcher at bottom
  { id: "C", label: "C", name: "Catcher", top: "78%", left: "44.5%" },

  // Pitcher in center
  { id: "P", label: "P", name: "Pitcher", top: "55%", left: "44.5%" },

  // Infield - corners
  { id: "1B", label: "1B", name: "1st Base", top: "48%", left: "70%" },
  { id: "3B", label: "3B", name: "3rd Base", top: "48%", left: "18%" },

  // Infield - middle
  { id: "2B", label: "2B", name: "2nd Base", top: "32%", left: "58%" },
  { id: "SS", label: "SS", name: "Shortstop", top: "32%", left: "32%" },

  // Outfield
  { id: "LF", label: "LF", name: "Left Field", top: "10%", left: "9.5%" },
  { id: "CF", label: "CF", name: "Center Field", top: "3%", left: "42.5%" },
  { id: "RF", label: "RF", name: "Right Field", top: "10%", left: "78%" },
];
