import { WebSocketServer } from "ws";
import { Commands } from '../commands';
import { handleUser } from './handlers/player.handler';
import { handleRoom } from './handlers/rooms.handler';
import { BsWebsocket } from '../models/models';


export const startWsServer = (): void => {
    const WSS_PORT = process.env.WSS_PORT || 3000;

    const wsServer = new WebSocketServer({ port: Number(WSS_PORT), clientTracking: true }, () => {
        console.log(`Web Socket server is running on ${WSS_PORT} port`);
    });

    wsServer.on('connection', (ws: BsWebsocket, req) => {

        ws.on('message', (message: string) => {
            const request = JSON.parse(message);
            const command = request.type;

            switch (command) {
                case Commands.reg: {
                    const payload = JSON.parse(request.data);
                    const response = handleUser(payload.name, ws);
                    ws.send(response);
                    break;
                }
                case Commands.createRoom: {
                        const response = handleRoom(ws);
                        ws.send(response);
                        break
                }
            }
        });

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