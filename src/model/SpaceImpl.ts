import {Planet, Space, SpaceInfo, StateAdapter} from '../types';

export class SpaceImpl implements Space {
  constructor(
    private spaceInfo: SpaceInfo,
    private stateAdapter: StateAdapter
  ) {}
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
        loaded: this.stateAdapter.isPlanetLoaded(x, y),
      };
    } else {
      return undefined;
    }
  }
}
