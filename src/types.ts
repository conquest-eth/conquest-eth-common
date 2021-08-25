import {BigNumber} from '@ethersproject/bignumber';

// object including both planet id and global coordinates
export type PlanetLocation = {
  id: string;
  x: number; // not needed ?
  y: number; // not needed ?
  globalX: number;
  globalY: number;
};

export type TxStatus = {
  finalized: boolean;
  status: 'Pending' | 'Success' | 'Cancelled' | 'Failure' | 'Mined';
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
  subX: number;
  subY: number;
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
  reward: BigNumber;
};

// object representing the state of the planet // change over time and through actions
export type PlanetState = {
  owner?: string;
  numSpaceships: number;
  active: boolean;
  exiting: boolean;
  exitTimeLeft: number;
  natives: boolean;
  capturing: boolean; // TODO add error state
  inReach: boolean;
  reward: string;
  requireClaimAcknowledgement?: string;
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
  txHash: string; // TODO better id
  from: PlanetInfo;
  to: PlanetInfo;
  quantity: number; // not needed to store, except to not require contract fetch
  duration: number;
  launchTime: number;
  amountDestroyed: number;
  timeLeft: number; // not needed to store, except to not require computing stats from from planet
  timeToResolve: number;
  sending: {id: string; status: 'SUCCESS' | 'FAILURE' | 'LOADING' | 'PENDING' | 'CANCELED' | 'TIMEOUT';}; // TODO use pendingaction type
  resolution?: {id: string; status: 'SUCCESS' | 'FAILURE' | 'LOADING' | 'PENDING' | 'CANCELED' | 'TIMEOUT';}; // TODO use pendingaction type
};
