import React, { createContext, useContext, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const URL = "https://sandy-successful-cet-basics.trycloudflare.com";

interface SocketContextType {
  socket: Socket | null;
  token: string | null;
  login: (username: string) => Promise<boolean>; // ← Promise<boolean>
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  token: null,
  login: async () => false
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${URL}/auth/temp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      const jwt = data.token;
      setToken(jwt);

      // Étape 2 : créer le socket en mettant le JWT dans auth
      socketRef.current = io(URL, {
        autoConnect: true,
        auth: { token: jwt }
      });

      if (data.token) {
        setToken(data.token);
        return true; // ← retourne true si login réussi
      }
      return false; // ← retourne false sinon
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return <SocketContext.Provider value={{ socket: socketRef.current, token, login }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
