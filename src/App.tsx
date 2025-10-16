import Home from "./components/Home";
import { SocketProvider } from "./hooks/socket.context";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <SocketProvider>
      <Home />
    </SocketProvider>
  );
}

export default App;
