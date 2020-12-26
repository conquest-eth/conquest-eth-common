import {Planet, Space, SpaceInfo, StateAdapter} from '../types';

export class SpaceImpl implements Space {
  public resolveWindow: number;
  public timePerDistance: number;
  public exitDuration: number;

  constructor(
    private spaceInfo: SpaceInfo,
    private stateAdapter: StateAdapter
  ) {
    this.resolveWindow = this.spaceInfo.resolveWindow;
    this.timePerDistance = this.spaceInfo.timePerDistance;
    this.exitDuration = this.spaceInfo.exitDuration;
  }
  getPlanet(x: number, y: number): Planet | undefined {
    const planetInfo = this.spaceInfo.getPlanetInfo(x, y);
    if (planetInfo) {
      const planetUpdatableData = this.stateAdapter.getPlanetUpdatableData(
        x,
        y
      );
      return {
        ...planetInfo,
        state: planetUpdatableData,
        loaded: planetUpdatableData ? true : false,
      };
    } else {
      return undefined;
    }
  }

  getCurrentNumSpaceships(planet:Planet, time: number): number {
    if (planet.state) {
      if (planet.state.exitTime > 0 && time > planet.state.exitTime + this.exitDuration) {
        return 0;
      } else {
        if (planet.state.active) {
          return planet.state.numSpaceships + (Math.floor(((time - planet.state.lastUpdated) * planet.stats.production) / (60 * 60)));
        } else {
          return planet.state.numSpaceships;
        }
      }
    }
    return 0;
  }

  isActive(planet: Planet, time: number): boolean {
    return planet.state ? (planet.state.active && (planet.state.exitTime === 0 || planet.state.exitTime + this.exitDuration >= time)) : false;
  }

  isExiting(planet: Planet, time: number): boolean {
    return planet.state ? planet.state.exitTime > 0 && (planet.state.exitTime + this.exitDuration) > time : false;
  }


  exitRatio(planet: Planet, time: number): number {
    return planet.state ? (planet.state.exitTime === 0 ? Number.MAX_SAFE_INTEGER : (time - planet.state.exitTime) / this.exitDuration) : Number.MAX_SAFE_INTEGER;
  }

}
