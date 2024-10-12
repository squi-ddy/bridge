import SetTitle from "@/components/SetTitle"
import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useContext, useEffect } from "react"
import { SettingsContext, SocketContext } from "@/base/BasePage"
import {
    cardSuitToSymbol,
    cardToCardURL,
    countCardsOfSuit,
    cardSort,
} from "@/util/cards"
import BettingStage from "@/components/BettingStage"
import WashStage from "@/components/WashStage"
import ChoosePartnerStage from "@/components/ChoosePartnerStage"
import PlayingStage from "@/components/PlayingStage"
import { Card } from "@backend/types/Card"
import RoundEndStage from "@/components/RoundEndStage"
import GameEndStage from "@/components/GameEndStage"
import CardImage from "@/components/CardImage"
import { Bet } from "@backend/types/Bet"
import Centred from "@/components/Centred"

type BetHistoryData =
    | {
          pass: false
          fill: false
          bet: Bet
          winning: boolean
      }
    | {
          pass: true
          fill: false
      }
    | {
          fill: true
          fillString: string
          pass: false
      }

const showBettingHistory = (history: BetHistoryData[], idx: number) => {
    return history
        .filter((_, i) => i % 4 === idx)
        .map((bet, index) => {
            if (bet.pass) return <Centred key={index}>P</Centred>
            if (bet.fill) return <Centred key={index}>{bet.fillString}</Centred>
            else
                return (
                    <Centred
                        key={index}
                        className={`${
                            bet.winning ? "border rounded-md px-2 py-1" : ""
                        }`}
                    >{`${bet.bet.contract} ${
                        cardSuitToSymbol[bet.bet.suit]
                    }`}</Centred>
                )
        })
}

function GamePage() {
    const navigate = useNavigate()

    const { gameState, socket } = useContext(SocketContext)
    const { settings } = useContext(SettingsContext)

    const { roomCode: roomCodeParam } = useParams()

    useEffect(() => {
        if (gameState && gameState.roomCode !== roomCodeParam) {
            navigate("/room/" + gameState.roomCode)
        } else if (gameState === null) {
            navigate("/")
        }
    }, [gameState, navigate, roomCodeParam])

    const isActive = useCallback(
        (idx: number) => {
            if (gameState?.gameState === 1) {
                return false
            } else if (
                gameState?.gameState === 2 ||
                gameState?.gameState === 3 ||
                gameState?.gameState === 4
            ) {
                return idx === gameState?.currentActivePlayer
            } else if (
                gameState?.gameState === 5 ||
                gameState?.gameState === 6
            ) {
                return !gameState?.okMoveOn[idx]
            }
        },
        [gameState],
    )

    const getCentreDisplay = useCallback(() => {
        if (gameState?.gameState === 1) {
            return <WashStage />
        } else if (gameState?.gameState === 2) {
            return <BettingStage />
        } else if (gameState?.gameState === 3) {
            return <ChoosePartnerStage />
        } else if (gameState?.gameState === 4) {
            return <PlayingStage />
        } else if (gameState?.gameState === 5) {
            return <RoundEndStage />
        } else if (gameState?.gameState === 6) {
            return <GameEndStage />
        }
    }, [gameState])

    const playCard = useCallback(
        (card: Card) => {
            if (
                gameState?.currentActivePlayer ===
                    gameState?.playerData.order &&
                gameState?.gameState === 4
            ) {
                socket?.emitWithAck("playCard", card)
            }
        },
        [gameState, socket],
    )

    if (!gameState) return <></>

    let history: BetHistoryData[] = [
        ...gameState.betHistory.map<BetHistoryData>((bet) =>
            bet
                ? { pass: false, fill: false, bet, winning: false }
                : { pass: true, fill: false },
        ),
    ]
    if (gameState.gameState > 2) {
        // add winning bet
        const winningBet = gameState.currentBet
        history = [
            ...history,
            { pass: false, fill: false, bet: winningBet, winning: true },
        ]
    }
    const numBetCols = Math.ceil(history.length / 4)
    history = [
        ...history,
        ...Array.from<unknown, BetHistoryData>(
            { length: numBetCols * 4 - history.length },
            () =>
                gameState.gameState > 2
                    ? { fill: true, pass: false, fillString: "-" }
                    : { fill: true, fillString: "", pass: false },
        ),
    ]

    return (
        <>
            <SetTitle title={`Room ${gameState.roomCode}`} />

            <div className="flex gap-2 justify-center items-center border-b-2 p-2 w-full text-2xl">
                Room code:{" "}
                <span className="font-bold text-orange-400">
                    {gameState.roomCode}
                </span>
            </div>

            <div className="flex flex-col gap-2 justify-center items-center border-b-2 p-2 w-full grow">
                <div
                    className="grid gap-x-4 gap-y-1 text-xl"
                    style={{
                        gridTemplateColumns: `repeat(${numBetCols + 3}, auto)`,
                    }}
                >
                    <div />
                    <div />
                    <Centred>
                        {gameState.gameState === 4 || gameState.gameState === 5
                            ? "Pts"
                            : ""}
                    </Centred>
                    {Array.from({ length: numBetCols }, (_, idx) => (
                        <Centred key={idx}>Bet {idx + 1}</Centred>
                    ))}
                    {gameState.playerData.playerNames.map(
                        (player, idx: number) => (
                            <>
                                <Centred>
                                    {gameState.playerData.order === idx
                                        ? "⮕"
                                        : ""}
                                </Centred>
                                <Centred
                                    className={`${
                                        isActive(idx) &&
                                        gameState.gameState !== 1
                                            ? "text-orange-400"
                                            : ""
                                    }`}
                                >
                                    {player}
                                </Centred>
                                <Centred>
                                    {gameState.gameState === 4 ||
                                    gameState.gameState === 5
                                        ? `${gameState.tricksWon[idx].length}`
                                        : ""}
                                </Centred>
                                {showBettingHistory(history, idx)}
                            </>
                        ),
                    )}
                </div>
                <div className="grow" />
                <div className="flex flex-col gap-4 items-center justify-center">
                    {getCentreDisplay()}
                </div>
                <div className="grow" />
                <p className="text-2xl">
                    {countCardsOfSuit(gameState.playerData.hand!)}
                </p>
                <div className="flex flex-row w-full mb-4 justify-center">
                    {gameState.playerData.hand
                        ?.map((card, idx) => ({
                            card: card,
                            valid: gameState.playerData.cardValid[idx],
                        }))
                        .sort((a, b) => cardSort(a, b, settings.balatro))
                        .map((card) => (
                            <CardImage
                                key={cardToCardURL(card.card, settings.balatro)}
                                card={card.card}
                                balatro={settings.balatro}
                                className={`w-[6%] ${
                                    gameState.gameState === 4 &&
                                    gameState.currentActivePlayer ===
                                        gameState.playerData.order &&
                                    card.valid
                                        ? "hover:-translate-y-5"
                                        : ""
                                } transition-transform duration-100 ${
                                    gameState.gameState === 4 && !card.valid
                                        ? "opacity-50"
                                        : ""
                                }`}
                                onClick={() => {
                                    if (card.valid) playCard(card.card)
                                }}
                            />
                        ))}
                </div>
            </div>
        </>
    )
}

export default GamePage
