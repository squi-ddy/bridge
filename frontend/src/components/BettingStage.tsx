import { SocketContext } from "@/base/BasePage"
import { useCallback, useContext } from "react"
import Button from "./Button"
import { cardSuitToHumanStr, cardSuitToSymbol } from "@/util/cards"

function BettingStage() {
    const { gameState, socket } = useContext(SocketContext)

    const currentBet = gameState!.currentBet

    const rangeOfBets : number[] = []
    for (let i = Math.max(1, currentBet.contract); i<=7;i++){
        rangeOfBets.push(i)
    }

    const createBettingRow = (contract: number) => {
        return [0, 1, 2, 3, 4].map((suit) => {
            return <td key={suit}>
                <Button
                    text={`${contract}${cardSuitToSymbol[suit]}`}
                    textSize="text-xl"
                    disabled={contract == gameState!.currentBet.contract && suit <= gameState!.currentBet.suit}
                    onClick={() =>
                        socket?.emitWithAck(
                            "submitBet",
                            {
                                contract: contract,
                                suit: suit,
                                order: gameState!.playerData.order,
                            }
                        )
                    }
                />    
            </td>
        })
    }

    const createBettingTable = () => {
        return rangeOfBets.map((contract) => {
            return <tr key={contract}>{createBettingRow(contract)}</tr>
        })
    }

    if (gameState?.playerData.order !== gameState?.currentActivePlayer) {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Current bet: ${
                        currentBet.contract
                    } ${cardSuitToHumanStr[currentBet.suit]} by ${gameState
                        ?.playerData.playerNames[currentBet.order]}`}</p>
                )}
                <p className="text-3xl">{`Waiting for ${gameState?.playerData
                    .playerNames[
                    gameState?.currentActivePlayer
                ]} to bet...`}</p>
            </>
        )
    } else {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Current bet: ${
                        currentBet.contract
                    } ${cardSuitToHumanStr[currentBet.suit]} by ${gameState
                        ?.playerData.playerNames[currentBet.order]}`}</p>
                )}
                <p className="text-3xl">Choose a bet</p>
                <div className="flex gap-2">
                    <table>
                        <tbody>{createBettingTable()}</tbody>
                    </table>
                    {gameState?.currentBet.contract !== 0 && (
                        <Button
                            text="Pass"
                            textSize="text-xl"
                            onClick={() => {
                                socket?.emitWithAck("submitBet", null)
                            }}
                        />
                    )}
                </div>
            </>
        )
    }
}

export default BettingStage
