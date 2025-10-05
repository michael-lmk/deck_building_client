import React from 'react';
import { Card } from '../types/card';

interface DeckViewProps {
  deck: Card[];
  discard: Card[];
  onClose: () => void;
}

const viewStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px',
  maxHeight: '80vh',
  overflowY: 'auto',
  backgroundColor: 'white',
  border: '2px solid black',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  zIndex: 1000,
};

const listStyle: React.CSSProperties = {
  width: '48%',
  border: '1px solid #eee',
  borderRadius: '5px',
  padding: '10px',
  backgroundColor: '#f9f9f9',
};

const DeckView: React.FC<DeckViewProps> = ({ deck, discard, onClose }) => {
  // Helper function to group cards by name and count them
  const aggregateCards = (cards: Card[]) => {
    const cardCounts = cards.reduce((acc, card) => {
      acc[card.name] = (acc[card.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cardCounts);
  };

  const aggregatedDeck = aggregateCards(deck);
  const aggregatedDiscard = aggregateCards(discard);

  return (
    <div style={viewStyle}>
      <button onClick={onClose} style={{ float: 'right' }}>Fermer</button>
      <h2>Mon Deck</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={listStyle}>
          <h4>Cartes à Piocher ({deck.length})</h4>
          <ul>
            {aggregatedDeck.map(([name, count]) => <li key={name}>{name} (x{count})</li>)}
          </ul>
        </div>
        <div style={listStyle}>
          <h4>Cartes Déjà Piochées ({discard.length})</h4>
          <ul>
            {aggregatedDiscard.map(([name, count]) => <li key={name}>{name} (x{count})</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeckView;