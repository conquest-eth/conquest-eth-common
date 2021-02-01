import {OwnFleet} from '../types';
import {PlanetFetch, Space, TimeKeeper} from './Space';
import {SpaceInfo} from './SpaceInfo';

export class PrivateSpace extends Space {
  constructor(
    spaceInfo: SpaceInfo,
    fetch: PlanetFetch,
    timeKeeper: TimeKeeper,
    private privateAccount: {
      walletAddress?: string;
      getFleets(): OwnFleet[];
      isTxPerformed(txHash?: string): boolean;
      isCapturing(location: string): boolean;
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

  timeLeftForFleet(
    time: number,
    fleet: OwnFleet
  ): {timeLeft: number; timePassed: number; fullTime: number} {
    const fromPlanet = this.ensurePlanetAt(fleet.from.x, fleet.from.y);
    const toPlanet = this.ensurePlanetAt(fleet.to.x, fleet.to.y);
    const gFromX = fromPlanet.location.globalX;
    const gFromY = fromPlanet.location.globalY;
    const gToX = toPlanet.location.globalX;
    const gToY = toPlanet.location.globalY;
    const speed = fromPlanet.stats.speed;
    const fullDistance = Math.floor(
      Math.sqrt(Math.pow(gToX - gFromX, 2) + Math.pow(gToY - gFromY, 2))
    );
    const fullTime =
      fullDistance * ((this.spaceInfo.timePerDistance * 10000) / speed);
    const timePassed = time - fleet.launchTime;
    const timeLeft = fullTime - timePassed;
    return {timeLeft, timePassed, fullTime};
  }

  isTxPerformed(txHash?: string): boolean {
    return this.privateAccount.isTxPerformed(txHash);
  }

  isCapturing(planetId: string): boolean {
    return this.privateAccount.isCapturing(planetId);
  }
  // getFleetsFrom(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
  // getFleetsTo(x: number, y: number): Fleet[] {
  //   return []; // TODO filter getFleets()
  // }
}
