import { Commands } from '../../commands';
import {Game} from "../../models/models";


export let game: Game = {gameId: 0, playerId: 0};
function createGame(roomId: number, playerId: number) {
    game.gameId = roomId;
    game.playerId = playerId;
    return game;
}

export const handleCreateGame = (playerId: number, roomId: number): string => {
    const game = createGame(playerId, roomId);
    console.log(`Game was started in room: `, roomId);

    return JSON.stringify({
        type: Commands.createGame,
        data: JSON.stringify({
            idGame: game.gameId,
            idPlayer: game.playerId,
        }),
        id: 0,
    });
}