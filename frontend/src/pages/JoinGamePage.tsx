import { motion } from "framer-motion"
import { FaChalkboardTeacher, FaPeopleCarry } from "react-icons/fa"
import { FaPerson } from "react-icons/fa6"
import SetTitle from "@/components/SetTitle"
import { useNavigate } from "react-router-dom"
import MotionButton from "@/components/MotionButton"
import { useCallback, useContext, useRef } from "react"
import { SocketContext } from "@/base/BasePage"
import { InputErrorFunction, InputFunctionContainer, InputFunctionItems } from "@/types/FormDefinition"
import FormTextInput from "@/components/forms/FormTextInput"
import { socket } from "@/socket"
import { SocketReturnData } from "@backend/types/SocketReturn"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const mainVariants = {
    hidden: { opacity: 0, transform: "translateY(-20px)" },
    visible: {
        opacity: 1,
        transform: "translateY(0)",
        transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
    exit: {
        opacity: 0,
        transition: { when: "afterChildren", staggerChildren: 0.01 },
    },
}

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

function JoinGamePage() {
    const inputContainer = useRef(defaultInputContainer)

    const setSubmitFunction = useCallback(
        (key: keyof typeof defaultInputContainer) => {
            return (
                func: (typeof defaultInputContainer)[typeof key]["submitFunc"],
            ) => {
                inputContainer.current[key]["submitFunc"] = func
            }
        },
        [],
    )

    const setErrorFunction = useCallback(
        (key: keyof typeof defaultInputContainer) => {
            return (func: InputErrorFunction) => {
                inputContainer.current[key]["errorFunc"] = func
            }
        },
        [],
    )

    const navigate = useNavigate()

    const { gameState } = useContext(SocketContext)

    if (gameState) {
        navigate("/room/" + gameState.roomCode)
    }

    return (
        <>
            <SetTitle title="Bridge" />
            
            <motion.div
                variants={mainVariants}
                className="flex flex-col gap-4 justify-center items-center border-2 rounded-xl p-4 w-1/3"
                layout
            >
            <FormTextInput
                fieldName="room-code"
                variants={itemVariants}
                fieldPrefix="Room Code"
                fieldPlaceholder="ABCD"
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
                setSubmitFunction={setSubmitFunction("roomCode")}
                setErrorFunction={setErrorFunction("roomCode")}
            />

            <FormTextInput
                fieldName="name"
                variants={itemVariants}
                fieldPrefix="Name"
                fieldPlaceholder=""
                z="z-[-1]"
                checker={(value: string) => {
                    if (!value)
                        return {
                            success: false,
                            message: "Enter a name!",
                        }
                    if (value.length > 20)
                        return {
                            success: false,
                            message: "Name must be less than 20 characters!",
                        }
                    return { success: true }
                }}
                setSubmitFunction={setSubmitFunction("name")}
                setErrorFunction={setErrorFunction("name")}
            />
             <MotionButton
                text="Join Game!"
                variants={itemVariants}
                onClick={async () => {
                    let anyNulls = false
                    for (const field of fieldNames) {
                        const value = inputContainer.current[field].submitFunc()
                        if (value === null) {
                            anyNulls = true
                            continue
                        }
                        inputContainer.current[field].value = value
                    }
                    if (anyNulls) return
                    const roomCode = inputContainer.current.roomCode.value
                    const name = inputContainer.current.name.value
                    const resp = await socket.emitWithAck("joinGame", roomCode.toUpperCase(), name)
                    if (!resp.status) {
                        alert(`Internal error`)
                    } else {
                        localStorage.setItem("pid", resp.data)
                    }
                }}
                textSize="text-xl"
                z="z-[-2]"
                layout
            />
            </motion.div>
        </>
    )
}

export default JoinGamePage
