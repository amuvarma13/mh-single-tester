const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080, host:'0.0.0.0' });

wss.on('connection', (ws) => {
    console.log('A client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});