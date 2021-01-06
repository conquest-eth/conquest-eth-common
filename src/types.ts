
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
}

export type PlanetState = {
  owner: string;
  numSpaceships: number;
  active: boolean;
  exiting: boolean;
  exitTimeLeft: number;
  natives: boolean;
};

export type Planet = PlanetInfo & {
  state?: PlanetState;
  loaded: boolean;
};

export type Position = {x: number; y: number};

export type Fleet = {
  from: Position;
  fleetAmount: number;
  launchTime: number;
  duration: number;
  owner: string;
  secret: string;
};

export type OwnFleet = Fleet & {
  to: Position;
  resolveTxHash?: string;
  sendTxHash: string;
};
