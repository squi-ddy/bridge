import SetTitle from "@/components/SetTitle"
import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useContext, useEffect } from "react"
import { GlobalContext, SocketContext } from "@/base/BasePage"
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
import { CensoredGameState } from "@backend/types/CensoredGameState"

function GamePage() {
    const navigate = useNavigate()

    const { gameState, socket } = useContext(SocketContext)
    const { globalContext } = useContext(GlobalContext)

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

    // honestly this is real clunky method to generate the betting history table
    const showBettingHistory = (gameState: CensoredGameState, idx: number) => {
        if(gameState!.betHistory.length == 0 || gameState.gameState < 2) return <></>

        const history = [...gameState.betHistory]
        const lastPlayer = gameState.gameState === 2 ? gameState.currentActivePlayer : gameState.currentBet.order

        // count number of betting rounds
        let rounds = 1
        if (history.length > 1) {
            history.forEach((current, index)=>{
                const next = history[index + 1]
                if (next && (next.order < current.order)) rounds++
            })
            // this is for when there are no bids in the latest round yet
            if (lastPlayer < history[history.length-1].order) rounds++
            // this is because when we are no longer in bidding phase, lastPlayer == last bid's order
            else if (gameState.gameState != 2 && (lastPlayer + 3) % 4 < history[history.length-1].order) rounds ++
        }
        
        const newHistory = []
        let round = 1
        let playerId = 0
        while(round != rounds || playerId != lastPlayer) {
            if(history.length != 0 && history[0].order == playerId)
                newHistory.push(history.shift())
            else newHistory.push(null)
            if(playerId == 3) round++;
            playerId = (playerId + 1) % 4
        }
        
        const everyFourth = [];
        for (let i = idx; i < newHistory.length; i += 4) {
            everyFourth.push(newHistory[i]);
        }
        
        // console.log(JSON.stringify(gameState.betHistory)+'\n'+JSON.stringify(newHistory)+'\n'+JSON.stringify(everyFourth))
        return everyFourth.map((bet, index)=>{
            if(!bet) return <td key={index}>-</td>
            else return <td key={index}>{`${bet.contract}${cardSuitToSymbol[bet.suit]}`}</td>
        })
    }

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
                <table><tbody>
                {gameState.playerData.playerNames.map((player, idx: number) => (
                    <tr key={player} className="text-xl">
                        <td>{gameState.playerData.order === idx ? '⮕' : ''}</td>
                        <td className={isActive(idx) && gameState.gameState !== 1 ? "text-orange-400" : "" + " pr-4"}>
                            {player}
                        </td>
                        <td className="px-4">
                            {gameState.gameState === 4 || gameState.gameState === 5
                            ? `${gameState.tricksWon[idx].length}`
                            : ""}
                        </td>
                        {showBettingHistory(gameState, idx)}
                    </tr>
                ))}
                </tbody></table>
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
                        .sort((a, b) => cardSort(a, b, globalContext.balatro))
                        .map((card) => (
                            <img
                                key={cardToCardURL(card.card, globalContext.balatro)}
                                src={cardToCardURL(card.card, globalContext.balatro)}
                                className={`w-[6%] rounded-sm ${
                                    gameState.gameState === 4 &&
                                    gameState.currentActivePlayer ===
                                        gameState.playerData.order &&
                                    card.valid
                                        ? "hover:-translate-y-5"
                                        : ""
                                } transition-transform duration-100 ${gameState.gameState === 4 && !card.valid ? 'opacity-50' : ''}`}
                                style={{imageRendering: "pixelated"}}
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
