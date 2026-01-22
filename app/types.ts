export type Stats = {
  ba?: number;
  obp?: number;
  slg?: number;
  rbi?: number;
  games?: number;
  qab?: number;
  [key: string]: any;
};

export type Position = {
  id: string;
  name?: string;
  label?: string;
};

export type Player = {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  positions?: string[] | Position[];
  jerseyNumber?: number;
  jersey?: number;
  stats?: Stats | Record<string, any>;
  [key: string]: any;
};
