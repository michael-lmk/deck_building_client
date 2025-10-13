import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "../types/card";
import Party from "./Party";

import DeckView from "./DeckView";
import { Button, Modal } from "react-bootstrap";
import Market from "./Market";

import { Room } from "../types/room";
import { Player } from "../types/player";
import { io, Socket } from "socket.io-client";
import { useSocket } from "../hooks/socket.context";

interface RoomProps {
  roomId: string;
  playerName: string;
}

const RoomScreen: React.FC<RoomProps> = ({ roomId, playerName }) => {
  const { socket } = useSocket();
  const socketRef = useRef<Socket | null>(socket);

  const [socketId, setSocketId] = useState<Player | string>("");

  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<Room>();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [ready, setReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(false);

  const [openMarket, setOpenMarket] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const playersRef = useRef(players);

  const emit = (event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  };

  const onConnect = () => {
    console.log("Connected!", socketRef.current?.id);

    emit("joinRoom", { roomId, name: playerName });
    setSocketId(socketRef.current?.id ?? "");
  };

  const onDisconnect = useCallback(() => {
    console.log("Disconnected");
  }, []);

  const onUpdatePlayers = useCallback((players: Player[]) => {
    playersRef.current = players;
    setPlayers(players);
    setSelectedPlayer((prev) => players.find((p) => p.socketId === prev?.socketId) ?? null);
  }, []);

  const onUpdateRoom = useCallback((room: Room) => {
    setRoom(room);
    console.log(playersRef.current[room.currentTurnIndex]);

    setSelectedPlayer(playersRef.current[room.currentTurnIndex]);
  }, []);

  const onStartGame = () => {
    setIsStart(true);
  };

  const onYourTurn = () => {
    setIsYourTurn(() => true);
  };

  const onToggleMarket = useCallback(() => {
    setOpenMarket((prev) => !prev);
  }, []);

  const onToggleLost = useCallback((data: { message: string }) => {
    setErrorMessage(data?.message);
    setShowErrorModal((prev) => !prev);
  }, []);

  // Envoie au backend

  /**
   * Permet de mettre pret si tout les joueurs le sont, lance la partie
   */
  const handleReady = () => {
    emit("playerReady", { roomId });
    setReady(() => !ready);
  };

  /**
   * Ajouter un personnage au tirage
   */
  const inviteGuest = () => {
    emit("inviteGuest", { roomId });
  };

  /**
   * fermeture du message d'erreur et passe au joueur suivant
   */
  const toggleLost = () => {
    setIsYourTurn(() => false);
    emit("toggleLost", { roomId });
    setTimeout(() => {
      emit("nextPlayer", { roomId });
    }, 1000);
  };

  const toggleMarket = () => {
    setIsYourTurn(() => false);
    emit("toggleMarket", { roomId });
    setTimeout(() => {
      emit("nextPlayer", { roomId });
    }, 1000);
  };

  useEffect(() => {
    socketRef.current?.connect();

    socketRef.current?.on("connect", onConnect);
    socketRef.current?.on("disconnect", onDisconnect);
    socketRef.current?.on("updatePlayers", onUpdatePlayers);
    socketRef.current?.on("updateRoom", onUpdateRoom);
    socketRef.current?.on("startGame", onStartGame);
    socketRef.current?.on("yourTurn", onYourTurn);
    socketRef.current?.on("toggleMarket", onToggleMarket);


    socketRef.current?.on("lostRound", onToggleLost);

    return () => {
      socketRef.current?.off("connect", onConnect);
      socketRef.current?.off("disconnect", onDisconnect);
      socketRef.current?.off("updatePlayers", onUpdatePlayers);
      socketRef.current?.off("updateRoom", onUpdateRoom);
      socketRef.current?.off("startGame", onStartGame);
      socketRef.current?.off("yourTurn", onYourTurn);
      socketRef.current?.off("toggleMarket", onToggleMarket);
      socketRef.current?.off("lostRound", onToggleLost);

      socketRef.current?.disconnect();
    };
  }, [roomId, onToggleMarket, onUpdateRoom, onUpdatePlayers, onUpdateRoom, onToggleLost]);

  return (
    <div style={{ padding: 20, position: "relative", pointerEvents: isStart && !isYourTurn ? "none" : "auto" }}>
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
      <ul className="d-flex flex-row">
        {players.map((p) => (
          <div
            className="mx-2"
            key={p.socketId}>
            <Button style={{ fontWeight: selectedPlayer?.socketId === p.socketId ? "bold" : "normal" }}>
              {p.name} {!isStart && (p.ready ? "✅" : "❌")} {socketId === p.socketId && "(You)"}
            </Button>
          </div>
        ))}
      </ul>
      {!isStart && <button onClick={handleReady}>{ready ? "Annuler" : "Prêt"} </button>}
      {isStart && ready && (
        <Party
          guests={selectedPlayer?.used ?? []}
          capacity={selectedPlayer?.houseCapacity || 0}
        />
      )}
      {isYourTurn && (
        <Button
          className="mt-2"
          onClick={inviteGuest}>
          Inviter
        </Button>
      )}
      <>
        <Modal
          show={showErrorModal}
          onHide={() => setShowErrorModal(false)}>
          <Modal.Header>
            <Modal.Title>Perdu</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                toggleLost();
              }}>
              Terminer
            </Button>
          </Modal.Footer>
        </Modal>
      </>

      <>
        <Modal
          show={openMarket}
          onHide={() => {
            toggleMarket();
          }}>
          <Modal.Header closeButton>
            <Modal.Title>Shop</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Market
              market={room?.market}
              onBuy={() => {}}></Market>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                toggleMarket();
              }}>
              Terminer
            </Button>
          </Modal.Footer>
        </Modal>
      </>

      {isStart && !isYourTurn && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.1)", // léger voile
            zIndex: 9999
          }}
        />
      )}
    </div>
  );
};

export default RoomScreen;
