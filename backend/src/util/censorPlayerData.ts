import { CensoredData } from "types/CensoredData"
import { PlayerData } from "types/PlayerData"

export function censorPlayerData(
    players: Map<string, PlayerData>,
    playerOrder: string[],
    pid: string,
): CensoredData {
    return {
        id: pid,
        playerNames: playerOrder.map((id) => players.get(id)!.name),
        numCards: playerOrder.map((id) => players.get(id)!.cards.length),
        hand: players.get(pid)!.cards || [],
        handPoints: players.get(pid)!.handPoints,
    }
}
