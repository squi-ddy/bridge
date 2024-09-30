import SetTitle from "@/components/SetTitle"
import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useContext, useEffect } from "react"
import { SocketContext } from "@/base/BasePage"
import {
    cardToCardURL,
    countCardsOfSuit,
    redBlackSuitOrdering,
} from "@/util/cards"
import BettingStage from "@/components/BettingStage"
import WashStage from "@/components/WashStage"
import ChoosePartnerStage from "@/components/ChoosePartnerStage"
import PlayingStage from "@/components/PlayingStage"
import { Card } from "@backend/types/Card"
import RoundEndStage from "@/components/RoundEndStage"
import GameEndStage from "@/components/GameEndStage"

function GamePage() {
    const navigate = useNavigate()

    const { gameState, socket } = useContext(SocketContext)
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
                if (gameState?.playerData.handPoints[idx] <= 4) {
                    return true
                } else {
                    return false
                }
            } else if (
                gameState?.gameState === 2 ||
                gameState?.gameState === 3 ||
                gameState?.gameState === 4
            ) {
                return idx === gameState?.currentActivePlayer
            } else if (gameState?.gameState === 5 || gameState?.gameState === 6) {
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
                <p className="text-2xl underline">Players</p>
                {gameState.playerData.playerNames.map((player, idx) => (
                    <p key={player} className="text-xl">
                        {idx + 1}.{" "}
                        <span
                            className={isActive(idx) ? "text-orange-400" : ""}
                        >
                            {player}
                        </span>
                        {gameState.playerData.order === idx ? " (You)" : ""}
                        {gameState.gameState === 4 || gameState.gameState === 5
                            ? ` [${gameState.tricksWon[idx].length}]`
                            : ""}
                    </p>
                ))}
                <div className="grow" />
                <div className="flex flex-col gap-4 items-center justify-center">
                    {getCentreDisplay()}
                </div>
                <div className="grow" />
                <p className="text-2xl">
                    {countCardsOfSuit(gameState.playerData.hand!)}
                </p>
                <div className="flex flex-row w-full gap-2 mb-5 justify-center">
                    {gameState.playerData.hand
                        ?.map((card, idx) => ({
                            card: card,
                            valid: gameState.playerData.cardValid[idx],
                        }))
                        .sort((a, b) =>
                            redBlackSuitOrdering[a.card.suit] -
                                redBlackSuitOrdering[b.card.suit] ===
                            0
                                ? a.card.value - b.card.value
                                : redBlackSuitOrdering[a.card.suit] -
                                  redBlackSuitOrdering[b.card.suit],
                        )
                        .map((card) => (
                            <img
                                key={cardToCardURL(card.card)}
                                src={cardToCardURL(card.card)}
                                className={`w-[6%] ${
                                    gameState.gameState === 4 &&
                                    gameState.currentActivePlayer ===
                                        gameState.playerData.order &&
                                    card.valid
                                        ? "hover:-translate-y-5"
                                        : ""
                                } transition-transform duration-100 ${gameState.gameState === 4 && !card.valid ? 'opacity-50' : ''}`}
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
