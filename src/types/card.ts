export interface Card {
  id: string;
  name: string;
  type: "default" | "guest" | "star";
  cost?: number;
  popularity: number | "variable" | "scaling";
  money: number;
  ability?: string;
  trouble: boolean;
  buyable?: boolean;
  isStar?: boolean;
}
