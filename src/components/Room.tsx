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
  const [socketId, setSocketId] = useState<Player | string>("");
  const [players, setPlayers] = useState<Player[]>([]);

  const [ready, setReady] = useState(false);

  // // State for the new deck view
  // const [showDeck, setShowDeck] = useState(false);
  // const [deck, setDeck] = useState<Card[]>([]);
  // const [discard, setDiscard] = useState<Card[]>([]);

  const onConnect = useCallback(() => {
    console.log("Connected!", socket.id);
    socket.emit("joinRoom", { roomId, name: `Player-${(socket.id ?? "unknown").slice(0, 4)}` });
    setSocketId(socket.id ?? "");
  }, [roomId]);

  const onDisconnect = useCallback(() => {
    console.log("Disconnected");
  }, []);

  const onUpdatePlayers = useCallback((players: Player[]) => setPlayers(players), []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("updatePlayers", onUpdatePlayers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("updatePlayers", onUpdatePlayers);

      socket.disconnect();
    };
  }, [roomId, onConnect, onDisconnect, onUpdatePlayers]);

  const handleReady = () => {
    socket.emit("playerReady", { roomId });
    setReady(true);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* <button
        onClick={() => setShowDeck(!showDeck)}
        style={{ position: "absolute", top: 10, right: 10 }}>
        {showDeck ? "Hide Deck" : "Show My Deck"}
      </button> */}
      {/* {showDeck && (
        <DeckView
          deck={deck}
          discard={discard}
          onClose={() => setShowDeck(false)}
        />
      )} */}

      <h2>Room: {roomId}</h2>
      <h3>Players:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.socketId}>
            {p.name} {p.ready ? "✅" : "❌"}
          </li>
        ))}
      </ul>
      {!ready && <button onClick={handleReady}>Ready</button>}
    </div>
  );
};

export default Room;
