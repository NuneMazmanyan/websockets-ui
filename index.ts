import { httpServer } from "./src/http_server/index";
import dotenv from 'dotenv';
import { cwd } from 'process';
import { resolve } from 'path';
import { startWsServer } from './src/wss_server/ws.server';

dotenv.config({ path: resolve(cwd(), '.env') });

const HTTP_PORT = process.env.HTTP_PORT || 8181;

console.log(`Start static http server is running on ${HTTP_PORT} port`);
httpServer.listen(HTTP_PORT);
startWsServer();
