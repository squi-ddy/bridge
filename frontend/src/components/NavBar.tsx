import { logout } from "@/api"
import { UserContext } from "@/base/BasePage"
import { AnimatePresence, motion } from "framer-motion"
import { ReactElement, cloneElement, useContext, useMemo } from "react"
import MotionButton from "./MotionButton"
import MotionNavButton from "./MotionNavButton"

const itemVariants = {
    visible: {
        opacity: 1,
        transform: "translateY(0px)",
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

function NavBar() {
    const { user, updateUser } = useContext(UserContext)

    const children = useMemo(() => {
        let topBarItems: ReactElement[] = []

        if (user) {
            topBarItems = [
                <motion.p className="text-2xl" key="username">
                    Hi <b>{user.username}</b>!
                </motion.p>,

                <MotionNavButton to="me" text="Profile" key="profile" />,
            ]
        }

        topBarItems = topBarItems.concat([
            user && user["is-learner"] ? (
                <MotionNavButton
                    to="/options/learner"
                    text="Find Tutor"
                    key="find"
                />
            ) : (
                <></>
            ),

            user ? (
                <MotionNavButton
                    to="/requests"
                    text="Requests"
                    key="requests"
                />
            ) : (
                <></>
            ),

            user ? (
                <MotionButton
                    text="Logout"
                    key="logout"
                    textSize="text-xl"
                    onClick={async () => {
                        const res = await logout()
                        if (res.success) {
                            await updateUser()
                        }
                    }}
                />
            ) : (
                <MotionNavButton to="auth" text="Login" key="login" />
            ),

            <MotionNavButton to="about" text="About" key="about" />,
        ])

        return topBarItems.map((item) => {
            return cloneElement(item, {
                variants: itemVariants,
                initial: "hidden",
                animate: "visible",
                exit: "exit",
                layout: true,
            })
        })
    }, [user, updateUser])

    return <AnimatePresence mode="popLayout">{children}</AnimatePresence>
}

export default NavBar
