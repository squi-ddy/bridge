import { useEffect } from "react"

function SetTitle(props: { title: string }) {
    useEffect(() => {
        document.title = props.title
    }, [props.title])
    return null
}

export default SetTitle
