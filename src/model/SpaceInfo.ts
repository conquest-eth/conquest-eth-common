import type {PlanetInfo} from '../types';
import {Random} from '../util/Random';
import {
  LocationPointer,
  nextInSpiral,
  areasArroundLocation,
  StrictLocationPointer,
  xyToLocation,
  topleftLocationFromArea,
} from '../util/location';

function skip(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1);
  });
}

export class SpaceInfo {
  private genesis: Random;
  private cache: {[id: string]: PlanetInfo | null} = {};
  private planetIdsInArea: {[zoneId: string]: string[]} = {};

  public resolveWindow: number;
  public timePerDistance: number;
  public exitDuration: number;

  constructor(config: {
    genesisHash: string;
    resolveWindow: number;
    timePerDistance: number;
    exitDuration: number;
  }) {
    this.resolveWindow = config.resolveWindow;
    this.timePerDistance = Math.floor(config.timePerDistance / 4); // Same as in OuterSpace.sol: the coordinates space is 4 times bigger
    this.exitDuration = config.exitDuration;
    this.genesis = new Random(config.genesisHash);
  }

  computeArea(areaId: string): void {
    if (this.planetIdsInArea[areaId]) {
      return;
    }
    const {x: tlx, y: tly} = topleftLocationFromArea(areaId);
    const idList = [];
    // TODO x,y = zone top left corner
    for (let x = tlx; x < tlx + 24; x++) {
      for (let y = tly; y < tly + 24; y++) {
        const planet = this.getPlanetInfo(x, y);
        if (planet) {
          idList.push(xyToLocation(x, y));
        }
      }
    }
    this.planetIdsInArea[areaId] = idList;
  }

  planetIdsFromArea(area: string): string[] {
    this.computeArea(area);
    return this.planetIdsInArea[area];
  }

  planetIdsArroundLocation(locationX: number, locationY: number): string[] {
    const areas = areasArroundLocation(locationX, locationY);
    const ids = [];
    for (const area of areas) {
      ids.push(...this.planetIdsFromArea(area));
    }
    return ids;
  }

  *yieldPlanetIdsFromArea(areaId: string): Generator<string, void> {
    const {x: tlx, y: tly} = topleftLocationFromArea(areaId);

    // TODO x,y = zone top left corner
    for (let x = tlx; x < tlx + 24; x++) {
      for (let y = tly; y < tly + 24; y++) {
        const planet = this.getPlanetInfo(x, y);
        if (planet) {
          yield xyToLocation(x, y);
        }
      }
    }
  }

  async asyncComputeArea(areaId: string): Promise<void> {
    if (this.planetIdsInArea[areaId]) {
      return;
    }
    const idList = [];
    let i = 0;
    for (const id of this.yieldPlanetIdsFromArea(areaId)) {
      idList.push(id);
      i++;
      if (i % 3 == 0) {
        await skip(); // TODO use worker instead
      }
    }

    this.planetIdsInArea[areaId] = idList;
  }

  async asyncPlanetIdsFromArea(area: string): Promise<string[]> {
    if (!this.planetIdsInArea[area]) {
      await this.asyncComputeArea(area);
    }
    return this.planetIdsInArea[area];
  }

  syncFromRect(x0: number, y0: number, x1: number, y1: number): string[] {
    const ids = [];
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const planet = this.getPlanetInfo(x, y);
        if (planet) {
          ids.push(xyToLocation(x, y));
        }
      }
    }
    return ids;
  }

  *yieldPlanetIdsFromRect(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): Generator<string, void> {
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const planet = this.getPlanetInfo(x, y);
        if (planet) {
          yield xyToLocation(x, y);
        }
      }
    }
  }

  async asyncPlanetIdsFromRect(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): Promise<string[]> {
    const idList = [];
    let i = 0;
    for (const id of this.yieldPlanetIdsFromRect(x0, y0, x1, y1)) {
      idList.push(id);
      i++;
      if (i % 6 == 0) {
        await skip(); // TODO use worker instead
      }
    }
    return idList;
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

    const subX = 1 - _genesis.r_u8(location, 2, 3);
    const subY = 1 - _genesis.r_u8(location, 3, 3);

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
    const speed = 4090 + _genesis.r_normal(location, 8) * 334;
    const natives = 2000 + _genesis.r_normal(location, 9) * 100;

    const type = _genesis.r_u8(location, 255, 23);

    const data = {
      location: {
        id: location,
        x,
        y,
        globalX: x * 4 + subX,
        globalY: y * 4 + subY,
      },
      type,
      stats: {
        stake,
        production,
        attack,
        defense,
        speed,
        natives,
        subX,
        subY,
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
