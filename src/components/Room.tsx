import React, { useEffect, useState, useCallback } from "react";
import { Card } from "../types/card";
import Party from "./Party";
import { socket } from "../socket";
import DeckView from "./DeckView";

interface RoomProps {
  roomId: string;
}

interface Player {
  socketId: string;
  name: string;
  ready: boolean;
}

interface PartyState {
  guestsInHouse: Card[];
  houseCapacity: number;
  isActive: boolean;
}

const Room: React.FC<RoomProps> = ({ roomId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [party, setParty] = useState<PartyState | null>(null);
  const [yourTurn, setYourTurn] = useState(false);
  const [ready, setReady] = useState(false);
  const [partyResults, setPartyResults] = useState<{ popularity: number; money: number } | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);

  // State for the new deck view
  const [showDeck, setShowDeck] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);

  const onConnect = useCallback(() => {
    console.log('Connected!', socket.id);
    socket.emit("joinRoom", { roomId, name: `Player-${(socket.id ?? "unknown").slice(0, 4)}` });
  }, [roomId]);

  const onDisconnect = useCallback(() => {
    console.log('Disconnected');
  }, []);

  const onUpdatePlayers = useCallback((players: Player[]) => setPlayers(players), []);
  const onStartGame = useCallback(() => setReady(false), []);

  const onYourTurn = useCallback((data: { party: PartyState, deck: Card[], discard: Card[] }) => {
    console.log('Received yourTurn event', data);
    setParty(data.party);
    setDeck(data.deck);
    setDiscard(data.discard);
    setPartyResults(null);
    setYourTurn(true);
  }, []);

  const onPartyUpdate = useCallback((guests: Card[]) => {
    setParty(prevParty => prevParty ? { ...prevParty, guestsInHouse: guests } : null);
  }, []);

  const onPartyBusted = useCallback((data: { reason: string }) => {
    alert(`Busted! ${data.reason}`);
    setYourTurn(false);
  }, []);

  const onPartyResults = useCallback((results: { popularity: number; money: number }) => {
    setPartyResults(results);
    setYourTurn(false);
  }, []);

  const onDeckStateUpdated = useCallback((data: { deck: Card[], discard: Card[] }) => {
    setDeck(data.deck);
    setDiscard(data.discard);
  }, []);

  const onGameOver = useCallback((data: { winner: string }) => {
    setGameOver(data.winner);
    setYourTurn(false);
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on("updatePlayers", onUpdatePlayers);
    socket.on("startGame", onStartGame);
    socket.on("yourTurn", onYourTurn);
    socket.on("partyUpdate", onPartyUpdate);
    socket.on("partyBusted", onPartyBusted);
    socket.on("partyResults", onPartyResults);
    socket.on("deckStateUpdated", onDeckStateUpdated);
    socket.on("gameOver", onGameOver);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off("updatePlayers", onUpdatePlayers);
      socket.off("startGame", onStartGame);
      socket.off("yourTurn", onYourTurn);
      socket.off("partyUpdate", onPartyUpdate);
      socket.off("partyBusted", onPartyBusted);
      socket.off("partyResults", onPartyResults);
      socket.off("deckStateUpdated", onDeckStateUpdated);
      socket.off("gameOver", onGameOver);
      socket.disconnect();
    };
  }, [roomId, onConnect, onDisconnect, onUpdatePlayers, onStartGame, onYourTurn, onPartyUpdate, onPartyBusted, onPartyResults, onDeckStateUpdated, onGameOver]);

  const handleReady = () => {
    socket.emit("playerReady", { roomId });
    setReady(true);
  };

  const handleDrawCard = () => {
    if (yourTurn) {
      socket.emit("drawCard", { roomId });
    } else {
      alert("Ce n'est pas ton tour !");
    }
  };

  const handleEndTurn = () => {
    if (yourTurn) {
      socket.emit("endParty", { roomId });
      setYourTurn(false);
    } else {
      alert("Ce n'est pas ton tour !");
    }
  };

  if (gameOver) {
    return (
      <div>
        <h2>Game Over!</h2>
        <p>Winner: {gameOver}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setShowDeck(!showDeck)} style={{ position: 'absolute', top: 10, right: 10 }}>
        {showDeck ? 'Hide Deck' : 'Show My Deck'}
      </button>
      {showDeck && <DeckView deck={deck} discard={discard} onClose={() => setShowDeck(false)} />}

      <h2>Room: {roomId}</h2>
      <h3>Players:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.socketId}>
            {p.name} {p.ready ? "✅" : "❌"}
          </li>
        ))}
      </ul>
      {!party && !ready && <button onClick={handleReady}>Ready</button>}

      {yourTurn && (
        <div style={{ margin: '20px 0', padding: '10px', border: '2px solid green' }}>
          <h2>C'est ton tour !</h2>
          <button onClick={handleDrawCard} style={{ marginRight: 10 }}>
            Piocher une carte
          </button>
          <button onClick={handleEndTurn}>Terminer mon tour</button>
        </div>
      )}

      {party && <Party guests={party.guestsInHouse} capacity={party.houseCapacity} />}

      {partyResults && (
        <div style={{ marginTop: 20 }}>
          <h3>Résultats du tour</h3>
          <p>Popularité: {partyResults.popularity}</p>
          <p>Argent: {partyResults.money}</p>
        </div>
      )}
    </div>
  );
};

export default Room;
