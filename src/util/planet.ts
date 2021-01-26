// import type {Planet} from '../types';
// export function isActive(planet: Planet, time: number): boolean {
//   return planet.state ? planet.state.active && (planet.state.exitTime === 0 || planet.state.exitTime + EXIT_DELAY >= time) : false;
// }

// export function isExiting(planet: Planet, time: number): boolean {
//   return planet.state ? planet.state.exitTime > 0 && planet.state.exitTime + EXIT_DELAY < time) : false;
// }

// export function exitRatio(planet: Planet, time: number): boolean {
//   return planet.state ? (planet.state.exitTime === 0 ? Number.MAX_SAFE_INTEGER : (time - planet.state.exitTime) / EXIT_DELAY)) : Number.MAX_SAFE_INTEGER;
// }
