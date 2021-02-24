import type {OwnFleet, TxStatus} from '../types';
import {PlanetFetch, Space, TimeKeeper} from './Space';
import type {SpaceInfo} from './SpaceInfo';

export class PrivateSpace extends Space {
  constructor(
    spaceInfo: SpaceInfo,
    fetch: PlanetFetch,
    timeKeeper: TimeKeeper,
    private privateAccount: {
      walletAddress?: string;
      getFleets(): OwnFleet[];
      isTxPerformed(txHash?: string): boolean;
      capturingStatus(location: string): TxStatus | null | 'Loading';
    }
  ) {
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

  capturingStatus(planetId: string): TxStatus | null | 'Loading' {
    return this.privateAccount.capturingStatus(planetId);
  }
  // getFleetsFrom(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
  // getFleetsTo(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
}
