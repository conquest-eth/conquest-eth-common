// const {utils, Wallet, BigNumber} = require("ethers");
import {hexConcat, hexZeroPad} from '@ethersproject/bytes';
import {keccak256} from '@ethersproject/solidity';
import {BigNumber} from '@ethersproject/bignumber';

type PlanetPointer = {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export type Planet = {
  stats: PlanetStats;
  location: PlanetLocation;
  pointer: PlanetPointer;
};

export type PlanetLocation = {
  id: string;
  x: number;
  y: number;
  subX: number;
  subY: number;
  globalX: number;
  globalY: number;
};

export type PlanetStats = {
  subX: number;
  subY: number;
  maxStake: number;
  production: number;
  attack: number;
  defense: number;
  speed: number;
  natives: number;
};

export type PlanetData = {
  location: PlanetLocation;
  type: number;
  stats: PlanetStats;
};

export class Random {
  private seed: string;
  constructor(seed: string) {
    this.seed = seed;
  }

  r_u8(r: string, i: number, mod: number): number {
    return BigNumber.from(
      keccak256(['uint256', 'bytes32', 'uint8'], [r, this.seed, i])
    )
      .mod(mod)
      .toNumber();
  }

  r_normal(r: string, i: number): number {
    const n_m7_5_sd3 =
      '0x01223334444555555666666677777777888888889999999AAAAAABBBBCCCDDEF';
    const index = this.r_u8(r, i, 64) + 2;
    return BigNumber.from('0x' + n_m7_5_sd3[index]).toNumber();
  }

  r_normalFrom(r: string, i: number, selection: string): number {
    const index = this.r_normal(r, i);
    return BigNumber.from(
      '0x' +
        selection[index * 4 + 2] +
        selection[index * 4 + 3] +
        selection[index * 4 + 4] +
        selection[index * 4 + 5]
    ).toNumber();
  }
}

export function locationToXY(location: string): {x: number; y: number} {
  let x;
  let y = 0;
  const l = location.length;
  if (l <= 34) {
    x = BigNumber.from(location).fromTwos(128).toNumber();
  } else {
    x = BigNumber.from('0x' + location.slice(l - 32))
      .fromTwos(128)
      .toNumber();
    y = BigNumber.from(location.slice(0, l - 32))
      .fromTwos(128)
      .toNumber();
  }
  return {
    x,
    y,
  };
}

function toByteString(from: number, width: number): string {
  return hexZeroPad(
    BigNumber.from(from).toTwos(width).toHexString(),
    Math.floor(width / 8)
  );
}

export function xyToLocation(x: number, y: number): string {
  const xStr = toByteString(x, 128);
  const yStr = toByteString(y, 128);

  const location = hexConcat([yStr, xStr]);
  // const check = locationToXY(location);
  // if (check.x != x || check.y != y) {
  //   throw new Error("conversion errro");
  // }
  return location;
}

export class OuterSpace {
  private genesis: Random;
  private cache: {[id: string]: PlanetData | null};

  constructor(genesisHash: string) {
    this.genesis = new Random(genesisHash);
    this.cache = {};
  }
  getPlanetStats({x, y}: {x: number; y: number}): PlanetData | null {
    const id = '' + x + ',' + y;
    const inCache = this.cache[id];
    if (typeof inCache !== 'undefined') {
      return inCache;
    }
    const _genesis = this.genesis;

    const location = xyToLocation(x, y);

    const hasPlanet = _genesis.r_u8(location, 1, 16) == 1;
    if (!hasPlanet) {
      this.cache[id] = null;
      return null;
    }

    const subX = 1 - _genesis.r_u8(location, 2, 3);
    const subY = 1 - _genesis.r_u8(location, 3, 3);

    const maxStake = _genesis.r_normalFrom(
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
        subX,
        subY,
        globalX: x * 4 + subX,
        globalY: y * 4 + subY,
      },
      type,
      stats: {
        subX,
        subY,
        maxStake,
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

  findNextPlanet(pointer?: PlanetPointer): Planet {
    let planet;
    do {
      pointer = nextInSpiral(pointer);
      planet = this.getPlanetStats(pointer);
    } while (!planet);
    return {stats: planet.stats, location: planet.location, pointer};
  }
}

// let path = [];
function nextInSpiral(pointer?: PlanetPointer): PlanetPointer {
  if (!pointer) {
    // path = [{x: 0, y: 0, dx: 0, dy: -1}];
    return {x: 0, y: 0, dx: 0, dy: -1, index: 0};
  }

  let dx = pointer.dx;
  let dy = pointer.dy;
  const x = pointer.x + dx;
  const y = pointer.y + dy;

  if (
    (x == 0 && y == -1) ||
    x == y ||
    (x < 0 && x == -y) ||
    (x > 0 && -x - 1 == y)
  ) {
    const tmp = dy;
    dy = -dx;
    dx = tmp;
  }

  // path.push({x, y, dx, dy});

  return {
    index: pointer.index + 1,
    x,
    y,
    dx,
    dy,
  };
}
