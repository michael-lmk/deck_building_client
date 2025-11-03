export interface Card {
  id: string;
  card_id: number;
  name: string;
  type: "default" | "guest" | "star";
  cost?: number;
  popularity: number | "variable" | "scaling";
  money: number;
  ability?: string;
  trouble: boolean;
  buyable?: boolean;
  quantity?: number; // Quantity restant dans le shop
}
