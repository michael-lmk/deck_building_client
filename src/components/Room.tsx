import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card } from "../types/card";
import Market from "./Market";
import Hand from "./Deck";

interface RoomProps {
  roomId: string;
}

interface Player {
  socketId: string;
  name: string;
  ready: boolean;
  hand: Card[];
}

const TURN_TIME = 15000; // 15 secondes

const Room: React.FC<RoomProps> = ({ roomId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [market, setMarket] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [yourTurn, setYourTurn] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [ready, setReady] = useState(false);
  const [partyResults, setPartyResults] = useState<{ popularity: number; money: number } | null>(null);

  useEffect(() => {
    // Initialiser la socket
    const s: Socket = io("http://localhost:3005");
    setSocket(s);

    // Listeners
    s.on("connect", () => {
      console.log("Connected", s.id);
      s.emit("joinRoom", { roomId, name: `Player-${(s.id ?? "unknown").slice(0, 4)}` });
    });

    s.on("joinedRoom", (data: any) => {
      setHand(data.hand);
    });

    s.on("updatePlayers", (data: Player[]) => {
      setPlayers(data);
    });

    s.on("startGame", (data: { market: Card[] }) => {
      setMarket(data.market);
      setReady(false);
    });

    s.on("yourTurn", (data: { market: Card[] }) => {
      setMarket(data.market);
      setYourTurn(true);
    });

    s.on("handUpdate", (handData: Card[]) => {
      setHand(handData);
    });

    s.on("marketUpdate", (marketData: Card[]) => {
      setMarket(marketData);
    });

    s.on("partyResults", (results) => {
      setPartyResults(results);
      setYourTurn(false);
    });

    s.on("partyStopped", (data) => {
      alert(data.reason);
      setYourTurn(false);
    });

    // Fonction de nettoyage pour useEffect
    return () => {
      s.disconnect();
    };
  }, [roomId]);

  // Timer automatique pour passer le tour
  useEffect(() => {
    if (!yourTurn) return;
    const timer = setTimeout(() => {
      alert("Temps écoulé ! Tour passé automatiquement.");
      socket?.emit("passTurn", { roomId });
      setYourTurn(false);
    }, TURN_TIME);

    return () => clearTimeout(timer);
  }, [yourTurn, socket, roomId]);

  const handleReady = () => {
    socket?.emit("playerReady", { roomId });
    setReady(true);
  };

  const handleBuyCard = (cardName: string) => {
    if (yourTurn) {
      socket?.emit("buyCard", { roomId, cardName });
      setYourTurn(false);
    } else {
      alert("Ce n'est pas ton tour !");
    }
  };

  const handlePassTurn = () => {
    if (yourTurn) {
      socket?.emit("passTurn", { roomId });
      setYourTurn(false);
    }
  };

  return (
    <div>
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

      {market.length > 0 && (
        <Market
          market={market}
          onBuy={handleBuyCard}
          disabled={!yourTurn}
        />
      )}

      {hand.length > 0 && <Hand deck={hand} />}

      {yourTurn && (
        <div>
          <p>C'est ton tour !</p>
          <button onClick={handlePassTurn}>Passer le tour</button>
        </div>
      )}

      {partyResults && (
        <div>
          <h3>Résultats de la fête</h3>
          <p>Popularité: {partyResults.popularity}</p>
          <p>Argent: {partyResults.money}</p>
        </div>
      )}
    </div>
  );
};

export default Room;
