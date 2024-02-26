import {Winner, BsWebsocket} from '../../models/models';
import fs from 'fs';
import path from 'path';
import {Commands} from '../../commands';

const winnersDB = path.join(__dirname, '..', '..', '..', 'src', 'DB', 'winners.db.json');
let winners: Winner[] = [];

function updateWinners(data: Winner[]) {
    winners = data;
    winners.push(...data);
    writeFile(JSON.stringify({winners: winners}));
    return winners;
}

export function handleUpdateWinners(data: Winner[]) {
    const winners = updateWinners(data);
    return JSON.stringify({
        type: Commands.updateWinners,
        data: JSON.stringify(winners),
        id: 0,
    });
};


function writeFile(content: string) {
    fs.writeFile(winnersDB, content, (err) => {
        if (err) {
            console.error('Error writing rooms database:', err);
        } else {
            console.log('Rooms database updated.');
        }
    });
}