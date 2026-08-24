import { useCallback, useEffect, useRef, useState } from "react"
import {
    InputSubmitFunction,
    InputErrorFunction,
    InputCheckFunction,
} from "@/types/FormDefinition.js"
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
    const {
        fieldName,
        checker,
        fieldPlaceholder,
        fieldPrefix,
        fieldValue,
        edit,
        width,
        z,
        h,
        type,
        textSize,
        errorTextSize,
        setSubmitFunction,
        setErrorFunction,
    } = props

    const { refs, floatingStyles } = useFloating({
        placement: "bottom",
    })
    const { setReference, setFloating } = refs
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const finalWidth = width ?? "w-5/6"
    const finalH = h ?? "h-14"
    const finalZ = z ?? "z-0"
    const finalFieldValue = fieldValue ?? ""
    const finalType = type ?? "text"
    const finalTextSize = textSize ?? "text-2xl"
    const finalErrorTextSize = errorTextSize ?? "text-l"
    const finalChecker = checker ?? defaultChecker
    const finalSetSubmitFunction = setSubmitFunction ?? emptyFunction
    const finalSetErrorFunction = setErrorFunction ?? emptyFunction
    const finalEdit = edit ?? true

    const submitFunction: InputSubmitFunction<string> = useCallback(() => {
        if (!finalEdit) {
            return finalFieldValue
        }
        const value = inputRef.current!.value
        const check = finalChecker(value)
        if (check.success) {
            setError(false)
            return value
        } else {
            setError(true)
            setErrorMessage(check.message)
            return null
        }
    }, [finalEdit, finalFieldValue, finalChecker])

    const errorFunction: InputErrorFunction = useCallback(
        (errorMessage: string) => {
            setError(true)
            setErrorMessage(errorMessage)
        },
        [],
    )

    useEffect(() => {
        finalSetErrorFunction(errorFunction)
        finalSetSubmitFunction(submitFunction)
    }, [
        errorFunction,
        submitFunction,
        finalSetErrorFunction,
        finalSetSubmitFunction,
    ])

    return (
        <div
            key={fieldName + (finalEdit ? "-edit" : "")}
            ref={setReference}
            className={`min-w-0 ${finalH} ${finalWidth} ${finalZ} flex items-center gap-4`}
        >
            {finalEdit ? (
                <>
                    {fieldPrefix && (
                        <p className={`${finalTextSize} text-center min-w-fit`}>
                            {fieldPrefix}
                        </p>
                    )}
                    <input
                        ref={inputRef}
                        type={finalType}
                        placeholder={fieldPlaceholder}
                        defaultValue={finalFieldValue}
                        onInput={() => {
                            setError(false)
                        }}
                        className={`border-2 rounded-xl bg-transparent ${finalTextSize} w-full h-full p-2 text-center min-w-0 focus:border-sky-400 focus:outline-none transition-colors ${
                            error ? "border-red-500" : ""
                        }`}
                    />
                    {error && (
                        <p
                            style={floatingStyles}
                            ref={setFloating}
                            className={`mt-2 ${finalErrorTextSize} text-center border-white border bg-red-400 py-1 px-2 rounded-md pointer-events-none`}
                        >
                            {errorMessage}
                        </p>
                    )}
                </>
            ) : (
                <p className={`${finalTextSize} w-full text-center min-w-fit`}>
                    {(fieldPrefix ?? "") + finalFieldValue}
                </p>
            )}
        </div>
    )
}

export default FormTextInput
