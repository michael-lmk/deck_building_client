import { io } from 'socket.io-client';

// the URL of your backend server
const URL = 'http://localhost:3005';

export const socket = io(URL, {
  autoConnect: false // We will connect manually
});
