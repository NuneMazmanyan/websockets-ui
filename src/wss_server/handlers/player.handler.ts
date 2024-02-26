import { User, BsWebsocket } from '../../models/models';
import fs from 'fs';
import path from 'path';
import { Commands } from '../../commands';

const usersDB = path.join(__dirname, '..', '..', '..', 'src', 'DB', 'users.db.json');
let users: User[] = [];

export const handleUser = (name: string, ws: BsWebsocket): string => {
    const userExists = checkUser(name);
    if (userExists) {
        console.log(`User ${name} already exists`);
    }

    const newUser = createUser({ name });
    ws.index = newUser.index!;
    ws.name = newUser.name;

    console.log('New user added:', newUser);

    return JSON.stringify({
        type: Commands.reg,
        data: JSON.stringify({
            name: newUser.name,
            index: newUser.index,
            error: userExists,
            errorText: userExists ? 'User already exists' : '',
        }),
        id: 0,
    });
};

initializeUsers();

function initializeUsers() {
    try {
        if (fs.existsSync(usersDB)) {
            const fileContent = fs.readFileSync(usersDB, 'utf-8');
            const parsedData = JSON.parse(fileContent);
            if (parsedData.users && Array.isArray(parsedData.users)) {
                users = parsedData.users;
            } else {
                console.log('Invalid data in users database file. Initializing with empty array.');
            }
        } else {
            console.log('Users database file does not exist. Initializing with empty array.');
        }
    } catch (error) {
        console.error('Error initializing users database:', error);
    }
}

function writeFile(content: string) {
    fs.writeFile(usersDB, content, (err) => {
        if (err) {
            console.error('Error writing users database:', err);
        } else {
            console.log('Users database updated.');
        }
    });
}

export function createUser(userCredentials: User): User {
    let user: User = {
        ...userCredentials,
        index: Date.now(),
    };
    addPlayer(user);
    return user;
}

async function readUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(usersDB, (err, data) => {
            if (err) {
                console.error('Error reading users database:', err);
                resolve([]);
            } else {
                try {
                    const fileContent = JSON.parse(data.toString());
                    resolve(fileContent.users || []);
                } catch (parseError) {
                    console.error('Error parsing users database JSON:', parseError);
                    resolve([]);
                }
            }
        });
    });
}

function checkUser(name: string): boolean {
    return users.some(user => user.name === name);
}

function addPlayer(player: User): User {
    users.push(player);
    writeFile(JSON.stringify({ users: users }));
    return player;
}
