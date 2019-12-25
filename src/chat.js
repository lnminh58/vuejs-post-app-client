import Ws from '@adonisjs/websocket-client';

const ws = Ws('ws://localhost:3333');

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

const chat = ws.subscribe('chat:new');
chat.on('ready', () => {
  console.log('ready');
  chat.emit('message', 'hello');
});

chat.on('error', error => {
  console.log('error chat', error);
});

chat.on('close', () => {
  console.log('closed');
});
