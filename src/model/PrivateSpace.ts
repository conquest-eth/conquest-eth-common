import {OwnFleet} from '../types';
import { PlanetFetch, Space, TimeKeeper } from './Space';
import { SpaceInfo } from './SpaceInfo';

export class PrivateSpace extends Space {

  constructor(spaceInfo: SpaceInfo, fetch: PlanetFetch, timeKeeper: TimeKeeper, private privateAccount: {walletAddress: string; getFleets(): OwnFleet[]}) {
    super(spaceInfo, fetch, timeKeeper);
  }
  get player(): string | undefined {
    return this.privateAccount.walletAddress;
  }
  getOwnFleets(): OwnFleet[] {
    return this.privateAccount.getFleets();
  }
  // getFleetsFrom(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
  // getFleetsTo(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
}
