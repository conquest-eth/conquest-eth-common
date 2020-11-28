import {OwnFleet, Planet, PrivateSpace, Space} from '../types';

export class PrivateSpaceImpl implements PrivateSpace {

  constructor(private space: Space, private privateAccount: {walletAddress: string; getFleets(): OwnFleet[]}) {
  }
  get player(): string | undefined {
    return this.privateAccount.walletAddress;
  }
  getPlanet(x: number, y: number): Planet | undefined {
    return this.space.getPlanet(x, y);
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
