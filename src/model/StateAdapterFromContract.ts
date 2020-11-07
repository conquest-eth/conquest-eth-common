import {BigNumber} from '@ethersproject/bignumber';
import {PlanetUpdatableData, StateAdapter} from '../types';

export class StateAdapterFromContract implements StateAdapter {
  constructor(private contract: any) {}
  getPlanetUpdatableData(x: number, y: number): PlanetUpdatableData {
    // TODO get from contract
    return {
      owner: '0x0000000000000000000000000000000000000000',
      lastOwnershipTime: '0',
      lastUpdated: '0',
      numSpaceships: 0,
      productionRate: 0,
      stake: '0', // BigNumber.from(0),
    };
  }
}
