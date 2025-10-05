import React from "react";
import { Card } from "../types/card";

interface HandProps {
  deck: Card[];
}

const Deck: React.FC<HandProps> = ({ deck }) => {
  return (
    <div>
      <h3>Ta main</h3>
      <ul>
        {deck.map((c) => (
          <li key={c.id}>
            {c.name} - Popularité: {c.popularity} - Argent: {c.money}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Deck;
