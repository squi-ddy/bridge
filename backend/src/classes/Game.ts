import { Socket } from 'socket.io'
import { Bet } from 'types/Bet'
import { Card } from 'types/Card'
import { PlayerData } from 'types/PlayerData'
import { censorPlayerData } from 'util/censorPlayerData'
import { dealHands } from 'util/dealCards'

export class Game {
    players: PlayerData[]
    gameState: number // 0 = waiting, 1 = betting, 2 = choose partner, 3 = playing
    currentBet: Bet
    currentActivePlayer: number
    roundStartPlayer: number
    tricksWon: Card[][][]
    playedCards: (Card | null)[]

    constructor() {
        this.players = []
        this.gameState = 0
        this.currentBet = {
            contract: 0,
            suit: 4,
            pid: -1
        }
        this.currentActivePlayer = -1
        this.roundStartPlayer = -1
        this.tricksWon = [[], [], [], []]
        this.playedCards = [null, null, null, null]
    }

    addPlayer(socket: Socket, pid: number, name: string) {
        if (this.gameState !== 0 || this.players.length >= 4) {
            return
        }
        const playerData: PlayerData = {
            id: pid,
            team: 0,
            cards: [],
            socket: socket,
            name: name
        }
        this.players.push(playerData)
        for (const {id, socket} of this.players) {
            socket.emit("syncLobby", censorPlayerData(this.players, id))
        }
    }

    removePlayer(pid: number) {
        if (this.gameState !== 0) {
            return
        }
        this.players = this.players.filter(player => player.id !== pid)
        for (const {id, socket} of this.players) {
            socket.emit("syncLobby", censorPlayerData(this.players, id))
        }
    }

    movePlayer(pid: number, rel: number) {
        // rel +1 -> move down, rel -1 -> move up
        if (this.gameState !== 0) {
            return
        }
        const playerIndex = this.players.findIndex(player => player.id === pid)
        if (playerIndex === 0) {
            return
        }
        const player = this.players[playerIndex]
        this.players[playerIndex] = this.players[playerIndex + rel]
        this.players[playerIndex + rel] = player
        for (const {id, socket} of this.players) {
            socket.emit("syncLobby", censorPlayerData(this.players, id))
        }
    }

    resetState() {
        this.currentBet = {
            contract: 0,
            suit: 4,
            pid: -1
        }
        this.currentActivePlayer = -1
        this.roundStartPlayer = -1
        this.tricksWon = [[], [], [], []]
        this.playedCards = [null, null, null, null]
    }


    startGame() {
        if (this.players.length !== 4 || this.gameState !== 0) {
            return;
        }

        this.gameState = 1
        this.resetState()
        const hands = dealHands()
        for (let i = 0; i < 4; i++) {
            this.players[i].cards = hands[i]
        }

        for (const {socket} of this.players) {
            socket.emit("startGame", censorPlayerData(this.players, -1))
        }

        this.currentActivePlayer = 0
        const player = this.players[this.currentActivePlayer]
        player.socket.emit("submitBet", this.currentBet)
    }

    submitBet(pid: number, bet: Bet | null) {
        if (this.gameState !== 1 || this.currentActivePlayer !== this.players.findIndex(player => player.id === pid)) {
            return
        }

        this.currentActivePlayer = (this.currentActivePlayer + 1) % 4
        if (!bet) {
            const player = this.players[this.currentActivePlayer]
            if (player.id === this.currentBet.pid) {
                this.choosePartner()
                return
            }
            player.socket.emit("submitBet", this.currentBet)
            return
        }

        if (bet.contract < this.currentBet.contract || bet.suit < this.currentBet.suit) {
            return
        }

        this.currentBet = bet
        const player = this.players[this.currentActivePlayer]
        player.socket.emit("submitBet", this.currentBet)
    }

    choosePartner() {
        this.gameState = 2
        this.currentActivePlayer = -1

        for (const {socket} of this.players) {
            socket.emit("choosePartner", this.currentBet.pid)
        }
    }

    choosePartnerSubmit(pid: number, partnerCard: Card) {
        if (this.gameState !== 2 || this.currentBet.pid !== pid) {
            return
        }

        const partner = this.players.find(player => player.cards.some(card => card.value === partnerCard.value && card.suit === partnerCard.suit))!
        for (const player of this.players) {
            player.team = 2
        }
        partner.team = 1
        this.players[pid].team = 1


        this.gameState = 3
        for (const {socket} of this.players) {
            socket.emit("startRounds", this.currentBet)
        }

        let startingPlayer = this.players.findIndex(player => player.id === this.currentBet.pid)
        if (this.currentBet.suit !== 4) {
            startingPlayer = (startingPlayer + 1) % 4
        }

        this.roundStartPlayer = startingPlayer
        this.currentActivePlayer = startingPlayer

        const player = this.players[this.currentActivePlayer]
        player.socket.emit("playCard", -1)
    }

    playCard(pid: number, card: Card) {
        if (this.gameState !== 3 || this.currentActivePlayer !== this.players.findIndex(player => player.id === pid)) {
            return
        }

        const player = this.players[this.currentActivePlayer]

        if (!player.cards.some(c => c.value === card.value && c.suit === card.suit)) {
            // you don't have that card
            return
        }

        this.playedCards[this.currentActivePlayer] = card
        const firstPlayedCard = this.playedCards[this.roundStartPlayer]!
        if (card.suit !== firstPlayedCard.suit && player.cards.some(c => c.suit === firstPlayedCard.suit)) {
            // illegal play
            return
        }

        player.cards = player.cards.filter(c => c.value !== card.value || c.suit !== card.suit)

        for (const {socket} of this.players) {
            socket.emit("playedCard", pid, card)
        }

        this.currentActivePlayer = (this.currentActivePlayer + 1) % 4
        if (this.currentActivePlayer === this.roundStartPlayer) {
            this.endRound()
        } else {
            const player = this.players[this.currentActivePlayer]
            player.socket.emit("playCard", firstPlayedCard.suit)
        }
    }

    endRound() {
        if (this.gameState !== 3) {
            return
        }

        if (this.playedCards.some(card => card === null)) {
            return
        }

        let winningPlayer = this.roundStartPlayer
        let winningCard = this.playedCards[winningPlayer]!
        for (let i = 1; i < 4; i++) {
            const card = this.playedCards[i]!
            if (card.suit === this.currentBet.suit && winningCard.suit !== this.currentBet.suit) {
                // trumped, auto win
                winningPlayer = i
                winningCard = card
            } else if (card.suit === winningCard.suit && card.value > winningCard.value) {
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
            const player = this.players[i]
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

        for (const {socket} of this.players) {
            socket.emit("endRound", winningPlayer)
        }

        this.playedCards = [null, null, null, null]
        const player = this.players[this.currentActivePlayer]
        player.socket.emit("playCard", -1)

    }

    endGame(winningTeam: number) {
        for (const {socket} of this.players) {
            socket.emit("endGame", winningTeam)
        }

        this.gameState = 0
    }

    resyncSocket(pid: number, socket: Socket) {
        const player = this.players.find(player => player.id === pid)
        if (player) {
            player.socket = socket
            player.socket.emit("syncFullState", this.gameState, this.currentBet, this.currentActivePlayer, this.roundStartPlayer, this.tricksWon, this.playedCards, censorPlayerData(this.players, pid))
            if (this.currentActivePlayer === -1 || this.currentActivePlayer === pid) {
                if (this.gameState === 1) {
                    player.socket.emit("submitBet", this.currentBet)
                } else if (this.gameState === 2) {
                    player.socket.emit("choosePartner", this.currentBet.pid)
                } else if (this.gameState === 3) {
                    player.socket.emit("playCard", this.playedCards[this.roundStartPlayer]?.suit || -1)
                }
            }
        }
    }
}