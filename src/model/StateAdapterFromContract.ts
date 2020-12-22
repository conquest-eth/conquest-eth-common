import {PlanetUpdatableData, StateAdapter} from '../types';

export class StateAdapterFromContract implements StateAdapter {
  constructor(private contract: any) {}
  getPlanetUpdatableData(x: number, y: number): PlanetUpdatableData {
    // TODO get from contract
    return {
      owner: '0x0000000000000000000000000000000000000000',
      lastUpdated: 0,
      numSpaceships: 0,
      active: false,
      exitTime: 0
    };
  }
}
