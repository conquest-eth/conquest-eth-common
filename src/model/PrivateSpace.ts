import {OwnFleet} from '../types';
import { PlanetFetch, Space, TimeKeeper } from './Space';
import { SpaceInfo } from './SpaceInfo';

export class PrivateSpace extends Space {

  constructor(spaceInfo: SpaceInfo, fetch: PlanetFetch, timeKeeper: TimeKeeper, private privateAccount: {walletAddress: string; getFleets(): OwnFleet[], isTxPerformed(txHash?: string): boolean, isCapturing(location: string): boolean}) {
    super(spaceInfo, fetch, timeKeeper);
  }
  get player(): string | undefined {
    return this.privateAccount.walletAddress;
  }
  getOwnFleets(): OwnFleet[] {
    return this.privateAccount.getFleets();
  }

  isTxPerformed(txHash?: string): boolean {
    return this.privateAccount.isTxPerformed(txHash);
  }

  isCapturing(planetId: string): boolean {
    const capturing = this.privateAccount.isCapturing(planetId);
    if (capturing) {
      console.log({planetId});
    }
    return capturing;
  }
  // getFleetsFrom(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
  // getFleetsTo(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
}
