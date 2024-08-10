import { motion } from "framer-motion"
import MotionLink from "@/components/MotionLink"
import { getCurrentSession } from "@/api"
import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import { IUserMinimal } from "@backend/types/user"
import NavBar from "@/components/NavBar"

type UserOrNull = IUserMinimal | null
export const UserContext = createContext<{
    user: UserOrNull
    updateUser: () => Promise<void>
    firstRender: boolean
}>({ user: null, updateUser: async () => {}, firstRender: true })

const topBarVariants = {
    visible: {
        transform: "translateY(-20px)",
    },
    hidden: {
        transform: "translateY(-100%)",
    },
    exit: {
        transform: "translateY(-100%)",
    },
}

const itemVariants = {
    visible: {
        opacity: 1,
        transform: "translateY(0px)",
        transition: { duration: 0.3 },
    },
    hidden: {
        opacity: 0,
        transform: "translateY(-20px)",
    },
    exit: {
        opacity: 0,
        transform: "translateY(-20px)",
    },
}

function BasePage(props: { children?: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<
        IUserMinimal | null | undefined
    >(undefined)
    const [firstRender, setFirstRender] = useState(true)

    useEffect(() => {
        if (currentUser === undefined) {
            // doesn't count
            return
        }
        if (firstRender) {
            setFirstRender(false)
        }
    }, [currentUser, firstRender])

    const updateUser = useCallback(async () => {
        const user = await getCurrentSession()
        setCurrentUser(user)
    }, [])

    useEffect(() => {
        updateUser()
    }, [updateUser])

    const contextValue = useMemo(() => {
        return {
            user: currentUser === undefined ? null : currentUser,
            updateUser,
            firstRender,
        }
    }, [currentUser, updateUser, firstRender])

    if (currentUser === undefined) {
        return <></>
    }

    return (
        <div id="root">
            <UserContext.Provider value={contextValue}>
                <motion.div
                    variants={topBarVariants}
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"exit"}
                    id="header"
                    className="pt-[20px] bg-gradient-to-r from-sky-900 to-sky-800 w-full mb-[-20px]"
                >
                    <div className="px-5 flex items-center justify-items-center p-2 gap-2">
                        <MotionLink
                            to="/"
                            variants={itemVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            exit={"exit"}
                            className="text-5xl justify-self-start my-1 font-bold text-orange-400 drop-shadow-md"
                        >
                            Peerly
                        </MotionLink>

                        <div className="grow" />
                        <NavBar />
                    </div>
                </motion.div>

                {props.children}
            </UserContext.Provider>
        </div>
    )
}

export default BasePage
