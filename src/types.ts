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

export type PlanetContractState = {
  owner: string;
  numSpaceships: number;
  lastUpdated: number;
  active: boolean;
  exitTime: number;
};

export type PlanetState = {
  owner: string;
  numSpaceships: number;
  active: boolean;
  exiting: boolean;
  exitTimeLeft: number;
  natives: boolean;
  capturing: boolean;
};

export type Planet = PlanetInfo & {
  state?: PlanetState;
  loaded: boolean;
};

export type Position = {x: number; y: number};

export type Fleet = {
  from: Position;
  fleetAmount: number; // not needed to store, except to not require contract fetch
  launchTime: number; // a bit needed until fleet is fetchable from contract
  duration: number; // not needed to store, except to not require computing stats from from planet
  owner: string; // not needed at all to store : TODO remove ?
  secret: string; // needed
};

export type OwnFleet = Fleet & {
  to: Position;
  resolveTxHash?: string;
  sendTxHash: string;
};
