import type {PlanetInfo, SpaceInfo} from '../types';
import {Random} from '../util/Random';
import {
  LocationPointer,
  nextInSpiral,
  StrictLocationPointer,
  xyToLocation,
} from '../util/location';

export class SpaceInfoImpl implements SpaceInfo {
  private genesis: Random;
  private cache: {[id: string]: PlanetInfo | null};

  constructor(genesisHash: string) {
    this.genesis = new Random(genesisHash);
    this.cache = {};
  }
  getPlanetInfo(x: number, y: number): PlanetInfo | undefined {
    const id = '' + x + ',' + y;
    const inCache = this.cache[id];
    if (typeof inCache !== 'undefined') {
      if (inCache === null) {
        return undefined;
      }
      return inCache;
    }
    const _genesis = this.genesis;

    const location = xyToLocation(x, y);

    const hasPlanet = _genesis.r_u8(location, 1, 16) == 1;
    if (!hasPlanet) {
      this.cache[id] = null;
      return undefined;
    }

    const stake = _genesis.r_normalFrom(
      location,
      4,
      '0x0001000200030004000500070009000A000A000C000F00140019001E00320064'
    );
    const production = _genesis.r_normalFrom(
      location,
      5,
      '0x0708083409600a8c0bb80ce40e100e100e100e101068151819c81e7823282ee0'
    );
    const attack = 4000 + _genesis.r_normal(location, 6) * 400;
    const defense = 4000 + _genesis.r_normal(location, 7) * 400;
    const speed = 5010 + _genesis.r_normal(location, 8) * 334;
    const natives = 2000 + _genesis.r_normal(location, 9) * 100;

    const type = _genesis.r_u8(location, 255, 23);

    const data = {
      location: {
        id: location,
        x,
        y,
      },
      type,
      stats: {
        stake,
        production,
        attack,
        defense,
        speed,
        natives,
      },
    };
    this.cache[id] = data;
    return data;
  }

  findNextPlanet(
    pointer?: LocationPointer<PlanetInfo> | StrictLocationPointer<PlanetInfo>
  ): StrictLocationPointer<PlanetInfo> {
    do {
      pointer = nextInSpiral(pointer);
      pointer.data = this.getPlanetInfo(pointer.x, pointer.y);
    } while (!pointer.data);
    return pointer as StrictLocationPointer<PlanetInfo>;
  }
}
