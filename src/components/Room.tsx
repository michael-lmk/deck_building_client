import React, { useEffect, useState, useCallback, useRef } from "react";
import Party from "./Party";
import { Button, Modal } from "react-bootstrap";
import Market from "./Market";

import { Room } from "../types/room";
import { Player } from "../types/player";
import { Socket } from "socket.io-client";
import { useSocket } from "../hooks/socket.context";

interface RoomProps {
  roomId: string;
  playerName: string;
}

const RoomScreen: React.FC<RoomProps> = ({ roomId, playerName }) => {
  const { socket } = useSocket();
  const socketRef = useRef<Socket | null>(socket);

  const [socketId, setSocketId] = useState<string>("");
  const [room, setRoom] = useState<Room>();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [ready, setReady] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [roundResult, setRoundResult] = useState<any>();

  const [openMarket, setOpenMarket] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emit = (event: string, data?: any) => {
    socketRef.current?.emit(event, { ...data, roomId });
  };

  const onConnect = () => {
    console.log("Connected!", socketRef.current?.id);
    emit("joinRoom", { name: playerName });
    setSocketId(socketRef.current?.id ?? "");
  };

  const onDisconnect = useCallback(() => {
    console.log("Disconnected");
  }, []);

  const onUpdateRoom = useCallback((updatedRoom: Room) => {
    setRoom(updatedRoom);
    // Selected player = joueur actuel du tour
    const playersArray = Object.values(updatedRoom.players);
    setSelectedPlayer(playersArray[updatedRoom.currentTurnIndex] ?? null);
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

  const onScoreResult = useCallback((result: any) => {
    setRoundResult(result);
  }, []);

  const onToggleLost = useCallback((data: { message: string }) => {
    setErrorMessage(data?.message);
    setShowErrorModal((prev) => !prev);
  }, []);

  // =========================
  // Actions utilisateur
  // =========================

  /**
   * Permet de mettre pret si tout les joueurs le sont, lance la partie
   */
  const handleReady = () => {
    emit("playerReady");
    setReady((prev) => !prev);
  };

  /**
   * Ajouter un personnage au tirage
   */
  const inviteGuest = () => {
    emit("inviteGuest");
  };

  /**
   * fermeture du message d'erreur et passe au joueur suivant
   */
  const toggleLost = () => {
    setIsYourTurn(false);
    emit("toggleLost");
    setTimeout(() => {
      emit("nextPlayer");
    }, 1000);
  };

  const toggleMarket = () => {
    setIsYourTurn(false);
    emit("toggleMarket");
    setTimeout(() => {
      emit("nextPlayer");
    }, 1000);
  };

  const buyCard = (card_id: number) => {
    emit("buyCard", { card_id });
  };

  // =========================
  // useEffect
  // =========================

  useEffect(() => {
    socketRef.current?.connect();

    socketRef.current?.on("connect", onConnect);
    socketRef.current?.on("disconnect", onDisconnect);
    socketRef.current?.on("updateRoom", onUpdateRoom);
    socketRef.current?.on("startGame", onStartGame);
    socketRef.current?.on("yourTurn", onYourTurn);
    socketRef.current?.on("toggleMarket", onToggleMarket);
    socketRef.current?.on("countScore", onScoreResult);
    socketRef.current?.on("lostRound", onToggleLost);

    return () => {
      socketRef.current?.off("connect", onConnect);
      socketRef.current?.off("disconnect", onDisconnect);
      socketRef.current?.off("updateRoom", onUpdateRoom);
      socketRef.current?.off("startGame", onStartGame);
      socketRef.current?.off("yourTurn", onYourTurn);
      socketRef.current?.off("toggleMarket", onToggleMarket);
      socketRef.current?.off("countScore", onScoreResult);
      socketRef.current?.off("lostRound", onToggleLost);

      socketRef.current?.disconnect();
    };
  }, [roomId, onUpdateRoom, onScoreResult, onToggleLost, onToggleMarket]);

  // =========================
  // Render
  // =========================

  const playersArray = room ? Object.values(room.players) : [];

  return (
    <div
      style={{
        padding: 20,
        position: "relative",
        pointerEvents: isStart && !isYourTurn ? "none" : "auto"
      }}>
      <h2>Room: {roomId}</h2>
      <h3>Players:</h3>
      <ul className="d-flex flex-row">
        {playersArray.map((p) => (
          <div
            className="mx-2"
            key={p.socketId}>
            <Button
              style={{
                fontWeight: selectedPlayer?.socketId === p.socketId ? "bold" : "normal"
              }}>
              {p.name} {!isStart && (p.ready ? "✅" : "❌")} {socketId === p.socketId && "(You)"}
            </Button>
          </div>
        ))}
      </ul>
      <div>POP: {selectedPlayer?.popularity}</div>
      <div>Money: {selectedPlayer?.popularity}</div>
      {!isStart && <Button onClick={handleReady}>{ready ? "Annuler" : "Prêt"}</Button>}

      {isStart && ready && selectedPlayer && (
        <Party
          selectedPlayer={selectedPlayer}
          result={roundResult}
          onAnimationEnd={toggleMarket}
        />
      )}

      {isYourTurn && (
        <Button
          className="mt-2"
          onClick={inviteGuest}>
          Inviter
        </Button>
      )}

      {isYourTurn && (
        <Button
          className="mt-2"
          onClick={() => emit("CountScore")}>
          Terminer le tour
        </Button>
      )}

      {/* Modal perte */}
      <Modal
        backdrop="static"
        show={showErrorModal}>
        <Modal.Header>
          <Modal.Title>Perdu</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={toggleLost}>
            Terminer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal shop */}
      <Modal
        fullscreen={true}
        backdrop="static"
        show={openMarket}>
        <Modal.Header>
          <Modal.Title>Shop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Market
            market={room?.market}
            onBuy={buyCard}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={toggleMarket}>
            Terminer
          </Button>
        </Modal.Footer>
      </Modal>

      {isStart && !isYourTurn && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.1)",
            zIndex: 9999
          }}
        />
      )}
    </div>
  );
};

export default RoomScreen;
