import { Socket } from "socket.io"
import { Bet } from "@/types/Bet"
import { Card } from "@/types/Card"
import { CensoredGameState } from "@/types/CensoredGameState"
import { PlayerData } from "@/types/PlayerData"
import { censorPlayerData, dedupeName } from "@/util/players"
import { calculateWash, dealHands, isCardValid } from "@/util/cards"

export class Game {
    roomCode: string
    players: Map<string, PlayerData>
    playerOrder: string[]
    gameState: number // 0 = waiting, 1 = wait for wash, 2 = betting, 3 = choose partner, 4 = playing, 5 = round end, 6 = winner!
    currentBet: Bet
    betHistory: Bet[]
    currentActivePlayer: number
    roundStartPlayer: number
    tricksWon: Card[][][]
    playedCards: (Card | null)[]
    okMoveOn: boolean[]
    partnerCard: Card | null
    winningPlayer: number
    trumpBroken: boolean
    winningTeam: number

    constructor(roomCode: string) {
        this.roomCode = roomCode
        this.players = new Map()
        this.playerOrder = []
        this.gameState = 0
        this.currentBet = {
            contract: 0,
            suit: 4,
            order: -1,
        }
        this.betHistory = []
        this.currentActivePlayer = -1
        this.roundStartPlayer = -1
        this.tricksWon = [[], [], [], []]
        this.playedCards = [null, null, null, null]
        this.okMoveOn = [false, false, false, false]
        this.partnerCard = null
        this.winningPlayer = -1
        this.trumpBroken = false
        this.winningTeam = -1
    }

    addPlayer(socket: Socket, pid: string, name: string): number {
        if (this.gameState !== 0) {
            return 1 // game already started
        }
            
        if (this.players.size >= 4) {
            return 2 // game full
        }
        
        const playerData: PlayerData = {
            id: pid,
            team: 0,
            cards: [],
            handPoints: 0,
            socket: socket,
            name: dedupeName(Array.from(this.players.values()), name),
            okToStart: false,
        }
        this.players.set(pid, playerData)
        this.playerOrder.push(pid)
        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
        return 0
    }

    removePlayer(pid: string): boolean {
        if (this.gameState !== 0) {
            return false
        }
        this.players.delete(pid)
        this.playerOrder = this.playerOrder.filter((id) => id !== pid)
        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
        return true
    }

    isEmpty(): boolean {
        return this.players.size === 0
    }

    movePlayer(pid: string, rel: number): void {
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
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
    }

    resetState() {
        this.currentBet = {
            contract: 0,
            suit: 4,
            order: -1,
        }
        this.betHistory = []
        this.currentActivePlayer = -1
        this.roundStartPlayer = -1
        this.tricksWon = [[], [], [], []]
        this.playedCards = [null, null, null, null]
        this.okMoveOn = [false, false, false, false]
        this.partnerCard = null
        this.winningPlayer = -1
        this.trumpBroken = false
        this.winningTeam = -1
        this.players.forEach((player) => {
            player.team = 0
            player.cards = []
            player.handPoints = 0
            player.team = 0
            player.okToStart = false
        })
    }

    toggleToStart(pid: string): void {
        if (this.gameState !== 0) {
            return
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
                return
            }
            for (const player of this.players.values()) {
                player.socket?.emit("syncState", this.getFullState(player.id))
            }
        }
        return
    }

    startGame(deal: boolean = true) {
        if (this.players.size !== 4 || (this.gameState !== 0 && this.gameState !== 1)) {
            return
        }

        this.gameState = 1
        let hands: Card[][]
        if (deal) {
            this.resetState()
            hands = dealHands()
        } else {
            hands = Array.from(this.players.values()).map((player) => player.cards)
        }
        let lowestScore = 5
        for (let i = 0; i < 4; i++) {
            this.players.get(this.playerOrder[i])!.cards = hands[i]
            const handPoints = deal ? calculateWash(hands[i]) : this.players.get(this.playerOrder[i])!.handPoints
            this.players.get(this.playerOrder[i])!.handPoints = handPoints
            lowestScore = Math.min(lowestScore, handPoints)
        }

        if (lowestScore <= 4) {
            for (const player of this.players.values()) {
                player.socket?.emit("syncState", this.getFullState(player.id))
            }
            return
        }

        this.gameState = 2
        this.currentActivePlayer = 0
        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
    }

    submitWash(pid: string, acceptWash: boolean): boolean {
        if (this.gameState !== 1 || this.players.get(pid)!.handPoints > 4) {
            return false
        }

        if (acceptWash) {
            this.startGame()
        } else {
            this.players.get(pid)!.handPoints = 5
            this.startGame(false)
        }

        return true
    }

    submitBet(pid: string, bet: Bet | null): boolean {
        if (
            this.gameState !== 2 ||
            this.currentActivePlayer !==
                this.playerOrder.findIndex((id) => id === pid)
        ) {
            return false
        }

        this.currentActivePlayer = (this.currentActivePlayer + 1) % 4
        if (!bet) {
            if (this.currentActivePlayer === this.currentBet.order) {
                this.choosePartner()
                return true
            }
            for (const player of this.players.values()) {
                player.socket?.emit("syncState", this.getFullState(player.id))
            }
            return true
        }

        if (
            bet.contract < this.currentBet.contract || (bet.contract === this.currentBet.contract &&
            bet.suit <= this.currentBet.suit)
        ) {
            return false
        }

        this.currentBet = bet
        this.betHistory.push(bet)
        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
        return true
    }

    choosePartner() {
        this.gameState = 3

        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
    }

    submitPartner(pid: string, partnerCard: Card): boolean {
        if (this.gameState !== 3) {
            return false
        }

        this.partnerCard = partnerCard

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

        this.gameState = 4

        let startingPlayer = this.currentBet.order
        if (this.currentBet.suit !== 4) {
            startingPlayer = (startingPlayer + 1) % 4
        }

        this.roundStartPlayer = startingPlayer
        this.currentActivePlayer = startingPlayer

        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }

        return true
    }

    playCard(pid: string, card: Card): boolean {
        if (
            this.gameState !== 4 ||
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

        const cardIndex = player.cards.findIndex(
            (c) => c.value === card.value && c.suit === card.suit,
        )

        if (!isCardValid(player.cards, cardIndex, this.trumpBroken, this.currentBet.suit, this.playedCards[this.roundStartPlayer])) {
            return false
        }

        if (card.suit === this.currentBet.suit) {
            this.trumpBroken = true
        }

        this.playedCards[this.currentActivePlayer] = card

        player.cards = player.cards.filter(
            (c) => c.value !== card.value || c.suit !== card.suit,
        )

        this.currentActivePlayer = (this.currentActivePlayer + 1) % 4
        if (this.currentActivePlayer === this.roundStartPlayer) {
            this.endRound()
        } else {
            for (const player of this.players.values()) {
                player.socket?.emit("syncState", this.getFullState(player.id))
            }
        }
        return true
    }

    endRound() {
        if (this.gameState !== 4) {
            return
        }

        if (this.playedCards.some((card) => card === null)) {
            return
        }

        let winningPlayer = this.roundStartPlayer
        let winningCard = this.playedCards[winningPlayer]!
        for (let i = 0; i < 4; i++) {
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

        this.winningPlayer = winningPlayer
        this.currentActivePlayer = -1

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
            this.winningTeam = 1
        } else if (team2Tricks === 8 - this.currentBet.contract) {
            // 13 - (6 + this.currentBet.contract) + 1 = 8 - this.currentBet.contract
            this.winningTeam = 2
        }

        if (this.winningTeam === -1) {
            this.gameState = 5
        } else {
            this.gameState = 6
        }

        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }
    }

    submitMoveOn(pid: string): boolean {
        if (this.gameState !== 5 && this.gameState !== 6) {
            return false
        }

        const playerIndex = this.playerOrder.findIndex((id) => id === pid)
        this.okMoveOn[playerIndex] = true

        if (this.okMoveOn.every((ok) => ok)) {
            if (this.gameState === 5) {
                this.gameState = 4
                this.okMoveOn = [false, false, false, false]
                this.playedCards = [null, null, null, null]
                this.currentActivePlayer = this.winningPlayer
                this.roundStartPlayer = this.winningPlayer
            } else {
                this.resetState()
                this.playerOrder = this.playerOrder.slice(1).concat([this.playerOrder[0]])
                this.gameState = 0
            }
        }

        for (const player of this.players.values()) {
            player.socket?.emit("syncState", this.getFullState(player.id))
        }

        return true
    }

    resyncSocket(pid: string, socket: Socket): number {
        const player = this.players.get(pid)
        if (player) {
            if (player.socket) {
                return 1 // already connected
            }
            player.socket = socket
            player.socket?.emit("syncState", this.getFullState(pid))
            return 2 // reconnected
        }
        return 0 // player not found
    }

    removeSocket(pid: string) {
        const player = this.players.get(pid)
        if (player) {
            player.socket = null
        }
    }

    getFullState(pid: string): CensoredGameState {
        return {
            gameState: this.gameState,
            currentBet: this.currentBet,
            betHistory: this.betHistory,
            currentActivePlayer: this.currentActivePlayer,
            roundStartPlayer: this.roundStartPlayer,
            tricksWon: this.tricksWon,
            playedCards: this.playedCards,
            roomCode: this.roomCode,
            partnerCard: this.partnerCard,
            okMoveOn: this.okMoveOn,
            winningPlayer: this.winningPlayer,
            trumpBroken: this.trumpBroken,
            winningPlayers: this.winningTeam !== -1 ? this.playerOrder.map((pid, idx) => ({player: this.players.get(pid)!, order: idx})).filter((player) => player.player.team === this.winningTeam).map(player => player.order) : [],
            playerData: censorPlayerData(this.players, this.playerOrder, pid, this.trumpBroken, this.currentBet.suit, this.roundStartPlayer >= 0 ? this.playedCards[this.roundStartPlayer] : null),
        }
    }
}
