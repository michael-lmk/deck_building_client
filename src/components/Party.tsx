import React, { useEffect, useState } from "react";
import { Card } from "../types/card";
import { Player } from "../types/player";

interface PartyProps {
  selectedPlayer: Player;
  result?: any; // résultat du tour (deltas)
  onAnimationEnd?: () => void;
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
  alignItems: "center",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  position: "relative"
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

const Party: React.FC<PartyProps> = ({ selectedPlayer, result, onAnimationEnd }) => {
  console.log(selectedPlayer);

  const troubleCount = selectedPlayer.used.filter((g) => g.trouble).length;
  const [activeEffect, setActiveEffect] = useState<any | null>(null);
  const [money, setMoney] = useState<number>(selectedPlayer.money || 0);
  const [popularity, setPopularity] = useState<number>(selectedPlayer.popularity || 0);

  useEffect(() => {
    if (!result?.deltas) {
      return;
    }

    // Transformer le backend en un tableau d'effets uniques
    const allEffects: any[] = [
      ...(result.deltas.popPositive || []).map((d: any) => ({
        ...d,
        id: d.id,
        type: "pop",
        value: Math.abs(d.value)
      })),
      ...(result.deltas.popNegative || []).map((d: any) => ({
        ...d,
        id: d.id,
        type: "pop",
        value: -Math.abs(d.value)
      })),
      ...(result.deltas.moneyPositive || []).map((d: any) => ({
        ...d,
        id: d.id,
        type: "money",
        value: Math.abs(d.value)
      })),
      ...(result.deltas.moneyNegative || []).map((d: any) => ({
        ...d,
        id: d.id,
        type: "money",
        value: -Math.abs(d.value)
      }))
    ];

    if (allEffects.length === 0) {
      onAnimationEnd?.();
      return;
    }

    let i = 0;

    const playNext = () => {
      if (i >= allEffects.length) {
        setActiveEffect(null);
        onAnimationEnd?.(); // ouvre le shop à la fin
        return;
      }
      setActiveEffect(allEffects[i]);
      i++;
      console.log(i);

      if (allEffects[i - 1].type === "money") {
        setMoney((prev) => prev + allEffects[i - 1].value);
      } else if (allEffects[i - 1].type === "pop") {
        setPopularity((prev) => prev + allEffects[i - 1].value);
      }

      setTimeout(playNext, 1200); // durée de l'animation
    };

    playNext();
  }, [result]);

  useEffect(() => {
    // Quand le joueur change ou que la partie se met à jour
    if (!activeEffect) {
      setMoney(selectedPlayer.money || 0);
      setPopularity(selectedPlayer.popularity || 0);
    }
  }, [selectedPlayer, activeEffect]);

  return (
    <div style={partyAreaStyle}>
      <div>
        <h3>
          Party Guests ({selectedPlayer.used.length}/{selectedPlayer.houseCapacity}) | Trouble: {troubleCount}/3
        </h3>
        <h4>
          money: {money} / popularity: {popularity}
        </h4>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "170px" }}>
        {selectedPlayer.used.map((card) => {
          return (
            <div
              key={card.id}
              style={{
                ...cardStyle,
                borderColor: card.trouble ? "red" : "#ccc"
              }}>
              <strong>{card.name}</strong>
              <span>
                Pop: {card.popularity} / Mon: {card.money}
              </span>
              {card.type === "star" && <span style={{ color: "gold" }}>★ Star</span>}
              {card.trouble && <span style={{ color: "red", fontWeight: "bold" }}>TROUBLE</span>}

              {/* Effet animé, un seul à la fois */}
              {activeEffect && activeEffect.id === card.id && (
                <div
                  key={activeEffect.id + "-" + Date.now()} // clé unique à chaque effet
                  style={{
                    position: "absolute",
                    top: "30%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: activeEffect.value > 0 ? "limegreen" : "red",
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    animation: "floatUp 1s ease-out forwards"
                  }}>
                  {activeEffect.value > 0 ? `+${activeEffect.value}` : activeEffect.value} {activeEffect.type === "pop" ? "⭐" : "💰"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes floatUp {
            0% { transform: translate(-50%, 0); opacity: 1; }
            100% { transform: translate(-50%, -40px); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Party;
