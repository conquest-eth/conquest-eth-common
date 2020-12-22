import {Planet, Space, SpaceInfo, StateAdapter} from '../types';

export class SpaceImpl implements Space {
  public resolveWindow: number;
  public timePerDistance: number;

  constructor(
    private spaceInfo: SpaceInfo,
    private stateAdapter: StateAdapter
  ) {
    this.resolveWindow = this.spaceInfo.resolveWindow;
    this.timePerDistance = this.spaceInfo.timePerDistance;
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
}
