import {BigNumber} from '@ethersproject/bignumber';
import {PlanetUpdatableData, StateAdapter} from '../types';

export class StateAdapterFromContract implements StateAdapter {
  constructor(private contract: any) {}
  isPlanetLoaded(x: number, y: number): boolean {
    return true;
  }
  getPlanetUpdatableData(x: number, y: number): PlanetUpdatableData {
    // TODO get from contract
    return {
      owner: '0x0000000000000000000000000000000000000000',
      lastUpdated: BigNumber.from('0'),
      numSpaceships: BigNumber.from('0'),
    };
  }
}
