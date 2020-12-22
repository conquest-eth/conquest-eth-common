// import type {BigNumber} from '@ethersproject/bignumber';

import {BigNumber} from '@ethersproject/bignumber';

export type PlanetLocation = {
  id: string;
  x: number; // not needed ?
  y: number; // not needed ?
  globalX: number;
  globalY: number;
};

export type Statistics = {
  stake: number;
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
  asyncPlanetIdsFromArea(area: string): Promise<string[]>;
  planetIdsFromArea(area: string): string[];
  planetIdsArroundLocation(x: number, y: number): string[];
  getPlanetInfo(x: number, y: number): PlanetInfo | undefined;
  timePerDistance: number;
  resolveWindow: number;
};

export type PlanetUpdatableData = {
  owner: string;
  numSpaceships: number;
  lastUpdated: number;
  active: boolean;
  exitTime: number;
};

export type Planet = PlanetInfo & {
  state?: PlanetUpdatableData;
  loaded: boolean;
};

export type Position = {x: number; y: number};

export type Space = {
  getPlanet(x: number, y: number): Planet | undefined;
  timePerDistance: number;
  resolveWindow: number;
};

export type Fleet = {
  from: Position;
  fleetAmount: number;
  launchTime: number;
  owner: string;
};

export type OwnFleet = Fleet & {
  to: Position;
  resolveTxHash?: string;
  sendTxHash?: string;
};

export type PrivateSpace = Space & {
  getOwnFleets(): OwnFleet[];
  // getFleetsFrom(x: number, y: number): Fleet[];
  // getFleetsTo(x: number, y: number): Fleet[];
  player: string | undefined;
};

export type StateAdapter = {
  // onPlanetUpdate: (func: (planet: PlanetUpdatableData) => void) => void;
  getPlanetUpdatableData(x: number, y: number): PlanetUpdatableData;
};
