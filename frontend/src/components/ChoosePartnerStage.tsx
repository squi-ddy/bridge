import SocketContext from "@/base/SocketContext.js"
import { use, useRef } from "react"
import Button from "./Button.js"
import {
    cardSuitToHumanStr,
    cardSuitToSymbol,
    cardValueToHumanStr,
} from "@/util/cards.js"
import FormSelectionInput from "./forms/FormSelectionInput.js"
import {
    InputFunctionContainer,
    InputFunctionItems,
} from "@/types/FormDefinition.js"

const fieldNames = ["suit", "value"] as const

const defaultInputContainer = {
    suit: {
        submitFunc: () => 0,
        errorFunc: () => 0,
        value: 0,
    } as InputFunctionItems<number>,
    value: {
        submitFunc: () => 0,
        errorFunc: () => 0,
        value: 0,
    } as InputFunctionItems<number>,
} satisfies InputFunctionContainer<typeof fieldNames>

// transform the defaultInputContainer into a record of functions that set the submitFunc and errorFunc for each field
const setSubmitFunctions = fieldNames.reduce(
    (acc, field) => {
        acc[field] = (func: InputFunctionItems<number>["submitFunc"]) => {
            defaultInputContainer[field].submitFunc = func
        }
        return acc
    },
    {} as Record<
        (typeof fieldNames)[number],
        (func: InputFunctionItems<number>["submitFunc"]) => void
    >,
)

const setErrorFunctions = fieldNames.reduce(
    (acc, field) => {
        acc[field] = (func: InputFunctionItems<number>["errorFunc"]) => {
            defaultInputContainer[field].errorFunc = func
        }
        return acc
    },
    {} as Record<
        (typeof fieldNames)[number],
        (func: InputFunctionItems<number>["errorFunc"]) => void
    >,
)

function ChoosePartnerStage() {
    const inputContainerRef = useRef(defaultInputContainer)

    const cardSuitOptions = cardSuitToHumanStr.slice(0, 4)
    const cardValueOptions = cardValueToHumanStr.toReversed()

    const { gameState, socket } = use(SocketContext)

    const currentBet = gameState!.currentBet

    if (gameState?.playerData.order !== gameState?.currentActivePlayer) {
        return (
            <>
                <p className="text-2xl">{`Winning bet: ${currentBet.contract} ${
                    cardSuitToSymbol[currentBet.suit]
                } by ${
                    gameState?.playerData.playerNames[currentBet.order]
                }`}</p>
                <p className="text-3xl">{`Waiting for ${
                    gameState?.playerData.playerNames[
                        gameState?.currentActivePlayer
                    ]
                } to choose their partner...`}</p>
            </>
        )
    } else {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Winning bet: ${
                        currentBet.contract
                    } ${cardSuitToSymbol[currentBet.suit]} by ${
                        gameState?.playerData.playerNames[currentBet.order]
                    }`}</p>
                )}
                <p className="text-3xl">Choose a partner card:</p>
                <div className="flex gap-4 items-center text-3xl">
                    <FormSelectionInput
                        fieldName="value"
                        setSubmitFunction={setSubmitFunctions.value}
                        setErrorFunction={setErrorFunctions.value}
                        options={cardValueOptions}
                        width="w-52"
                        errorTextSize="text-xl"
                        z="z-10"
                    />
                    of{" "}
                    <FormSelectionInput
                        fieldName="suit"
                        setSubmitFunction={setSubmitFunctions.suit}
                        setErrorFunction={setErrorFunctions.suit}
                        options={cardSuitOptions}
                        width="w-52"
                        errorTextSize="text-xl"
                        z="z-10"
                    />
                </div>
                <Button
                    text="Submit"
                    textSize="text-2xl"
                    onClick={async () => {
                        let anyNulls = false
                        for (const field of fieldNames) {
                            const value =
                                inputContainerRef.current[field].submitFunc()
                            if (value === null) {
                                anyNulls = true
                                continue
                            }
                            inputContainerRef.current[field].value = value
                        }
                        if (anyNulls) return
                        const suit = inputContainerRef.current.suit.value
                        if (suit === -1) {
                            inputContainerRef.current.suit.errorFunc(
                                "Please select a suit",
                            )
                        }
                        const value = inputContainerRef.current.value.value
                        if (value === -1) {
                            inputContainerRef.current.value.errorFunc(
                                "Please select a card value",
                            )
                        }
                        if (suit === -1 || value === -1) return
                        const cardValue = 14 - value
                        const card = { suit, value: cardValue }
                        socket?.emitWithAck("submitPartner", card)
                    }}
                />
            </>
        )
    }
}

export default ChoosePartnerStage
