import { login } from "@/api"
import { UserContext } from "@/base/BasePage"
import {
    InputErrorFunction,
    InputFunctionContainer,
    InputFunctionItems,
} from "@/types/FormDefinition"
import { useCallback, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import MotionButton from "./MotionButton"
import SetTitle from "./SetTitle"
import FormPasswordInput from "./forms/FormPasswordInput"
import FormTextInput from "./forms/FormTextInput"
import { IValidation } from "typia"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.01 } },
}

const fieldNames = ["studentId", "password"] as const

const defaultInputContainer = {
    studentId: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    password: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
} satisfies InputFunctionContainer<typeof fieldNames>

function LoginForm() {
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

    const { updateUser } = useContext(UserContext)

    return (
        <>
            <SetTitle title="Login" />

            <FormTextInput
                fieldName="student-id"
                variants={itemVariants}
                fieldPlaceholder="Student ID"
                fieldValue={inputContainer.current.studentId.value || undefined}
                checker={(value: string) => {
                    if (!value)
                        return {
                            success: false,
                            message: "Student ID is required",
                        }
                    if (!/^h[0-9]{7}$/i.test(value)) {
                        return {
                            success: false,
                            message:
                                "Invalid Student ID, should match hXXXXXXX",
                        }
                    }
                    return { success: true }
                }}
                setSubmitFunction={setSubmitFunction("studentId")}
                setErrorFunction={setErrorFunction("studentId")}
            />

            <FormPasswordInput
                fieldName="password"
                variants={itemVariants}
                fieldPlaceholder="Password"
                z="z-[-1]"
                checker={(value: string) => {
                    if (!value)
                        return {
                            success: false,
                            message: "Password is required",
                        }
                    return { success: true }
                }}
                setSubmitFunction={setSubmitFunction("password")}
                setErrorFunction={setErrorFunction("password")}
            />

            <MotionButton
                text="Submit"
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
                    const studentId = inputContainer.current.studentId.value
                    const password = inputContainer.current.password.value
                    const res = await login(studentId.toLowerCase(), password)
                    if (!res.success) {
                        const message = res.response!.data!.message
                        if (message === "Validation error") {
                            const errors: string[] = (
                                res.response!.data!
                                    .errors as IValidation.IError[]
                            ).map((e) => e.path)
                            for (const field of fieldNames) {
                                for (const errorField of errors) {
                                    if (errorField.includes(field)) {
                                        inputContainer.current[field].errorFunc(
                                            "Unknown error",
                                        )
                                    }
                                }
                            }
                        } else if (message === "Invalid student id") {
                            inputContainer.current.studentId.errorFunc(
                                "No account with this student ID",
                            )
                        } else if (message === "Invalid password") {
                            inputContainer.current.password.errorFunc(
                                "Wrong password",
                            )
                        } else {
                            alert(`Unknown error ${message}`)
                        }
                    } else {
                        await updateUser()
                        navigate("/")
                    }
                }}
                textSize="text-xl"
                z="z-[-2]"
                layout
            />
        </>
    )
}

export default LoginForm
