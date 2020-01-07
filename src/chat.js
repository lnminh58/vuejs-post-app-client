import Ws from '@adonisjs/websocket-client';

const ws = Ws(process.env.VUE_APP_WEB_SOCKET_URL);

ws.connect();

let isConnected = false;

ws.on('open', () => {
  isConnected = true;
  console.log('on open', isConnected);
});

ws.on('close', () => {
  isConnected = false;
  console.log('on close', isConnected);
});

export default ws;
