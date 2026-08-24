import SetTitle from "@/components/SetTitle.js"
import { useNavigate } from "react-router-dom"
import Button from "@/components/Button.js"
import { use, useEffect, useRef } from "react"
import SocketContext from "@/base/SocketContext.js"
import {
    InputFunctionContainer,
    InputFunctionItems,
} from "@/types/FormDefinition.js"
import FormTextInput from "@/components/forms/FormTextInput.js"

const fieldNames = ["roomCode", "name"] as const

const defaultInputContainer = {
    roomCode: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    name: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
} satisfies InputFunctionContainer<typeof fieldNames>

// transform the defaultInputContainer into a record of functions that set the submitFunc and errorFunc for each field
const setSubmitFunctions = fieldNames.reduce(
    (acc, field) => {
        acc[field] = (func: InputFunctionItems<string>["submitFunc"]) => {
            defaultInputContainer[field].submitFunc = func
        }
        return acc
    },
    {} as Record<
        (typeof fieldNames)[number],
        (func: InputFunctionItems<string>["submitFunc"]) => void
    >,
)

const setErrorFunctions = fieldNames.reduce(
    (acc, field) => {
        acc[field] = (func: InputFunctionItems<string>["errorFunc"]) => {
            defaultInputContainer[field].errorFunc = func
        }
        return acc
    },
    {} as Record<
        (typeof fieldNames)[number],
        (func: InputFunctionItems<string>["errorFunc"]) => void
    >,
)

function JoinGamePage() {
    const inputContainerRef = useRef(defaultInputContainer)

    const navigate = useNavigate()

    const { gameState, socket, setSocketConnected } = use(SocketContext)

    useEffect(() => {
        if (gameState) {
            navigate("/room/" + gameState.roomCode)
        }
    }, [gameState, navigate])

    return (
        <>
            <SetTitle title="Bridge" />

            <div className="flex flex-col gap-4 justify-center items-center grow w-full">
                <div className="flex flex-col gap-4 justify-center items-center  border-2 rounded-xl p-4 w-5/6 lg:w-1/3">
                    <FormTextInput
                        fieldName="room-code"
                        fieldPrefix="Room Code"
                        fieldPlaceholder="ABCD"
                        z="z-2"
                        checker={(value: string) => {
                            if (!value)
                                return {
                                    success: false,
                                    message: "Enter a room code!",
                                }
                            if (!/^[a-zA-Z]{4}$/i.test(value)) {
                                return {
                                    success: false,
                                    message:
                                        "Room code must be 4 letters long!",
                                }
                            }
                            return { success: true }
                        }}
                        setSubmitFunction={setSubmitFunctions.roomCode}
                        setErrorFunction={setErrorFunctions.roomCode}
                    />

                    <FormTextInput
                        fieldName="name"
                        fieldPrefix="Name"
                        fieldPlaceholder=""
                        z="z-1"
                        checker={(value: string) => {
                            if (!value)
                                return {
                                    success: false,
                                    message: "Enter a name!",
                                }
                            if (value.length > 20)
                                return {
                                    success: false,
                                    message:
                                        "Name must be less than 20 characters!",
                                }
                            return { success: true }
                        }}
                        setSubmitFunction={setSubmitFunctions.name}
                        setErrorFunction={setErrorFunctions.name}
                    />
                    <Button
                        text="Join Game!"
                        onClick={async () => {
                            let anyNulls = false
                            for (const field of fieldNames) {
                                const value =
                                    inputContainerRef.current[
                                        field
                                    ].submitFunc()
                                if (value === null) {
                                    anyNulls = true
                                    continue
                                }
                                inputContainerRef.current[field].value = value
                            }
                            if (anyNulls) return
                            const roomCode =
                                inputContainerRef.current.roomCode.value
                            const name = inputContainerRef.current.name.value
                            const resp = await socket?.emitWithAck(
                                "joinGame",
                                roomCode.toUpperCase(),
                                name,
                            )
                            if (!resp) {
                                alert(`Socket disconnected`)
                                return
                            }
                            if (!resp.status) {
                                if (!resp.code) {
                                    alert(`Internal error`)
                                } else if (resp.code === 1) {
                                    inputContainerRef.current.roomCode.errorFunc(
                                        "Game has already started!",
                                    )
                                } else if (resp.code === 2) {
                                    inputContainerRef.current.roomCode.errorFunc(
                                        "Room is full!",
                                    )
                                }
                            } else {
                                localStorage.setItem("pid", resp.data)
                                setSocketConnected(true)
                            }
                        }}
                        textSize="text-xl"
                    />
                </div>
            </div>
        </>
    )
}

export default JoinGamePage
