import { Card } from "./card";

export interface Player {
  socketId: string;
  name: string;
  ready: boolean;
  houseCapacity: number;
  used: Card[];
  unused: Card[];
  deck: Card[];
  discard: Card[];
  popularity: number;
  money: number;
}
