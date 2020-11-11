import {Fleet, Planet, PrivateSpace, Space} from '../types';

export class PrivateSpaceImpl implements PrivateSpace {
  public player: string | undefined;
  constructor(private space: Space, private walletStore: any) {
    walletStore.subscribe((data: any) => {
      this.player = data.address;
      // TODO destroy ?
    });
  }
  getPlanet(x: number, y: number): Planet | undefined {
    return this.space.getPlanet(x, y);
  }
  getFleets(): Fleet[] {
    return [];
  }
  getFleetsFrom(x: number, y: number): Fleet[] {
    return [];
  }
  getFleetsTo(x: number, y: number): Fleet[] {
    return [];
  }
}
