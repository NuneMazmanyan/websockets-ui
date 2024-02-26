import { WebSocket } from 'ws';

export interface BsWebsocket extends WebSocket {
    index: number;
    name: string;
}

export interface User {
    name: string,
    password?: string,
    index?: number
}

export interface UserRequest{
    name: string,
    password: string
}

export interface UserResponse {
    name: string,
    index: number
}

export interface Room{
    roomId: number;
    roomUsers: User[];
}