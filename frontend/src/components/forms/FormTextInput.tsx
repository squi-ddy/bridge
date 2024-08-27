import { useCallback, useRef, useState } from "react"
import {
    InputSubmitFunction,
    InputErrorFunction,
    InputCheckFunction,
} from "@/types/FormDefinition"
import { useFloating } from "@floating-ui/react"

const defaultChecker: InputCheckFunction<string> = () => {
    return { success: true }
}

const emptyFunction = () => {}

function FormTextInput(props: {
    fieldName: string
    checker?: InputCheckFunction<string>
    fieldPlaceholder: string
    fieldPrefix?: string
    fieldValue?: string
    edit?: boolean
    width?: string
    z?: string
    h?: string
    type?: string
    textSize?: string
    errorTextSize?: string
    setSubmitFunction?: (getValue: InputSubmitFunction<string>) => void
    setErrorFunction?: (setError: InputErrorFunction) => void
}) {
    const { refs, floatingStyles } = useFloating({
        placement: "bottom",
    })
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const width = props.width ?? "w-5/6"
    const h = props.h ?? "h-14"
    const z = props.z ?? "z-0"
    const fieldValue = props.fieldValue ?? ""
    const type = props.type ?? "text"
    const textSize = props.textSize ?? "text-2xl"
    const errorTextSize = props.errorTextSize ?? "text-l"
    const checker = props.checker ?? defaultChecker
    const setSubmitFunction = props.setSubmitFunction ?? emptyFunction
    const setErrorFunction = props.setErrorFunction ?? emptyFunction
    const edit = props.edit ?? true

    const submitFunction: InputSubmitFunction<string> = useCallback(() => {
        if (!edit) {
            return fieldValue
        }
        const value = inputRef.current!.value
        const check = checker(value)
        if (check.success) {
            setError(false)
            return value
        } else {
            setError(true)
            setErrorMessage(check.message)
            return null
        }
    }, [edit, fieldValue, checker])

    const errorFunction: InputErrorFunction = useCallback(
        (errorMessage: string) => {
            setError(true)
            setErrorMessage(errorMessage)
        },
        [],
    )

    setErrorFunction(errorFunction)
    setSubmitFunction(submitFunction)

    return (
        <div
            key={props.fieldName + (edit ? "-edit" : "")}
            ref={refs.setReference}
            className={`min-w-0 ${h} ${width} ${z} flex items-center gap-4`}
        >
            {edit ? (
                <>
                    {props.fieldPrefix && (
                        <p className={`${textSize} text-center min-w-fit`}>
                            {props.fieldPrefix}
                        </p>
                    )}
                    <input
                        ref={inputRef}
                        type={type}
                        placeholder={props.fieldPlaceholder}
                        defaultValue={fieldValue}
                        onInput={() => {
                            setError(false)
                        }}
                        className={`border-2 rounded-xl bg-transparent ${textSize} w-full h-full p-2 text-center min-w-0 focus:border-sky-400 focus:outline-none transition-colors ${
                            error ? "border-red-500" : ""
                        }`}
                    />
                    {error && (
                        <p
                            style={floatingStyles}
                            ref={refs.setFloating}
                            className={`mt-2 ${errorTextSize} text-center border-white border bg-red-400 py-1 px-2 rounded-md pointer-events-none`}
                        >
                            {errorMessage}
                        </p>
                    )}
                </>
            ) : (
                <p className={`${textSize} w-full text-center min-w-fit`}>
                    {(props.fieldPrefix ?? "") + fieldValue}
                </p>
            )}
        </div>
    )
}

export default FormTextInput
