import {Room, BsWebsocket, Game} from '../../models/models';
import fs from 'fs';
import path from 'path';
import {Commands} from '../../commands';
import {game} from "./game.handler";

const roomsDB = path.join(__dirname, '..', '..', '..', 'src', 'DB', 'rooms.db.json');
let rooms: Room[] = [];

export const handleRoom = (ws: BsWebsocket): string => {
    const room = createRoom(ws);
    console.log('New room added:', room);

    return JSON.stringify({
        type: Commands.createRoom,
        data: JSON.stringify({
            roomId: room.roomId,
            roomUsers: room.roomUsers,
        }),
        id: 0,
    });
};


initializeRooms();

function initializeRooms() {
    try {
        if (fs.existsSync(roomsDB)) {
            const fileContent = fs.readFileSync(roomsDB, 'utf-8');
            const parsedData = JSON.parse(fileContent);
            if (parsedData.rooms && Array.isArray(parsedData.rooms)) {
                rooms = parsedData.rooms;
            } else {
                console.log('Invalid data in rooms database file. Initializing with empty array.');
            }
        } else {
            console.log('Rooms database file does not exist. Initializing with empty array.');
        }
    } catch (error) {
        console.error('Error initializing rooms database:', error);
    }
}

function writeFile(content: string) {
    fs.writeFile(roomsDB, content, (err) => {
        if (err) {
            console.error('Error writing rooms database:', err);
        } else {
            console.log('Rooms database updated.');
        }
    });
}

export function createRoom(ws: BsWebsocket) {
    const room: Room = {
        roomId: generateId(),
        roomUsers: [{ index: ws.index, name: ws.name }],
    };
    addRoom(room);
    return room;
}

function addRoom(room: Room): Room {
    rooms.push(room);
    writeFile(JSON.stringify({ rooms: rooms }));
    return room;
}

function getRooms(): Room[] {
    return rooms;
}

export const handleAddUserToRoom = (ws: BsWebsocket, roomId: number): string => {
    const room = getRoomById(roomId);
    const userAlreadyInRoom = room?.roomUsers.some((user) => user.index === ws.index);
    if (userAlreadyInRoom) {
        console.log('User already in room');
        return JSON.stringify({
            type: 'error',
            data: JSON.stringify({
                message: 'You cannot add yourself twice in the room!',
            }),
            id: 0,
        });
    }
    const roomPayload = addUserToRoom(ws, roomId);
    console.log(`User ${ws.name} added to room: `, roomId);

    return JSON.stringify({
        type: Commands.updateRoom,
        data: JSON.stringify({
            roomId: roomPayload?.roomId,
            roomUsers: roomPayload?.roomUsers,
        }),
        id: 0,
    });
}

function addUserToRoom(ws: BsWebsocket, roomId: number) {
    const roomIndex = rooms.findIndex((room) => room.roomId === roomId);
    const room = rooms[roomIndex];
    if (room) {
        room.roomUsers.push({index: ws.index, name: ws.name});
        removeRoom(roomId);
        game.playerId = ws.index;
        return room;
    }
}

function getRoomById(roomId: number) {
    const room = rooms.find((room) => room.roomId === roomId);
    return room;
}

function removeRoom(roomId: number) {
    const roomIndex = rooms.findIndex((room) => room.roomId === roomId);
    rooms.splice(roomIndex, 1);
}

export const updateRoom = (): string => {
    const rooms = getRooms();
    console.log('Rooms updated:', rooms);

    return JSON.stringify({
        type: Commands.updateRoom,
        data: JSON.stringify(rooms),
        id: 0,
    });
}

function generateId(): number{
    let id = Math.floor(Math.random()*100000000)
    if(rooms.some(room => room.roomId === id)){
        generateId()
    }
    return id;
}
