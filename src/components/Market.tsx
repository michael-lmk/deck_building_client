import React from "react";
import { Card } from "../types/card";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface MarketProps {
  market: Card[] | undefined;
  onBuy: (cardName: number) => void;
  disabled?: boolean;
}

const Market: React.FC<MarketProps> = ({ market, onBuy, disabled }) => {
  return (
    <div className="container mt-3">
      <h3>Boutique</h3>
      <div className="d-flex flex-wrap gap-3">
        {market?.map((c) => (
          <div className="d-flex flex-column">
            <OverlayTrigger
              key={c.id}
              placement="top"
              overlay={<Tooltip id={`tooltip-${c.id}`}>{c.ability || "Aucune capacité spéciale"}</Tooltip>}>
              <div
                className="card shadow-sm text-center p-2"
                style={{ width: "180px", height: "200px", cursor: "pointer" }}>
                <div className="fw-bold">{c.name}</div>
                <div className="d-flex justify-content-center align-items-center h-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-user">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle
                      cx="12"
                      cy="7"
                      r="4"></circle>
                  </svg>
                </div>
                <div style={{ position: "absolute", top: "50%", right: 5, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div className="small text-muted fs-5 fw-bold">🎉{c.popularity}</div>
                  <div className="small text-muted fs-5 fw-bold">💰{c.money}</div>
                </div>
                {c.type == "star" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "8px",
                      color: "gold"
                    }}>
                    ★
                  </div>
                )}
              </div>
            </OverlayTrigger>

            <div className="quantity d-flex">
              {Array.from({ length: c.quantity || 0 }).map((_, i) => (
                <div style={{ height: 20, width: 20, backgroundColor: "red", margin: 3 }}></div>
              ))}
            </div>
            <button
              className="btn btn-sm btn-primary mt-2"
              onClick={() => onBuy(c.card_id)}
              disabled={disabled}>
              Acheter
              <div>
                <span>{c.cost}🎉</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Market;
