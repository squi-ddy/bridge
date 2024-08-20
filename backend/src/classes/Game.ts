import { Socket } from "socket.io"
import { Bet } from "types/Bet"
import { Card } from "types/Card"
import { PlayerData } from "types/PlayerData"
import { censorPlayerData } from "util/censorPlayerData"
import { calculateWash, dealHands } from "util/dealCards"

export class Game {
    players: Map<string, PlayerData>
    playerOrder: string[]
    gameState: number // 0 = waiting, 1 = betting, 2 = choose partner, 3 = playing
    currentBet: Bet
    currentActivePlayer: number
    roundStartPlayer: number
    tricksWon: Card[][][]
    playedCards: (Card | null)[]

    constructor() {
        this.players = new Map()
        this.playerOrder = []
        this.gameState = 0
        this.currentBet = {
            contract: 0,
            suit: 4,
            pid: "",
        }
        this.currentActivePlayer = -1
        this.roundStartPlayer = -1
        this.tricksWon = [[], [], [], []]
        this.playedCards = [null, null, null, null]
    }

    getPlayerSocket(pid: string) {
        return this.players.get(pid)?.socket
    }

    addPlayer(socket: Socket, pid: string, name: string): boolean {
        if (this.gameState !== 0 || this.players.size >= 4) {
            return false
        }
        const playerData: PlayerData = {
            id: pid,
            team: 0,
            cards: [],
            handPoints: 0,
            socket: socket,
            name: name,
            okToStart: false,
        }
        this.players.set(pid, playerData)
        this.playerOrder.push(pid)
        for (const player of this.players.values()) {
            player.socket.emit("syncLobby", this.getFullState(player.id))
        }
        return true
    }

    removePlayer(pid: string): boolean {
        if (this.gameState !== 0) {
            return false
        }
        this.players.delete(pid)
        this.playerOrder = this.playerOrder.filter((id) => id !== pid)
        for (const player of this.players.values()) {
            player.socket.emit("syncLobby", this.getFullState(player.id))
        }
        return true
    }

    movePlayer(pid: string, rel: number) {
        // rel +1 -> move down, rel -1 -> move up
        if (this.gameState !== 0) {
            return
        }
        const playerIndex = this.playerOrder.findIndex((id) => id === pid)
        if (
            playerIndex + rel < 0 ||
            playerIndex + rel >= this.playerOrder.length
        ) {
            return
        }
        this.playerOrder[playerIndex] = this.playerOrder[playerIndex + rel]
        this.playerOrder[playerIndex + rel] = pid
        for (const player of this.players.values()) {
            player.socket.emit("syncLobby", this.getFullState(player.id))
        }
    }

    resetState() {
        this.currentBet = {
            contract: 0,
            suit: 4,
            pid: "",
        }
        this.currentActivePlayer = -1
        this.roundStartPlayer = -1
        this.tricksWon = [[], [], [], []]
        this.playedCards = [null, null, null, null]
    }

    toggleToStart(pid: string): boolean {
        if (this.gameState !== 0) {
            return false
        }
        const player = this.players.get(pid)
        if (player) {
            player.okToStart = !player.okToStart
            if (
                this.players.size === 4 &&
                Array.from(this.players.values()).every(
                    (player) => player.okToStart,
                )
            ) {
                this.startGame()
                return true
            }
            for (const player of this.players.values()) {
                player.socket.emit("syncLobby", this.getFullState(player.id))
            }
        }
        return true
    }

    startGame() {
        if (this.players.size !== 4 || this.gameState !== 0) {
            return
        }

        this.gameState = 1
        this.resetState()
        const hands = dealHands()
        let lowestScore = 5
        for (let i = 0; i < 4; i++) {
            this.players.get(this.playerOrder[i])!.cards = hands[i]
            const handPoints = calculateWash(hands[i])
            this.players.get(this.playerOrder[i])!.handPoints = handPoints
            lowestScore = Math.min(lowestScore, handPoints)
        }

        if (lowestScore <= 4) {
            for (const player of this.players.values()) {
                player.socket.emit("waitWash", this.getFullState(player.id))
            }
            return
        }

        this.currentActivePlayer = 0
        for (const player of this.players.values()) {
            player.socket.emit("startGame", this.getFullState(player.id))
        }
    }

    submitWash(pid: string): boolean {
        if (this.gameState !== 1 || this.players.get(pid)!.handPoints > 4) {
            return false
        }

        for (const player of this.players.values()) {
            player.socket.emit("wash", this.getFullState(player.id))
        }

        this.startGame()
        return true
    }

    submitBet(pid: string, bet: Bet | null): boolean {
        if (
            this.gameState !== 1 ||
            this.currentActivePlayer !==
                this.playerOrder.findIndex((id) => id === pid)
        ) {
            return false
        }

        this.currentActivePlayer = (this.currentActivePlayer + 1) % 4
        if (!bet) {
            const player = this.players.get(
                this.playerOrder[this.currentActivePlayer],
            )!
            if (player.id === this.currentBet.pid) {
                this.choosePartner()
                return true
            }
            for (const player of this.players.values()) {
                player.socket.emit("submitBet", this.getFullState(player.id))
            }
            return true
        }

        if (
            bet.contract < this.currentBet.contract ||
            bet.suit < this.currentBet.suit
        ) {
            return false
        }

        this.currentBet = bet
        for (const player of this.players.values()) {
            player.socket.emit("submitBet", this.getFullState(player.id))
        }
        return true
    }

    choosePartner() {
        this.gameState = 2
        this.currentActivePlayer = -1

        for (const player of this.players.values()) {
            player.socket.emit("choosePartner", this.getFullState(player.id))
        }
    }

    choosePartnerSubmit(pid: string, partnerCard: Card): boolean {
        if (this.gameState !== 2 || this.currentBet.pid !== pid) {
            return false
        }

        let partner
        for (const player of this.players.values()) {
            if (
                player.cards.some(
                    (card) =>
                        card.value === partnerCard.value &&
                        card.suit === partnerCard.suit,
                )
            ) {
                partner = player
                break
            }
        }

        if (!partner) {
            return false
        }

        for (const player of this.players.values()) {
            player.team = 2
        }

        partner.team = 1
        this.players.get(pid)!.team = 1

        this.gameState = 3

        let startingPlayer = this.playerOrder.findIndex(
            (id) => id === this.currentBet.pid,
        )
        if (this.currentBet.suit !== 4) {
            startingPlayer = (startingPlayer + 1) % 4
        }

        this.roundStartPlayer = startingPlayer
        this.currentActivePlayer = startingPlayer

        for (const player of this.players.values()) {
            player.socket.emit("startRounds", this.getFullState(player.id))
        }

        return true
    }

    playCard(pid: string, card: Card): boolean {
        if (
            this.gameState !== 3 ||
            this.playerOrder[this.currentActivePlayer] !== pid
        ) {
            return false
        }

        const player = this.players.get(
            this.playerOrder[this.currentActivePlayer],
        )!

        if (
            !player.cards.some(
                (c) => c.value === card.value && c.suit === card.suit,
            )
        ) {
            // you don't have that card
            return false
        }

        this.playedCards[this.currentActivePlayer] = card
        const firstPlayedCard = this.playedCards[this.roundStartPlayer]!
        if (
            card.suit !== firstPlayedCard.suit &&
            player.cards.some((c) => c.suit === firstPlayedCard.suit)
        ) {
            // illegal play
            return false
        }

        player.cards = player.cards.filter(
            (c) => c.value !== card.value || c.suit !== card.suit,
        )

        this.currentActivePlayer = (this.currentActivePlayer + 1) % 4
        if (this.currentActivePlayer === this.roundStartPlayer) {
            this.endRound()
        } else {
            for (const player of this.players.values()) {
                player.socket.emit("playCard", this.getFullState(player.id))
            }
        }
        return true
    }

    endRound() {
        if (this.gameState !== 3) {
            return
        }

        if (this.playedCards.some((card) => card === null)) {
            return
        }

        let winningPlayer = this.roundStartPlayer
        let winningCard = this.playedCards[winningPlayer]!
        for (let i = 1; i < 4; i++) {
            const card = this.playedCards[i]!
            if (
                card.suit === this.currentBet.suit &&
                winningCard.suit !== this.currentBet.suit
            ) {
                // trumped, auto win
                winningPlayer = i
                winningCard = card
            } else if (
                card.suit === winningCard.suit &&
                card.value > winningCard.value
            ) {
                winningPlayer = i
                winningCard = card
            }
        }

        this.currentActivePlayer = winningPlayer
        this.roundStartPlayer = winningPlayer
        this.tricksWon[winningPlayer].push(this.playedCards as Card[])

        let team1Tricks = 0
        let team2Tricks = 0

        for (let i = 0; i < 4; i++) {
            const player = this.players.get(this.playerOrder[i])!
            if (player.team === 1) {
                team1Tricks += this.tricksWon[i].length
            } else {
                team2Tricks += this.tricksWon[i].length
            }
        }

        if (team1Tricks === 6 + this.currentBet.contract) {
            this.endGame(1)
            return
        } else if (team2Tricks === 8 - this.currentBet.contract) {
            // 13 - (6 + this.currentBet.contract) + 1 = 8 - this.currentBet.contract
            this.endGame(2)
            return
        }

        this.playedCards = [null, null, null, null]
        for (const player of this.players.values()) {
            player.socket.emit("endRound", this.getFullState(player.id))
        }
    }

    endGame(winningTeam: number) {
        for (const { socket } of this.players.values()) {
            socket.emit(
                "endGame",
                Array.from(this.players.values())
                    .filter((player) => player.team === winningTeam)
                    .map((player) => player.id),
            )
        }

        this.resetState()
        this.gameState = 0
    }

    resyncSocket(pid: string, socket: Socket): boolean {
        const player = this.players.get(pid)
        if (player) {
            player.socket = socket
            player.socket.emit("syncState", this.getFullState(pid))
            return true
        }
        return false
    }

    getFullState(pid: string) {
        return {
            gameState: this.gameState,
            currentBet: this.currentBet,
            currentActivePlayer: this.currentActivePlayer,
            roundStartPlayer: this.roundStartPlayer,
            tricksWon: this.tricksWon,
            playedCards: this.playedCards,
            players: censorPlayerData(this.players, this.playerOrder, pid),
        }
    }
}
