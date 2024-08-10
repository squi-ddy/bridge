import { CensoredData } from "types/CensoredData";
import { PlayerData } from "types/PlayerData";

export function censorPlayerData(players: PlayerData[], pid: number): CensoredData {
    return {
        id: pid,
        playerIds: players.map(player => player.id),
        playerNames: players.map(player => player.name),
        numCards: players.map(player => player.cards.length),
        hand: players.find(player => player.id === pid)?.cards || []
    }
}