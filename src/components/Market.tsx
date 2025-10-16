import React from "react";
import { Card } from "../types/card";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface MarketProps {
  market: Card[] | undefined;
  onBuy: (cardName: string) => void;
  disabled?: boolean;
}

const Market: React.FC<MarketProps> = ({ market, onBuy, disabled }) => {
  return (
    <div className="container mt-3">
      <h3>Boutique</h3>
      <div className="d-flex flex-wrap gap-3">
        {market?.map((c) => (
          <OverlayTrigger
            key={c.id}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-${c.id}`}>
                {c.ability || "Aucune capacité spéciale"}
              </Tooltip>
            }
          >
            <div
              className="card shadow-sm text-center p-2"
              style={{ width: "140px", cursor: "pointer" }}
            >
              <div className="fw-bold">{c.name}</div>
              <div className="small text-muted">
                Pop: {c.popularity} | 💰 {c.money}
              </div>
              {c.isStar && (
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "8px",
                    color: "gold",
                  }}
                >
                  ★
                </div>
              )}
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => onBuy(c.name)}
                disabled={disabled}
              >
                Acheter
              </button>
            </div>
          </OverlayTrigger>
        ))}
      </div>
    </div>
  );
};

export default Market;
