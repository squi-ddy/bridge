import { HTMLAttributes, forwardRef } from "react"

const Button = forwardRef(function Button(
    props: {
        text: string
        textSize?: string
        emphasis?: boolean
        z?: string
        disabled?: boolean
    } & HTMLAttributes<HTMLButtonElement>,
    ref: React.ForwardedRef<HTMLButtonElement>,
) {
    const textSize = props.textSize || "text-l"
    const emphasis = props.emphasis || false
    const disabled = props.disabled || false
    const className = `${textSize} ${
        emphasis
            ? "text-sky-600 bg-sky-50 font-semibold"
            : disabled ? "text-gray-500 border-gray-500" : "hover:bg-sky-50 hover:text-sky-600 transition-colors duration-300"
    } py-1 px-3 rounded-md border border-sky-100 ${props.z || ""}`
    const tmpProps: {
        text: undefined
        textSize: undefined
        emphasis: undefined
        disabled: boolean
    } & HTMLAttributes<HTMLButtonElement> = {
        ...props,
        text: undefined,
        textSize: undefined,
        emphasis: undefined,
        className: undefined,
        disabled,
    }
    delete tmpProps.text
    delete tmpProps.textSize
    delete tmpProps.emphasis
    delete tmpProps.className
    const newProps: HTMLAttributes<HTMLButtonElement> = { ...tmpProps }
    return (
        <button ref={ref} {...newProps} className={className}>
            {props.text}
        </button>
    )
})

export default Button
