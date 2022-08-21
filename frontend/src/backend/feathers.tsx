import io from 'socket.io-client';
import feathers from '@feathersjs/client';

// Socket.io is exposed as the `io` global.
const socket = io('http://localhost:8082/');

// @feathersjs/client is exposed as the `feathers` global.
const app = (feathers as unknown as Function)();

app.configure(feathers.socketio(socket));
app.configure(feathers.authentication());

export default app
