import React from 'react';
import { Card } from '../types/card';

interface DeckProps {
  deck: Card[];
}

const Deck: React.FC<DeckProps> = ({ deck }) => {
  return (
    <div>
      <h3>Your Deck</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {deck.map((card, index) => (
          <div key={index} style={{ border: '1px solid black', margin: '5px', padding: '5px' }}>
            <p>{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deck;
