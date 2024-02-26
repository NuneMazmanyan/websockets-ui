import {WebSocketServer} from "ws";
import {Commands} from '../commands';
import {handleUser} from './handlers/player.handler';
import {handleAddUserToRoom, handleRoom, updateRoom} from './handlers/rooms.handler';
import {BsWebsocket, WebSocketMessage} from '../models/models';
import {handleCreateGame} from "./handlers/game.handler";


export const startWsServer = (): void => {
    const WSS_PORT = process.env.WSS_PORT || 3000;

    const wsServer = new WebSocketServer({port: Number(WSS_PORT), clientTracking: true}, () => {
        console.log(`Web Socket server is running on ${WSS_PORT} port`);
    });

    wsServer.on('connection', (ws: BsWebsocket, req) => {

        ws.on('message', (message: string) => {
            try {
                const parsedMessage: WebSocketMessage = JSON.parse(message);
                handleWebSocketMessage(ws, parsedMessage, wsServer);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        setInterval(() => {
            ws.send(JSON.stringify({type: 'ping', data: 'keep-alive'}));
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

function handleWebSocketMessage(ws: BsWebsocket, message: WebSocketMessage, wsServer: WebSocketServer) {
    console.log('Received message:', message);
    switch (message.type) {
        case Commands.reg: {
            const payload = JSON.parse(message.data);
            const userReponse = handleUser(payload.name, ws);
            ws.send(userReponse);
        }
        case Commands.createRoom: {
            const room = handleRoom(ws);
            wsServer.clients.forEach((client) => {
                client.send(updateRoom());
            });
            ws.send(room);
            break;
        }
        // case Commands.startGame:startGam
        case Commands.updateRoom: {
            const indexRoom = JSON.parse(message.data).indexRoom;
            const userReponse = handleAddUserToRoom(ws, indexRoom);

            wsServer.clients.forEach((client) => {
                client.send(updateRoom());
            });
            const game = handleCreateGame(ws.index, indexRoom);
            wsServer.clients.forEach((client) => {
                client.send(userReponse);
                client.send(game);
            });
            break;
        }
        // case Commands.updateWinners: break;
        case Commands.createGame: {
            const payload = JSON.parse(message.data);
            const playerId = payload.playerId;
            const roomId = payload.roomId;
            const game = handleCreateGame(playerId, roomId);
            ws.send(game);
            break;
        }
        default: {
            console.log('Unknown message type:', message.type);
        }
    }
}

