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

export type Planet = PlanetInfo & {
  owner: string;
  lastOwnershipTime: number;
  numSpaceships: number;
  lastUpdated: number;
  productionRate: number;
  stake: BigNumber;
};

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
};
