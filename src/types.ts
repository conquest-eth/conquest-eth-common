import type {BigNumber} from '@ethersproject/bignumber';

export type PlanetLocation = {
  id: string;
  x: number;
  y: number;
  subX: number;
  subY: number;
  globalX: number;
  globalY: number;
};

export type Statistics = {
  subX: number;
  subY: number;
  maxStake: number;
  production: number;
  attack: number;
  defense: number;
  speed: number;
  natives: number;
};

export type PlanetInfo = {
  location: PlanetLocation;
  type: number;
  stats: Statistics;
};

export type SpaceInfo = {
  getPlanetInfo(x: number, y: number): PlanetInfo | undefined;
};

export type PlanetUpdatableData = {
  owner: string;
  lastOwnershipTime: string; // TODO BigNumber
  numSpaceships: number;
  lastUpdated: string; // TODO BigNumber
  productionRate: number;
  stake: string; // TODO BigNumber
};

export type Planet = PlanetInfo & {state?: PlanetUpdatableData, loaded: boolean};

export type Space = {
  getPlanet(x: number, y: number): Planet | undefined;
};

export type Fleet = {
  launchTime: number;
  owner: string;
  from: string;
  to: string;
  toHash: string;
  quantity: number;
};

export type PrivateSpace = Space & {
  getFleets(): Fleet[];
  getFleetsFrom(x: number, y: number): Fleet[];
  getFleetsTo(x: number, y: number): Fleet[];
  player: string | undefined;
};

export type StateAdapter = {
  // onPlanetUpdate: (func: (planet: PlanetUpdatableData) => void) => void;
  getPlanetUpdatableData(x: number, y: number): PlanetUpdatableData;
  isPlanetLoaded(x: number, y: number): boolean;
};
