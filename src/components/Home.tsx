import React, { useState } from "react";
import RoomScreen from "./Room";
import { useSocket } from "../hooks/socket.context";

const Home: React.FC = () => {
  const { login } = useSocket();

  const [roomId, setRoomId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>(() => `Player-${Math.floor(Math.random() * 1000)}`);
  const [inRoom, setInRoom] = useState(false);

  // Créer une party → génère un ID aléatoire
  const handleCreateParty = () => {
    const newRoomId = `room-${Math.floor(Math.random() * 10000)}`;
    setRoomId(newRoomId);
    setInRoom(true);
  };

  const handleJoinParty = async () => {
    if (roomId.trim() === "") {
      alert("Merci de saisir un Room ID !");
      return;
    }

    const success = await login(playerName);
    console.log(success);

    if (success) {
      setInRoom(true); // ← TypeScript est content maintenant
    } else {
      console.log("okoko not connect");

      // alert("Impossible de se connecter au serveur.");
    }
  };

  if (inRoom) {
    return (
      <RoomScreen
        playerName={playerName}
        roomId={roomId}
      />
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>House Party - Deck Building</h1>

      <div style={{ marginBottom: 20 }}>{/* <button onClick={handleCreateParty}>Créer une party</button> */}</div>

      <div className="d-flex flex-column w-25">
        <input
          className="my-2"
          type="text"
          placeholder="PlayerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="text"
          className="my-2"
          placeholder="ID de la party"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className="my-2"
          onClick={handleJoinParty}>
          Rejoindre une party
        </button>
      </div>
    </div>
  );
};

export default Home;
