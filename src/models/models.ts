import {WebSocket} from 'ws';

export interface BsWebsocket extends WebSocket {
    index: number;
    name: string;
}

export interface WebSocketMessage {
    type: string;
    data: any;
}

export interface User {
    name: string,
    password?: string,
    index?: number
}

export interface UserRequest {
    name: string,
    password: string
}

export interface UserResponse {
    name: string,
    index: number
}

export interface Room {
    roomId: number;
    roomUsers: User[];
}

export interface Winner {
    name: string;
    wins: number;
}

export interface Game {
    gameId: number;
    playerId: number;
}