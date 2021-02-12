// object including both planet id and global coordinates
export type PlanetLocation = {
  id: string;
  x: number; // not needed ?
  y: number; // not needed ?
  globalX: number;
  globalY: number;
};

// object describing the static attributes of a planet // do not change
export type Statistics = {
  name: string;
  stake: number;
  production: number;
  attack: number;
  defense: number;
  speed: number;
  natives: number;
};

// object representing a planet with only static attributes // do not change
export type PlanetInfo = {
  location: PlanetLocation;
  type: number;
  stats: Statistics;
};

// object resulting from a call to the contract : might require transformation
export type PlanetContractState = {
  owner: string;
  numSpaceships: number;
  lastUpdated: number;
  active: boolean;
  exitTime: number;
};

// object representing the state of the planet // change over time and through actions
export type PlanetState = {
  owner: string;
  numSpaceships: number;
  active: boolean;
  exiting: boolean;
  exitTimeLeft: number;
  natives: boolean;
  capturing: boolean;
  inReach: boolean;
};

// object representing a Plnet with both its static and dynamic state
// loaded is true once state is established at least once
export type Planet = PlanetInfo & {
  state?: PlanetState;
  loaded: boolean;
};

export type Position = {x: number; y: number};

// object representing a fleet (publicly)
export type Fleet = {
  from: Position;
  fleetAmount: number; // not needed to store, except to not require contract fetch
  launchTime: number; // a bit needed until fleet is fetchable from contract
  actualLaunchTime?: number;
  duration: number; // not needed to store, except to not require computing stats from from planet
  owner: string; // not needed at all to store : TODO remove ?
  secret: string; // needed
};

// object representing a fleet with private info to resolve its attack/sending
export type OwnFleet = Fleet & {
  to: Position;
  resolveTxHash?: string;
  sendTxHash: string;
};

// export type OwnedFleetStored = {
//   to: Position;
//   secret: string;
//   sendTxHash: string;
//   sendTime: number;

//   resolveTxHash?: string;

//   from: Position;
//   launchTime?: number;
// };

// export type PFllet = OwnedFleetStored & {
//   timeLeft: number; // updated
// };

// to consider:
// export type Fleet = {
//   from: Position;
//   fleetAmount: number;
//   launchTime?: number;
//   duration: number;
//   owner: string;
// };

// export type OwnFleet = Fleet & {
//   to: Position;
//   resolveTxHash?: string;
//   sendTxHash: string;
//   sendTime: number;
//   secret: string; // needed
//   timeLeft: number;
// };
