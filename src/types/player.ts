import { Card } from "./card";

export interface Player {
  socketId: string;
  name: string;
  ready: boolean;
  houseCapacity: number;
  used: Card[];
  unsed: Card[];
  deck: Card[];
  discard: Card[];
}
