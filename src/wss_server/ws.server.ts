import { WebSocketServer } from "ws";
import { Commands } from '../commands';
import { handleUser } from './handlers/player.handler';
import { handleRoom } from './handlers/rooms.handler';
import {BsWebsocket, WebSocketMessage} from '../models/models';


export const startWsServer = (): void => {
    const WSS_PORT = process.env.WSS_PORT || 3000;

    const wsServer = new WebSocketServer({ port: Number(WSS_PORT), clientTracking: true }, () => {
        console.log(`Web Socket server is running on ${WSS_PORT} port`);
    });

    wsServer.on('connection', (ws: BsWebsocket, req) => {

        ws.on('message', (message: string) => {
            try {
                const parsedMessage: WebSocketMessage = JSON.parse(message);
                handleWebSocketMessage(ws, parsedMessage);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        setInterval(() => {
            ws.send(JSON.stringify({ type: 'ping', data: 'keep-alive' }));
        }, 30000);

        ws.on('close', () => {
            ws.close();
        });
    });

    wsServer.on('error', (err) => {
        console.error('WebSocketServer error', err);
    });

    wsServer.on('close', () => {
        wsServer.clients.forEach((client) => {
            client.send('WebSocketServer is closed');
            client.close();
        });
    });

    process.on("SIGNINT", () => {
        console.log("WebSocketServer is closed");
        wsServer.close();
        process.exit(0);
    });
};

function sendMessage(ws: WebSocket, message: WebSocketMessage) {
    ws.send(JSON.stringify(message));
}

function handleWebSocketMessage(ws: BsWebsocket, message: WebSocketMessage) {
    console.log('Received message:', message);
    switch (message.type) {
        case Commands.reg: {
            const payload = message.data;
            const response = handleUser(payload.name, ws);
            ws.send(JSON.stringify(response));
            break;
        }
        case Commands.createRoom: {
            const response = handleRoom(ws);
            ws.send(JSON.stringify(response));
            break
        }
        default: {
            console.log('Unknown message type:', message.type);
        }
    }
}
