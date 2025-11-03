import { Card } from "./card";
import { Player } from "./player";

export interface Room {
  id: string;
  players: Record<string, Player>;
  market: Card[];
  started: boolean;
  turnOrder: string[];
  currentTurnIndex: number;
}
