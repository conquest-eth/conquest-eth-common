import {OwnFleet, Planet, PrivateSpace, Space} from '../types';

export class PrivateSpaceImpl implements PrivateSpace {

  public resolveWindow: number;
  public timePerDistance: number;

  constructor(private space: Space, private privateAccount: {walletAddress: string; getFleets(): OwnFleet[]}) {
    this.resolveWindow = space.resolveWindow;
    this.timePerDistance = space.timePerDistance;
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
