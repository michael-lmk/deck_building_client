import { Card } from "./card";

export interface Room {
  id: string;
  market: Card[];
  started: boolean;
  turnOrder: string[];
  currentTurnIndex: number;
}
