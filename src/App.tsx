import React from "react";
import Home from "./components/Home";
import { SocketProvider } from "./hooks/socket.context";

function App() {
  return (
    <SocketProvider>
      <Home />
    </SocketProvider>
  );
}

export default App;
