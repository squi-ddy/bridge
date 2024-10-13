import { Game } from "./classes/Game"

const games = new Map<string, Game>()

export function addGame(gid: string): void {
    games.set(gid, new Game(gid))
}

export function getGame(gid: string): Game | undefined {
    return games.get(gid)
}

export function deleteGame(gid: string): void {
    games.delete(gid)
}
