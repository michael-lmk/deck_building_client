import React, { useEffect, useState, useCallback, useRef } from "react";
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
  houseCapacity: number;
  used: Card[];
  unsed: Card[];
  deck: Card[];
  discard: Card[];
}

interface PartyState {
  guestsInHouse: Card[];
  houseCapacity: number;
  isActive: boolean;
}

const Room: React.FC<RoomProps> = ({ roomId }) => {
  const [socketId, setSocketId] = useState<Player | string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [ready, setReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(false);

  const playersRef = useRef(players);

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

  const onUpdatePlayers = useCallback((players: Player[]) => {
    setPlayers(players);
    setSelectedPlayer((prev) => players.find((p) => p.socketId === prev?.socketId) ?? null);
  }, []);

  const handleReady = () => {
    socket.emit("playerReady", { roomId });
    setReady(() => !ready);
  };

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const onStartGame = () => {
    const currentPlayers = playersRef.current;
    setSelectedPlayer(currentPlayers.find((p) => p.socketId === socket.id) ?? null);
    setIsStart(true);
  };

  const onYourTurn = () => {
    alert("C'est ton tour !");
    setIsYourTurn(true);
  };

  const inviteGuest = () => {
    socket.emit("inviteGuest", { roomId });
  };

  const onLostRound = (data: any) => {
    console.log(data);
    
    alert(data.message);
  };

  useEffect(() => {
    socket.connect();

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("updatePlayers", onUpdatePlayers);
    socket.on("startGame", onStartGame);
    socket.on("yourTurn", onYourTurn);
    socket.on("lostRound", onLostRound);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("updatePlayers", onUpdatePlayers);
      socket.off("startGame", onStartGame);
      socket.off("yourTurn", onYourTurn);
      socket.off("lostRound", onLostRound);

      socket.disconnect();
    };
  }, []);

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
            <button
              onClick={() => setSelectedPlayer(p)}
              style={{ fontWeight: selectedPlayer?.socketId === p.socketId ? "bold" : "normal" }}>
              {p.name} {!isStart && (p.ready ? "✅" : "❌")} {socketId === p.socketId && "(You)"}
            </button>
          </li>
        ))}
      </ul>
      {!isStart && <button onClick={handleReady}>{ready ? "Annuler" : "Prêt"} </button>}
      {isStart && ready && (
        <Party
          disabled={!isYourTurn}
          guests={selectedPlayer?.used ?? []}
          capacity={selectedPlayer?.houseCapacity || 0}
        />
      )}

      <button onClick={inviteGuest}>Inviter</button>
    </div>
  );
};

export default Room;
