// export type FakePlanet = {
//   stats: {
//     production: number;
//     maxUpkeep: number;
//   };
//   world: {
//     externalUpKeepDuration: number;
//   };
//   numSpaceships: number;
//   lastUpdate: number;
//   externalUpkeep: number;
//   externalUpkeepDownRate: number;
// };

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

// export function peek(planet: FakePlanet, time: number) {
//   const timeElapsed = time - planet.lastUpdate;
//   if (timeElapsed < 0) {
//     throw new Error(`canno go backward`);
//   }
//   const staticArea = planet.numSpaceships * timeElapsed;
//   const newSpaceshipsProduced = (planet.stats.production * timeElapsed) / 3600;
//   const productionArea = (newSpaceshipsProduced * timeElapsed) / 2;

//   let externalArea = 0;
//   if (planet.externalUpkeep > 0) {
//     const decrease = Math.min(planet.externalUpkeepDownRate * timeElapsed, planet.externalUpkeep);
//     const externalDecreaseArea = (decrease * timeElapsed) / 2;

//     const externalStaticArea = planet.externalUpkeep * timeElapsed;
//     externalArea = externalDecreaseArea + externalStaticArea;
//     planet.externalUpkeep -= decrease;
//   }

//   const totalArea = staticArea + productionArea + externalArea;

//   const maxUpKeepForThatPeriod = planet.stats.maxUpkeep * timeElapsed;
//   const maxRatio = totalArea / maxUpKeepForThatPeriod;

//   let spaceshipsDestroyedByUpkeep = 0;
//   if (maxRatio >= 1) {
//     // console.log(`max ratio reached : ${totalArea} vs ${planet.stats.maxUpkeep}`);
//     // console.log({totalArea, staticArea, productionArea, newSpaceshipsProduced, timeElapsed});
//     // spaceshipsDestroyedByUpkeep = maxRatio * planet.stats.production * timeElapsed;
//     spaceshipsDestroyedByUpkeep = newSpaceshipsProduced;
//   }

//   const newSpaceships = newSpaceshipsProduced - spaceshipsDestroyedByUpkeep;
//   planet.numSpaceships += newSpaceships;
//   console.log({numSpaceships: planet.numSpaceships});
//   // console.log({numSpaceships: planet.numSpaceships, externalArea, maxUpKeepForThatPeriod});
//   // console.log({newSpaceships, spaceships: planet.numSpaceships, maxUpKeepForThatPeriod, totalArea});
// }

export function peek(planet: FakePlanet, time: number) {
  const timeElapsed = time - planet.lastUpdate;
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
  if (isNaN(planet.numSpaceships)) {
    console.log(planet, {timeElapsed, oldSpaceships});
  } else {
    console.log({numSpaceships: planet.numSpaceships});
  }

  // console.log({numSpaceships: planet.numSpaceships, externalArea, maxUpKeepForThatPeriod});
  // console.log({newSpaceships, spaceships: planet.numSpaceships, maxUpKeepForThatPeriod, totalArea});
  // console.log(planet);
}

// export function send(planet: FakePlanet, time: number, quantity: number) {
//   peek(planet, time);
//   if (quantity < 0) {
//     throw new Error(`cannot send negative spaceships`);
//   }
//   if (quantity > planet.numSpaceships) {
//     throw new Error(`not enough spaceships`);
//   }
//   if (quantity === 0) {
//     return;
//   }

//   planet.numSpaceships -= quantity;

//   if (planet.externalUpkeep === 0) {
//     planet.externalUpkeep = quantity;
//     planet.externalUpkeepDownRate = quantity / planet.world.externalUpKeepDuration;
//   } else {
//     const durationLeft = planet.externalUpkeep / planet.externalUpkeepDownRate;
//     const extraUpkeep = quantity;
//     const newDuration = planet.world.externalUpKeepDuration;
//     const newUpKeep = (planet.externalUpkeep * durationLeft + extraUpkeep * newDuration) / newDuration;
//     planet.externalUpkeep = newUpKeep;
//     planet.externalUpkeepDownRate = planet.externalUpkeep / planet.world.externalUpKeepDuration;
//   }
// }

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
    let newUpKeep = 0;
    if (newDuration > 0) {
      newUpKeep =
        (-planet.world.externalUpkeepDownRate * planet.externalUpkeepDuration * planet.externalUpkeepDuration +
          2 * newDuration * quantity +
          2 * planet.externalUpkeepDuration * planet.externalUpkeep) /
        (2 * newDuration);
    } else {
      console.log(planet);
    }

    planet.externalUpkeep = newUpKeep;
    planet.externalUpkeepDuration = newDuration;
    if (planet.externalUpkeep < 0) {
      planet.externalUpkeep = 0;
      planet.externalUpkeepDuration = 0;
    }
  }
}
