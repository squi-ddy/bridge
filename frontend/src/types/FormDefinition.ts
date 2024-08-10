import FormCheckboxInput from "@/components/forms/FormCheckboxInput"
import FormNumberInput from "@/components/forms/FormNumberInput"
import FormPasswordInput from "@/components/forms/FormPasswordInput"
import FormTextInput from "@/components/forms/FormTextInput"
import { ReactElement } from "react"

export type InputSubmitFunction<T> = () => T | null
export type InputErrorFunction = (errorMessage: string) => void

export type CheckFunctionOutput =
    | { success: true }
    | { success: false; message: string }
export type InputCheckFunction<T> = (value: T) => CheckFunctionOutput

export type InputFunctionItems<T> = {
    submitFunc: InputSubmitFunction<T>
    errorFunc: InputErrorFunction
    value: T
}

export type InputFunctionContainer<T extends readonly string[]> = Record<
    T[number],
    InputFunctionItems<unknown>
>

export type FormInput = ReactElement<
    | typeof FormTextInput
    | typeof FormPasswordInput
    | typeof FormNumberInput
    | typeof FormCheckboxInput
>
