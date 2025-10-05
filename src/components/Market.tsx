import React from "react";
import { Card } from "../types/card";

interface MarketProps {
  market: Card[];
  onBuy: (cardName: string) => void;
  disabled?: boolean;
}

const Market: React.FC<MarketProps> = ({ market, onBuy, disabled }) => {
  return (
    <div>
      <h3>Boutique</h3>
      <ul>
        {market.map((c) => (
          <li key={c.id}>
            {c.name} - Popularité: {c.popularity} - Argent: {c.money}
            <button
              onClick={() => onBuy(c.name)}
              disabled={disabled}>
              Acheter
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Market;
