import {Planet, PlanetContractState} from '../types';
import { SpaceInfo } from './SpaceInfo';
import {xyToLocation, areasArroundLocation, locationToXY} from '../util/location';

export type PlanetData = PlanetContractState & {id: string};

export type TimeKeeper = {
  setTimeout: (fn: () => void, sec: number) => unknown;
  getTime: () => number;
}

export type PlanetFetch = (ids: string[]) => Promise<PlanetData[]>

type PlanetRecord = {
  contractState?: PlanetContractState; // TODO optional ?
  planet: Planet;
}

export class Space {

  private planetRecords: Record<string, PlanetRecord | undefined> = {};
  private planetIdsToUpdate: string[] = [];
  private lastX: number | undefined = undefined;;
  private lastY: number | undefined = undefined;
  private lastCenterArea: string | undefined = undefined;
  private fetchingCounter = 0;

  private planetListeners: Record<string, number[] | undefined> = {};
  private listenerIndex = 0;
  private listeners: Record<number, (planet: Planet) => void> = {};

  constructor(public spaceInfo: SpaceInfo, private fetch: PlanetFetch, private timeKeeper: TimeKeeper) {
   this._timeBasedUpdate();
  }

  // THIS have the whole planet postiion synchronously
  // planetAt(x: number, y: number): Planet | undefined {
  //   const location = xyToLocation(x, y); // TODO speed up ?
  //   const planetInfo = this.spaceInfo.getPlanetInfo(x, y);
  //   if (planetInfo) {
  //     const planetRecord = this.planetRecords[location];
  //     if (planetRecord) {
  //       return planetRecord.planet;
  //     } else {
  //       return {
  //         ...planetInfo,
  //         state: undefined,
  //         loaded: false
  //       };
  //     }
  //   }
  //   return undefined;
  // }

  planetAt(x: number, y: number): Planet | undefined {
    const location = xyToLocation(x, y); // TODO speed up ?
    const planetRecord = this.planetRecords[location];
    if (planetRecord) {
      return planetRecord.planet;
    }
    return undefined;
  }

  ensurePlanetAt(x: number, y: number): Planet {
    const location = xyToLocation(x, y); // TODO speed up ?
    const planetRecord = this.planetRecords[location];
    // TODO add to focus
    if (planetRecord) {
      return planetRecord.planet;
    }
    const planetInfo = this.spaceInfo.getPlanetInfo(x, y);
    if (!planetInfo) {
      throw new Error(`no planet info for a fetched planet `)
    }
    // TODO fetch contract state and add focus
    return {
        ...planetInfo,
        state: undefined,
        loaded: false
    };
  }

  onPlannetUpdates(location: string, func: (planet: Planet) => void) : number {
    this.listenerIndex++;
    this.listeners[this.listenerIndex] = func;
    let currentListeners = this.planetListeners[location];
    if (!currentListeners) {
      currentListeners = [];
    }
    currentListeners.push(this.listenerIndex);
    this.planetListeners[location] = currentListeners;
    return this.listenerIndex;
  }

  switchOffPlanetUpdates(listenerIndex: number): void {
    delete this.listeners[listenerIndex];
  }

  async focus(locationX: number, locationY: number): Promise<void> {
    if (locationX !== this.lastX || locationY !== this.lastY) {
      this.lastX = locationX;
      this.lastY = locationY;
      const areas = areasArroundLocation(locationX, locationY);
      const centerArea = areas[0];
      if (this.lastCenterArea !== centerArea) {
        this.lastCenterArea = centerArea;
        this.fetchingCounter++;
        this._startFetching(this.fetchingCounter, areas);
      }
    }
  }

  private _setPlanet(planetId: string, planetRecord: PlanetRecord) {
    this.planetRecords[planetId] = planetRecord;
    this._updatePlanetRecord(planetId, this.timeKeeper.getTime());
  }

  private _callListeners(planetId: string, planet: Planet) {
    const listeners = this.planetListeners[planetId];
    if (listeners) {
      const num = listeners.length;
      for (let i = 0; i < num; i++) {
        const listenerIndex = listeners[i];
        const listener = this.listeners[listenerIndex];
        if (listener) {
          listener(planet);
        } else {
          listeners.splice(i,1);
          // i--;
        }
      }
    }
  }

  private async _startFetching(fetchingCounterOnFetch: number, areas: string[]) {
    console.log("START FETCHING...");
    this.planetIdsToUpdate.splice(0, this.planetIdsToUpdate.length);
    for (const area of areas) {
      try {
        // COMPUTE PLANETINFO
        const locations = await this.spaceInfo.asyncPlanetIdsFromArea(area);
        // console.log({locations});

        // SETUP PLANET RECORD WITH EMPTY CONTRACT STATE
        for (const location of locations) {
          const planetRecord = this.planetRecords[location];
          if (!planetRecord) {
            const xy = locationToXY(location); // TODO speed up
            const planetInfo = this.spaceInfo.getPlanetInfo(xy.x, xy.y); // TODO getPlanetInfo should take a location ?
            if (!planetInfo) {
              throw new Error(`no planet infor for a fetched planet `)
            }
            this._setPlanet(location, {
              planet: {
                ...planetInfo,
                state: undefined,
                loaded: false
              }
            })
          }

        }

        // console.log({planetIds});
        const planetDatas = await this.fetch(locations);
        if (fetchingCounterOnFetch !== this.fetchingCounter) {
          return; // discard pending ? // TODO more complex (blockNumber?)
        }

        // console.log({planetDatas});
        for (let i = 0; i < planetDatas.length; i++) {
          const location = locations[i];
          const planetDatum = planetDatas[i];
          if (!planetDatum.owner) {
            console.error(`missing owner for ${location}`)
          }
          // const queryTime = Math.floor(Date.now() / 1000); // TODO use latest block number for queries
          const contractState = {
            owner: planetDatum.owner,
            exitTime: planetDatum.exitTime,
            numSpaceships: planetDatum.numSpaceships,
            lastUpdated: planetDatum.lastUpdated,
            active: planetDatum.active,
            // queryTime // TODO ?
          };
          const planetRecord = this.planetRecords[location];
          if (!planetRecord) {
            throw new Error(`no planet record for ${location}`)
          }
          planetRecord.contractState = contractState;
          this._setPlanet(location, planetRecord);
          this.planetIdsToUpdate.push(location);
        }
      } catch(e) {
        console.error(e);
      }
    }

    this.timeKeeper.setTimeout(() => this._startFetching(fetchingCounterOnFetch, areas), 5); //TODO config delay
  }

  private _timeBasedUpdate(): void {
    console.log({planetIdsToUpdate: this.planetIdsToUpdate});
    for (const planetId of this.planetIdsToUpdate) {
      this._updatePlanetRecord(planetId, this.timeKeeper.getTime());
    }
    this.timeKeeper.setTimeout(this._timeBasedUpdate.bind(this), 1);
  }

  private _updatePlanetRecord(planetId: string, time: number): void {
    const planetRecord = this.planetRecords[planetId];
    if (!planetRecord) {
      throw new Error(`no planet record for ${planetId}`)
    }

    const contractState = planetRecord.contractState;
    if (!contractState) {
      // SKIP UNTIL THERE IS A CONTRACT STATE TO COMPUTE PREDICTED VALUES FROM TIME
      return;
    }
    let owner = contractState.owner;
    let active = contractState.active;
    let numSpaceships = contractState.numSpaceships;
    let exiting = !!contractState.exitTime;
    let exitTimeLeft = this.spaceInfo.exitDuration - (time - contractState.exitTime);
    if (contractState.exitTime > 0 && time > contractState.exitTime + this.spaceInfo.exitDuration) {
      // exited
      numSpaceships = 0;
      owner = "0x0000000000000000000000000000000000000000";
      active = false;
      exiting = false;
      exitTimeLeft = 0;
    } else if (contractState.active) {
      numSpaceships = contractState.numSpaceships + (Math.floor(((time - contractState.lastUpdated) * planetRecord.planet.stats.production) / (60 * 60)));
    }

    if (!planetRecord.planet.state) {
      planetRecord.planet.loaded = true;
      planetRecord.planet.state = {
        owner, active, numSpaceships, exiting, exitTimeLeft
      };
    } else {
      planetRecord.planet.state.owner = owner;
      planetRecord.planet.state.active = active;
      planetRecord.planet.state.numSpaceships = numSpaceships;
      planetRecord.planet.state.exiting = exiting;
      planetRecord.planet.state.exitTimeLeft = exitTimeLeft;
    }

    this._callListeners(planetId, planetRecord.planet);
  }

}

