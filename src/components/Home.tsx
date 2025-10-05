import React, { useState } from "react";
import Room from "./Room";

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState<string>("");
  const [inRoom, setInRoom] = useState(false);

  // Créer une party → génère un ID aléatoire
  const handleCreateParty = () => {
    const newRoomId = `room-${Math.floor(Math.random() * 10000)}`;
    setRoomId(newRoomId);
    setInRoom(true);
  };

  // Rejoindre une party → utilise l'ID saisi
  const handleJoinParty = () => {
    if (roomId.trim() === "") {
      alert("Merci de saisir un Room ID !");
      return;
    }
    setInRoom(true);
  };

  if (inRoom) {
    return <Room roomId={roomId} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>House Party - Deck Building</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={handleCreateParty}>Créer une party</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="ID de la party"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinParty}>Rejoindre une party</button>
      </div>
    </div>
  );
};

export default Home;
