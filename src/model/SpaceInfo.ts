// import {Writable, writable} from 'svelte/store';
import type {PlanetInfo, PlanetState} from '../types';
import {keccak256} from '@ethersproject/solidity';
import {
  LocationPointer,
  nextInSpiral,
  areasArroundLocation,
  StrictLocationPointer,
  xyToLocation,
  topleftLocationFromArea,
  locationToXY,
} from '../util/location';
import {normal16, normal8, value8Mod} from '../util/extraction';
import {uniqueName} from '../random/uniqueName'; // TODO in common
import {BigNumber} from '@ethersproject/bignumber';

function skip(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1);
  });
}

const GIFT_TAX_PER_10000 = 2500; // TODO linkedData from contract

// TODO remove duplicate in playersQuery
type Player = {
  address: string;
  alliances: {address: string; ally: boolean}[];
};

// TODO remove duplication , see send.ts
function findCommonAlliances(arr1: string[], arr2: string[]): string[] {
  const result = [];
  for (const item1 of arr1) {
    if (arr2.indexOf(item1) !== -1) {
      result.push(item1);
    }
  }
  return result;
}

// type Mutable<T> = {
//   -readonly [k in keyof T]: T[k];
// };

export class SpaceInfo {
  private readonly genesis: string;
  private readonly cache: {[id: string]: PlanetInfo | null} = {};
  private readonly locationCache: {[id: string]: PlanetInfo | null} = {};
  // private readonly planetIdsInArea: {[zoneId: string]: string[]} = {};

  public readonly resolveWindow: number;
  public readonly timePerDistance: number;
  public readonly exitDuration: number;
  public readonly acquireNumSpaceships: number;
  public readonly productionSpeedUp: number;
  public readonly productionCapAsDuration: number;

  // public readonly planetsOnFocus: PlanetInfo[] = [];
  // private lastFocus: {x0: number; y0: number; x1: number; y1: number} = {x0: 0, y0: 0, x1: 0, y1: 0};
  // private store: Writable<PlanetInfo[]>;

  constructor(config: {
    genesisHash: string;
    resolveWindow: number;
    timePerDistance: number;
    exitDuration: number;
    acquireNumSpaceships: number;
    productionSpeedUp: number;
    productionCapAsDuration: number;
  }) {
    this.resolveWindow = config.resolveWindow;
    this.timePerDistance = Math.floor(config.timePerDistance / 4); // Same as in OuterSpace.sol: the coordinates space is 4 times bigger
    this.exitDuration = config.exitDuration;
    this.acquireNumSpaceships = config.acquireNumSpaceships;
    this.productionSpeedUp = config.productionSpeedUp;
    this.productionCapAsDuration = config.productionCapAsDuration;
    this.genesis = config.genesisHash;
    // this.store = writable(this.planetsOnFocus);
  }

  // subscribe(run: (value: PlanetInfo[]) => void, invalidate?: (value?: PlanetInfo[]) => void): () => void {
  //   return this.store.subscribe(run, invalidate);
  // }

  // computeArea(areaId: string): void {
  //   if (this.planetIdsInArea[areaId]) {
  //     return;
  //   }
  //   const {x: tlx, y: tly} = topleftLocationFromArea(areaId);
  //   const idList = [];
  //   // TODO x,y = zone top left corner
  //   for (let x = tlx; x < tlx + 24; x++) {
  //     for (let y = tly; y < tly + 24; y++) {
  //       const planet = this.getPlanetInfo(x, y);
  //       if (planet) {
  //         idList.push(xyToLocation(x, y));
  //       }
  //     }
  //   }
  //   this.planetIdsInArea[areaId] = idList;
  // }

  // planetIdsFromArea(area: string): string[] {
  //   this.computeArea(area);
  //   return this.planetIdsInArea[area];
  // }

  // planetIdsArroundLocation(locationX: number, locationY: number): string[] {
  //   const areas = areasArroundLocation(locationX, locationY);
  //   const ids = [];
  //   for (const area of areas) {
  //     ids.push(...this.planetIdsFromArea(area));
  //   }
  //   return ids;
  // }

  // *yieldPlanetIdsFromArea(areaId: string): Generator<string, void> {
  //   const {x: tlx, y: tly} = topleftLocationFromArea(areaId);

  //   // TODO x,y = zone top left corner
  //   for (let x = tlx; x < tlx + 24; x++) {
  //     for (let y = tly; y < tly + 24; y++) {
  //       const planet = this.getPlanetInfo(x, y);
  //       if (planet) {
  //         yield xyToLocation(x, y);
  //       }
  //     }
  //   }
  // }

  // async asyncComputeArea(areaId: string): Promise<void> {
  //   if (this.planetIdsInArea[areaId]) {
  //     return;
  //   }
  //   const idList = [];
  //   let i = 0;
  //   for (const id of this.yieldPlanetIdsFromArea(areaId)) {
  //     idList.push(id);
  //     i++;
  //     if (i % 3 == 0) {
  //       await skip(); // TODO use worker instead
  //     }
  //   }

  //   this.planetIdsInArea[areaId] = idList;
  // }

  // async asyncPlanetIdsFromArea(area: string): Promise<string[]> {
  //   if (!this.planetIdsInArea[area]) {
  //     await this.asyncComputeArea(area);
  //   }
  //   return this.planetIdsInArea[area];
  // }

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

  // *yieldPlanetIdsFromRect(x0: number, y0: number, x1: number, y1: number): Generator<string, void> {
  //   for (let x = x0; x <= x1; x++) {
  //     for (let y = y0; y <= y1; y++) {
  //       const planet = this.getPlanetInfo(x, y);
  //       if (planet) {
  //         yield xyToLocation(x, y);
  //       }
  //     }
  //   }
  // }

  // async asyncPlanetIdsFromRect(x0: number, y0: number, x1: number, y1: number): Promise<string[]> {
  //   const idList = [];
  //   let i = 0;
  //   for (const id of this.yieldPlanetIdsFromRect(x0, y0, x1, y1)) {
  //     idList.push(id);
  //     i++;
  //     if (i % 6 == 0) {
  //       await skip(); // TODO use worker instead
  //     }
  //   }
  //   return idList;
  // }

  *yieldPlanetsFromRect(x0: number, y0: number, x1: number, y1: number): Generator<PlanetInfo, void> {
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const id = '' + x + ',' + y; // TODO optimize ?
        const inCache = this.cache[id];
        const planet = this.getPlanetInfo(x, y);
        if (planet) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (planet as any).inCache = inCache;
          yield planet;
        }
      }
    }
  }

  async asyncPlanetsFromRect(x0: number, y0: number, x1: number, y1: number): Promise<PlanetInfo[]> {
    const planets = [];
    let i = 0;
    for (const planet of this.yieldPlanetsFromRect(x0, y0, x1, y1)) {
      planets.push(planet);
      i++;
      if (i % 6 == 0) {
        await skip(); // TODO use worker instead
      }
    }
    return planets;
  }

  getPlanetInfoViaId(id: string): PlanetInfo | undefined {
    const inCache = this.locationCache[id];
    if (typeof inCache !== 'undefined') {
      if (inCache === null) {
        return undefined;
      }
      return inCache;
    }
    const {x, y} = locationToXY(id);
    return this.getPlanetInfo(x, y);
  }

  getPlanetInfo(x: number, y: number): PlanetInfo | undefined {
    // if (x === 0 && y === 0) {
    //   return {
    //     location: {
    //       id: xyToLocation(x, y),
    //       x,
    //       y,
    //       globalX: x * 4 + 1,
    //       globalY: y * 4 + 0,
    //     },
    //     type: 1,
    //     stats: {
    //       name: 'zero',
    //       stake: 1,
    //       production: 1,
    //       attack: 1,
    //       defense: 1,
    //       speed: 1,
    //       natives: 1,
    //       // subX: 0,
    //       // subY: 0,
    //     },
    //   };
    // }

    const id = '' + x + ',' + y; // TODO optimize ?
    const inCache = this.cache[id];
    if (typeof inCache !== 'undefined') {
      if (inCache === null) {
        return undefined;
      }
      return inCache;
    }

    const location = xyToLocation(x, y);

    const data = keccak256(['bytes32', 'uint256'], [this.genesis, location]);

    const hasPlanet = value8Mod(data, 52, 16) == 1;
    if (!hasPlanet) {
      this.cache[id] = null;
      return undefined;
    }

    const subX = 1 - value8Mod(data, 0, 3);
    const subY = 1 - value8Mod(data, 2, 3);

    const stakeRange = [4, 5, 5, 10, 10, 15, 15, 20, 20, 30, 30, 40, 40, 80, 80, 100];
    const productionIndex = normal8(data, 12);
    const offset = normal16(data, 4, '0x0000000100010002000200030003000400040005000500060006000700070008');
    let stakeIndex = productionIndex + offset;
    if (stakeIndex < 4) {
      stakeIndex = 0;
    } else if (stakeIndex > 19) {
      stakeIndex = 15;
    } else {
      stakeIndex -= 4;
    }
    const stake = stakeRange[stakeIndex];

    const production = normal16(data, 12, '0x0708083409600a8c0bb80ce40e100e100e100e101068151819c81e7823282ee0');
    const attackRoll = normal8(data, 20);
    const attack = 4000 + attackRoll * 400;
    const defenseRoll = normal8(data, 28);
    const defense = 4000 + defenseRoll * 400;
    const speedRoll = normal8(data, 36);
    const speed = 5005 + speedRoll * 333;
    const natives = 15000 + normal8(data, 44) * 3000;

    // const type = value8Mod(data, 60, 23);
    const attackGrade = attackRoll < 6 ? 0 : attackRoll < 10 ? 1 : 2;
    const defenseGrade = defenseRoll < 6 ? 0 : defenseRoll < 10 ? 1 : 2;
    const speedGrade = speedRoll < 6 ? 0 : speedRoll < 10 ? 1 : 2;

    const type = attackGrade * 9 + defenseGrade * 3 + speedGrade;

    const name = uniqueName(2, location);

    const planetObj = {
      location: {
        id: location,
        x,
        y,
        globalX: x * 4 + subX,
        globalY: y * 4 + subY,
      },
      type,
      stats: {
        name,
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
    // console.log(JSON.stringify(planetObj);
    this.cache[id] = planetObj;
    this.locationCache[planetObj.location.id] = planetObj;
    return planetObj;
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

  timeLeft(
    time: number,
    fromPlanet: PlanetInfo,
    toPlanet: PlanetInfo,
    startTime: number
  ): {timeLeft: number; timePassed: number; fullTime: number} {
    const speed = fromPlanet.stats.speed;
    const fullDistance = this.distance(fromPlanet, toPlanet);
    const fullTime = fullDistance * ((this.timePerDistance * 10000) / speed);
    const timePassed = time - startTime;
    const timeLeft = fullTime - timePassed;
    return {timeLeft, timePassed, fullTime};
  }

  distance(fromPlanet: PlanetInfo, toPlanet: PlanetInfo): number {
    const gFromX = fromPlanet.location.globalX;
    const gFromY = fromPlanet.location.globalY;
    const gToX = toPlanet.location.globalX;
    const gToY = toPlanet.location.globalY;

    const fullDistance = Math.floor(Math.sqrt(Math.pow(gToX - gFromX, 2) + Math.pow(gToY - gFromY, 2)));
    return fullDistance;
  }

  timeToArrive(fromPlanet: PlanetInfo, toPlanet: PlanetInfo): number {
    return this.timeLeft(0, fromPlanet, toPlanet, 0).timeLeft;
  }

  numSpaceshipsAtArrival(
    fromPlanet: PlanetInfo,
    toPlanet: PlanetInfo,
    toPlanetState: PlanetState
  ): {min: number; max: number} {
    const duration = this.timeToArrive(fromPlanet, toPlanet);
    // TODO extract
    const numSpaceships = toPlanetState.numSpaceships;

    if (!toPlanetState.active) {
      return {min: numSpaceships, max: numSpaceships};
    }

    let maxIncrease = Math.pow(2, 31);
    if (this.productionCapAsDuration && this.productionCapAsDuration > 0) {
      const cap =
        this.acquireNumSpaceships +
        (this.productionCapAsDuration * toPlanet.stats.production * this.productionSpeedUp) / (60 * 60);
      if (numSpaceships > cap) {
        maxIncrease = 0;
      } else {
        maxIncrease = cap - numSpaceships;
      }
    }

    let increaseForMinScenario = Math.floor(
      (duration * toPlanet.stats.production * this.productionSpeedUp) / (60 * 60)
    );
    if (increaseForMinScenario > maxIncrease) {
      increaseForMinScenario = maxIncrease;
    }

    let increaseForMaxScenario = Math.floor(
      ((duration + this.resolveWindow) * toPlanet.stats.production * this.productionSpeedUp) / (60 * 60)
    );
    if (increaseForMaxScenario > maxIncrease) {
      increaseForMaxScenario = maxIncrease;
    }

    return {
      min: numSpaceships + increaseForMinScenario,
      max: numSpaceships + increaseForMaxScenario,
    };
  }

  outcome(
    fromPlanet: PlanetInfo,
    fromPlanetState: PlanetState,
    toPlanet: PlanetInfo,
    toPlanetState: PlanetState,
    fleetAmount: number,
    time: number,
    fromPlayer: Player,
    toPlayer: Player,
    gift?: boolean
  ): {
    min: {captured: boolean; numSpaceshipsLeft: number};
    max: {captured: boolean; numSpaceshipsLeft: number};
    allies: boolean;
    giving?: {tax: number; loss: number};
    timeUntilFails: number;
  } {
    const {min, max} = this.numSpaceshipsAtArrival(fromPlanet, toPlanet, toPlanetState);
    const numDefenseMin = BigNumber.from(min);
    const numDefenseMax = BigNumber.from(max);
    let numAttack = BigNumber.from(fleetAmount);

    let allies = false;
    if (toPlayer) {
      if (toPlayer.address === fromPlayer?.address) {
        allies = true;
      } else if (fromPlayer) {
        if (toPlayer.alliances.length > 0 && fromPlayer.alliances.length > 0) {
          const potentialAlliances = findCommonAlliances(
            toPlayer.alliances.map((v) => v.address),
            fromPlayer.alliances.map((v) => v.address)
          );
          console.log({potentialAlliances});
          if (potentialAlliances.length > 0) {
            allies = true;
          }
        }
      }
    }

    if (gift) {
      let loss = 0;
      if (!allies) {
        loss = numAttack.mul(GIFT_TAX_PER_10000).div(10000).toNumber();
        numAttack = numAttack.sub(loss);
      }
      return {
        min: {
          captured: false,
          numSpaceshipsLeft: numDefenseMin.add(numAttack).toNumber(),
        },
        max: {
          captured: false,
          numSpaceshipsLeft: numDefenseMax.add(numAttack).toNumber(),
        },
        timeUntilFails: 0,
        allies,
        giving: {
          tax: GIFT_TAX_PER_10000,
          loss,
        },
      };
    }

    if (numAttack.eq(0)) {
      return {
        min: {
          captured: false,
          numSpaceshipsLeft: numDefenseMin.toNumber(),
        },
        max: {
          captured: false,
          numSpaceshipsLeft: numDefenseMax.toNumber(),
        },
        allies,
        timeUntilFails: 0,
      };
    }

    // TODO if only: numDefenseMin.eq(0)
    if (numDefenseMax.eq(0)) {
      return {
        min: {
          captured: true,
          numSpaceshipsLeft: numAttack.toNumber(),
        },
        max: {
          captured: true,
          numSpaceshipsLeft: numAttack.toNumber(),
        },
        allies,
        timeUntilFails: 0,
      };
    }

    const minOutcome = {
      captured: false,
      numSpaceshipsLeft: 0,
    };
    const maxOutcome = {
      captured: false,
      numSpaceshipsLeft: 0,
    };

    const resultMin = this.combat(fromPlanet.stats.attack, numAttack, toPlanet.stats.defense, numDefenseMin);
    if (resultMin.attackerLoss.eq(numAttack)) {
      minOutcome.captured = false;
      minOutcome.numSpaceshipsLeft = toPlanetState.natives
        ? toPlanet.stats.natives
        : numDefenseMin.sub(resultMin.defenderLoss).toNumber();
    } else {
      minOutcome.captured = true;
      minOutcome.numSpaceshipsLeft = numAttack.sub(resultMin.attackerLoss).toNumber();
    }

    const resultMax = this.combat(fromPlanet.stats.attack, numAttack, toPlanet.stats.defense, numDefenseMax);
    if (resultMax.attackerLoss.eq(numAttack)) {
      maxOutcome.captured = false;
      maxOutcome.numSpaceshipsLeft = toPlanetState.natives
        ? toPlanet.stats.natives
        : numDefenseMax.sub(resultMax.defenderLoss).toNumber();
    } else {
      maxOutcome.captured = true;
      maxOutcome.numSpaceshipsLeft = numAttack.sub(resultMax.attackerLoss).toNumber();
    }

    let timeUntilFails = 0;
    if (minOutcome.captured) {
      const production = numDefenseMax.sub(numDefenseMin).mul(1000000).div(this.resolveWindow);
      if (production.gt(0)) {
        timeUntilFails = resultMin.attackDamage.sub(numDefenseMin).mul(1000000).div(production).toNumber();
        if (timeUntilFails > this.resolveWindow) {
          timeUntilFails = 0;
        }
      }
    }

    return {min: minOutcome, max: maxOutcome, allies, timeUntilFails};
  }

  combat(
    attack: number,
    numAttack: BigNumber,
    defense: number,
    numDefense: BigNumber
  ): {defenderLoss: BigNumber; attackerLoss: BigNumber; attackDamage: BigNumber} {
    const attackDamage = numAttack.mul(attack).div(defense);

    if (numAttack.eq(0) || numDefense.eq(0)) {
      return {defenderLoss: BigNumber.from(0), attackerLoss: BigNumber.from(0), attackDamage};
    }

    if (numDefense.gt(attackDamage)) {
      // attack fails
      return {
        attackerLoss: numAttack, // all attack destroyed
        defenderLoss: attackDamage, // 1 spaceship will be left at least as defenderLoss < numDefense
        attackDamage,
      };
    } else {
      // attack succeed
      let defenseDamage = numDefense.mul(defense).div(attack);
      if (defenseDamage.gte(numAttack)) {
        defenseDamage = numAttack.sub(1);
      }
      return {
        attackerLoss: defenseDamage,
        defenderLoss: numDefense, // all defense destroyeda
        attackDamage,
      };
    }
  }

  simulateCapture(
    from: string,
    planetInfo: PlanetInfo,
    planetState: PlanetState
  ): {
    success: boolean;
    numSpaceshipsLeft: number;
  } {
    console.log(planetState.owner, from);
    if (planetState.owner && planetState.owner.toLowerCase() === from.toLowerCase()) {
      return {
        success: true,
        numSpaceshipsLeft: planetState.numSpaceships + 100000, // TODO use contract _acquireNumSpaceships
      };
    }

    // Do not allow staking over occupied planets
    if (!planetState.natives) {
      if (planetState.numSpaceships > 0) {
        return {
          success: false,
          numSpaceshipsLeft: planetState.numSpaceships,
        };
      }
    }

    const numDefense = planetState.natives ? planetInfo.stats.natives : planetState.numSpaceships;
    const {attackerLoss} = this.combat(
      10000,
      BigNumber.from(100000), // TODO use contract _acquireNumSpaceships
      planetInfo.stats.defense,
      BigNumber.from(numDefense)
    );

    if (attackerLoss.lt(100000)) {
      return {
        success: true,
        numSpaceshipsLeft: 100000 - attackerLoss.toNumber(),
      };
    } else {
      return {
        success: false,
        numSpaceshipsLeft: planetState.numSpaceships,
      };
    }
  }
}
