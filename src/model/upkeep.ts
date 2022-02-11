export type FakePlanet = {
  stats: {
    production: number;
    maxUpkeep: number;
  };
  world: {
    externalUpKeepDuration: number;
    externalUpkeepDownRate: number;
  };
  numSpaceships: number;
  lastUpdate: number;
  externalUpkeep: number;
  externalUpkeepDuration: number;
};

export function days(num: number): number {
  return Math.floor(num * 24 * 3600);
}

export const DEFAULT_UPKEEP_DURATION_IN_SECONDS = days(1);
export const DEFAULT_PRODUCTION_PER_HOUR = 3600;
export const DEFAULT_MAX_UPKEEP = (DEFAULT_PRODUCTION_PER_HOUR * days(3)) / 3600;

export function peek(planet: FakePlanet, timeDelta: number) {
  const timeElapsed = timeDelta; // time - planet.lastUpdate;
  if (timeElapsed < 0) {
    throw new Error(`canno go backward`);
  }

  const oldSpaceships = planet.numSpaceships;

  let externalArea = 0;
  if (planet.externalUpkeep > 0) {
    const actualTime = Math.min(planet.externalUpkeepDuration, timeElapsed);
    const decrease = Math.min(planet.world.externalUpkeepDownRate * actualTime, planet.externalUpkeep);
    const externalDecreaseArea = (decrease * actualTime) / 2;

    const externalStaticArea = planet.externalUpkeep * actualTime;
    externalArea = externalDecreaseArea + externalStaticArea;
    planet.externalUpkeep -= decrease;
    planet.externalUpkeepDuration -= actualTime;
    if (planet.externalUpkeep < 0) {
      planet.externalUpkeep = 0;
      planet.externalUpkeepDuration = 0;
    }
  }

  if (planet.numSpaceships >= planet.stats.maxUpkeep) {
    planet.numSpaceships = planet.numSpaceships - (timeElapsed * planet.stats.production) / 2; // TODO
    if (planet.numSpaceships < planet.stats.maxUpkeep) {
      planet.numSpaceships = planet.stats.maxUpkeep;
    }
    if (planet.numSpaceships < 0) {
      planet.numSpaceships = 0;
    }
  } else {
    if (timeElapsed > 0) {
      planet.numSpaceships =
        planet.numSpaceships +
        (timeElapsed *
          planet.stats.production *
          (Math.max(0, planet.stats.maxUpkeep * timeElapsed - externalArea) / (planet.stats.maxUpkeep * timeElapsed))) /
          3600;
    }

    if (planet.numSpaceships > planet.stats.maxUpkeep) {
      planet.numSpaceships = planet.stats.maxUpkeep;
    }

    if (planet.numSpaceships < 0) {
      console.log(planet, oldSpaceships);
      planet.numSpaceships = 0;
    }
  }
  planet.lastUpdate += timeElapsed;

  if (isNaN(planet.numSpaceships)) {
    console.log(planet, {timeElapsed, oldSpaceships});
  } else {
    console.log({numSpaceships: planet.numSpaceships, numDays: Math.floor((timeElapsed / (24 * 3600)) * 100) / 100});
  }
  // console.log({numSpaceships: planet.numSpaceships, externalArea, maxUpKeepForThatPeriod});
  // console.log({newSpaceships, spaceships: planet.numSpaceships, maxUpKeepForThatPeriod, totalArea});
  // console.log(planet);
}

export function send(planet: FakePlanet, time: number, quantity: number) {
  peek(planet, time);
  if (quantity < 0) {
    throw new Error(`cannot send negative spaceships`);
  }
  if (quantity > planet.numSpaceships) {
    throw new Error(`not enough spaceships, only have ${planet.numSpaceships}, cannot send ${quantity}`);
  }
  if (quantity === 0) {
    return;
  }

  planet.numSpaceships -= quantity;

  if (planet.externalUpkeep === 0) {
    planet.externalUpkeep = quantity;
    planet.externalUpkeepDuration = planet.world.externalUpKeepDuration;
  } else {
    let newDuration = planet.externalUpkeepDuration;
    if (quantity / planet.world.externalUpkeepDownRate > newDuration) {
      newDuration = quantity / planet.world.externalUpkeepDownRate;
    }
    if (newDuration > planet.world.externalUpKeepDuration) {
      newDuration = planet.world.externalUpKeepDuration; // TODO update equation
    }
    let newUpKeep = 0;
    if (newDuration > 0) {
      // newUpKeep =
      //   (-planet.world.externalUpkeepDownRate * planet.externalUpkeepDuration * planet.externalUpkeepDuration +
      //     2 * newDuration * quantity +
      //     2 * planet.externalUpkeepDuration * planet.externalUpkeep) /
      //   (2 * newDuration);
      newUpKeep =
        (newDuration * newDuration * planet.world.externalUpkeepDownRate -
          planet.world.externalUpkeepDownRate * planet.externalUpkeepDuration * planet.externalUpkeepDuration +
          2 * newDuration * quantity +
          2 * planet.externalUpkeepDuration * planet.externalUpkeep) /
        (2 * newDuration);
    } else {
      console.log('negative newDuration', planet);
    }

    planet.externalUpkeep = newUpKeep;
    planet.externalUpkeepDuration = newDuration;
    if (planet.externalUpkeep < 0) {
      console.log(`external upkepp negative`, planet, {
        newDuration,
        t: planet.externalUpkeepDuration,
        R: planet.world.externalUpkeepDownRate,
      });
      planet.externalUpkeep = 0;
      planet.externalUpkeepDuration = 0;
    }
  }
  // console.log({afterSend: planet.numSpaceships});
  console.log(planet);
}
