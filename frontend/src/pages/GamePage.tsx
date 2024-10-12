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
import { GameState } from "@backend/types/GameState"

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

const showBettingHistory = (
    history: BetHistoryData[],
    idx: number,
    startColumn: number,
) => {
    return history
        .filter((_, i) => i % 4 === idx)
        .map((bet, index) => {
            if (bet.pass)
                return (
                    <Centred
                        key={index}
                        style={{
                            gridColumnStart: startColumn + index,
                            gridColumnEnd: startColumn + index,
                        }}
                    >
                        P
                    </Centred>
                )
            if (bet.fill)
                return (
                    <Centred
                        key={index}
                        style={{
                            gridColumnStart: startColumn + index,
                            gridColumnEnd: startColumn + index,
                        }}
                    >
                        {bet.fillString}
                    </Centred>
                )
            else
                return (
                    <Centred
                        key={index}
                        style={{
                            gridColumnStart: startColumn + index,
                            gridColumnEnd: startColumn + index,
                        }}
                        className={`${
                            bet.winning ? "border rounded-md px-2 py-1" : ""
                        }`}
                    >{`${bet.bet.contract} ${
                        cardSuitToSymbol[bet.bet.suit]
                    }`}</Centred>
                )
        })
}

type CardWithValid = {
    card: Card
    valid: boolean
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
            if (gameState?.gameState === GameState.WASH) {
                return false
            } else if (
                gameState?.gameState === GameState.BID ||
                gameState?.gameState === GameState.PARTNER ||
                gameState?.gameState === GameState.PLAYING
            ) {
                return idx === gameState?.currentActivePlayer
            } else if (
                gameState?.gameState === GameState.ROUND_END ||
                gameState?.gameState === GameState.GAME_END
            ) {
                return !gameState?.okMoveOn[idx]
            }
        },
        [gameState],
    )

    const getCardImageClassName = useCallback(
        (card: CardWithValid) => {
            if (gameState?.gameState !== GameState.PLAYING) return ""
            if (!isActive(gameState.playerData.order)) return ""
            return card.valid ? "hover:-translate-y-5" : "opacity-50"
        },
        [isActive, gameState],
    )

    const getCentreDisplay = useCallback(() => {
        if (gameState?.gameState === GameState.WASH) {
            return <WashStage />
        } else if (gameState?.gameState === GameState.BID) {
            return <BettingStage />
        } else if (gameState?.gameState === GameState.PARTNER) {
            return <ChoosePartnerStage />
        } else if (gameState?.gameState === GameState.PLAYING) {
            return <PlayingStage />
        } else if (gameState?.gameState === GameState.ROUND_END) {
            return <RoundEndStage />
        } else if (gameState?.gameState === GameState.GAME_END) {
            return <GameEndStage />
        }
    }, [gameState])

    const playCard = useCallback(
        (card: Card) => {
            if (
                gameState?.currentActivePlayer ===
                    gameState?.playerData.order &&
                gameState?.gameState === GameState.PLAYING
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
    if (
        gameState.gameState !== GameState.WASH &&
        gameState.gameState !== GameState.BID
    ) {
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
                gameState.gameState !== GameState.WASH &&
                gameState.gameState !== GameState.BID
                    ? { fill: true, pass: false, fillString: "-" }
                    : { fill: true, fillString: "", pass: false },
        ),
    ]

    const hasPointsColumn =
        gameState.gameState === GameState.PLAYING ||
        gameState.gameState === GameState.ROUND_END ||
        gameState.gameState === GameState.GAME_END
    const hasBetColumns = numBetCols > 0

    const numCols =
        numBetCols + 2 + (hasBetColumns ? 1 : 0) + (hasPointsColumn ? 2 : 0)

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
                    className="grid gap-x-2 gap-y-1 text-xl"
                    style={{
                        gridTemplateColumns: `repeat(${numCols}, auto)`,
                        gridTemplateRows:
                            numCols > 2 ? `repeat(6, auto)` : `repeat(4, auto)`,
                    }}
                >
                    <div />
                    <div />
                    {hasPointsColumn && (
                        <>
                            <div className="border-l-2 row-start-1 row-end-1 -mb-1 col-start-3 col-end-3" />
                            <Centred>Pts</Centred>
                        </>
                    )}
                    {hasBetColumns && (
                        <div
                            className={`border-l-2 row-start-1 row-end-1 -mb-1 ${
                                hasPointsColumn
                                    ? "col-start-5 col-end-5"
                                    : "col-start-3 col-end-3"
                            }`}
                        />
                    )}
                    {Array.from({ length: numBetCols }, (_, idx) => (
                        <Centred key={idx}>Bet {idx + 1}</Centred>
                    ))}
                    {numCols > 2 && (
                        <div className="border-t-2 col-span-full" />
                    )}
                    {hasPointsColumn && (
                        <div className="border-l-2 row-start-3 row-end-7 -mt-1 col-start-3 col-end-3" />
                    )}
                    {hasBetColumns && (
                        <div
                            className={`border-l-2 row-start-3 row-end-7 -mt-1 ${
                                hasPointsColumn
                                    ? "col-start-5 col-end-5"
                                    : "col-start-3 col-end-3"
                            }`}
                        />
                    )}
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
                                        isActive(idx) ? "text-orange-400" : ""
                                    }`}
                                >
                                    {player}
                                </Centred>
                                {hasPointsColumn && (
                                    <Centred className="col-start-4 col-end-4">
                                        {gameState.tricksWon[idx].length}
                                    </Centred>
                                )}
                                {showBettingHistory(
                                    history,
                                    idx,
                                    numCols - numBetCols + 1,
                                )}
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
                <div className="flex flex-row w-full gap-2 mb-4 justify-center">
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
                                className={`w-[6%] transition-transform duration-100 ${getCardImageClassName(
                                    card,
                                )}`}
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
