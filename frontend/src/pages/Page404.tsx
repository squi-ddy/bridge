import { Link } from "react-router-dom"
import { TbMoodSad } from "react-icons/tb"
import SetTitle from "@/components/SetTitle"

function Page404() {
    return (
        <>
            <SetTitle title="404" />
            <div className="grow" />
            <div>
                <TbMoodSad size={200} />
            </div>
            <h1 className="text-5xl text-center">
                This page doesn&#39;t exist
            </h1>
            <h1 className="text-3xl text-center">
                Go back to the{" "}
                <Link
                    to="/"
                    className="underline hover:text-orange-400 transition-color duration-300"
                >
                    home page
                </Link>
                ?
            </h1>
            <div className="grow" />
        </>
    )
}

export default Page404
