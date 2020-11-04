// const {utils, Wallet, BigNumber} = require("ethers");
import {hexConcat, hexZeroPad} from '@ethersproject/bytes';
import {BigNumber} from '@ethersproject/bignumber';

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

export type StrictLocationPointer<T> = {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  data: T;
};

export type LocationPointer<T> = {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  data: T | undefined;
};

// let path = [];
export function nextInSpiral<T>(
  pointer?: LocationPointer<T> | StrictLocationPointer<T>
): LocationPointer<T> {
  if (!pointer) {
    // path = [{x: 0, y: 0, dx: 0, dy: -1}];
    return {x: 0, y: 0, dx: 0, dy: -1, index: 0, data: undefined};
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
    data: undefined,
  };
}
