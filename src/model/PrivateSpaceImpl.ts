import {OwnFleet, Planet, PrivateSpace, Space} from '../types';

export class PrivateSpaceImpl implements PrivateSpace {

  public resolveWindow: number;
  public timePerDistance: number;
  public exitDuration: number;

  constructor(private space: Space, private privateAccount: {walletAddress: string; getFleets(): OwnFleet[]}) {
    this.resolveWindow = space.resolveWindow;
    this.timePerDistance = space.timePerDistance;
    this.exitDuration = space.exitDuration;
  }
  get player(): string | undefined {
    return this.privateAccount.walletAddress;
  }
  getPlanet(x: number, y: number): Planet | undefined {
    return this.space.getPlanet(x, y);
  }

  getCurrentNumSpaceships(planet: Planet, time: number): number {
    return this.space.getCurrentNumSpaceships(planet, time);
  }

  isActive(planet: Planet, time: number): boolean {
    return this.space.isActive(planet, time);
  }

  isExiting(planet: Planet, time: number): boolean {
    return this.space.isExiting(planet, time);
  }

  exitRatio(planet: Planet, time: number): number {
    return this.space.exitRatio(planet, time);
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
