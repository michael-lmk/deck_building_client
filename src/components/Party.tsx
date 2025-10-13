import React from "react";
import { Card } from "../types/card";

interface PartyProps {
  guests: Card[];
  capacity: number;
  disabled?: boolean;
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "10px",
  margin: "5px",
  width: "120px",
  height: "160px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const partyAreaStyle: React.CSSProperties = {
  border: "2px dashed #ccc",
  borderRadius: "8px",
  padding: "10px",
  marginTop: "20px",
  minHeight: "200px",
  width: "100%",
  backgroundColor: "#fafafa"
};

const Party: React.FC<PartyProps> = ({ guests, capacity }) => {
  const troubleCount = guests.filter((g) => g.trouble).length;

  return (
    <div style={partyAreaStyle}>
      <h3>
        Party Guests ({guests.length}/{capacity}) | Trouble: {troubleCount}/3
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "170px" }}>
        {guests.map((card, index) => (
          <div
            key={index}
            style={{ ...cardStyle, borderColor: card.trouble ? "red" : "#ccc" }}>
            <strong>{card.name}</strong>
            <span>
              Pop: {card.popularity} / Mon: {card.money}
            </span>
            {card.isStar && <span style={{ color: "gold" }}>â Star</span>}
            {card.trouble && <span style={{ color: "red", fontWeight: "bold" }}>TROUBLE</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Party;
