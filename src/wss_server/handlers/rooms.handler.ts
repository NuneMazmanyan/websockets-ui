import { Room, BsWebsocket } from '../../models/models';
import fs from 'fs';
import path from 'path';
import { Commands } from '../../commands';

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
            rooms = JSON.parse(fileContent).rooms || [];
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

function createRoom(ws: BsWebsocket) {
    const room: Room = {
        roomId: Date.now(),
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
