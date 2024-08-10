import { deleteNotification, getEmptyTimeslots, getNotifications } from "@/api"
import { UserContext } from "@/base/BasePage"
import Calendar, {
    IAdditionalSlot,
    IContiguousSlot,
    timestamps,
} from "@/components/Calendar"
import MotionButton from "@/components/MotionButton"
import SetTitle from "@/components/SetTitle"
import { INotification } from "@backend/types/notification"
import { Time } from "@backend/types/timeslot"
import { AnimatePresence, motion } from "framer-motion"
import { useContext, useEffect, useState } from "react"
import { BiCheck } from "react-icons/bi"
import { useNavigate } from "react-router-dom"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const emptyArray: IAdditionalSlot[] = []

function HomePage() {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()

    const [defaultSelected, setDefaultSelected] = useState<IContiguousSlot[]>(
        [],
    )
    const [calendarApiReturned, setCalendarApiReturned] = useState(false)
    const [notifications, setNotifications] = useState<INotification[]>([])

    useEffect(() => {
        if (!user || !user["is-tutor"]) {
            navigate("/")
            return
        }
        getEmptyTimeslots({ "tutor-sid": user["student-id"] }).then(
            (timeslots) => {
                if (!timeslots) throw new Error("Failed to get timeslots")
                setDefaultSelected(
                    timeslots.map((ts) => ({
                        dayOfWeek: ts["day-of-week"],
                        beginIndex: timestamps.indexOf(
                            Time.fromITime(ts["start-time"]).toHMString(),
                        ),
                        endIndex:
                            timestamps.indexOf(
                                Time.fromITime(ts["end-time"]).toHMString(),
                            ) - 1,
                    })),
                )
                setCalendarApiReturned(true)
            },
        )
        getNotifications().then((n) => {
            if (n) setNotifications(n)
        })
    }, [user, navigate])

    if (!user) return <></>

    return (
        <>
            <SetTitle title="Home" />
            <motion.h1 variants={itemVariants} className="text-5xl">
                Welcome <span className="font-semibold">{user.username}</span>!
            </motion.h1>
            <div className="flex flex-row gap-2">
                {user["is-tutor"] && (
                    <motion.p
                        variants={itemVariants}
                        layout
                        key={"tutor"}
                        className={`border-sky-500 border rounded-lg text-base px-2 transition-colors`}
                    >
                        Tutor
                    </motion.p>
                )}
                {user["is-learner"] && (
                    <motion.p
                        variants={itemVariants}
                        layout
                        key={"learner"}
                        className={`border-sky-500 border rounded-lg text-base px-2 transition-colors`}
                    >
                        Learner
                    </motion.p>
                )}
            </div>
            <motion.div
                variants={itemVariants}
                className={`flex flex-row items-center w-2/3 gap-4 justify-center`}
            >
                {user["is-tutor"] && calendarApiReturned && (
                    <div className="flex flex-col items-center w-1/2 gap-2">
                        <motion.div
                            variants={itemVariants}
                            className="text-3xl"
                        >
                            Your Free Slots
                        </motion.div>
                        <Calendar
                            defaultSelected={defaultSelected}
                            setGetContiguousSlots={() => {}}
                            edit={false}
                            additionalSlots={emptyArray}
                            drawContiguousSlots={true}
                        />
                    </div>
                )}
                {user["is-learner"] && (
                    <div className="flex flex-col items-center w-1/2 h-full gap-2">
                        <motion.div
                            variants={itemVariants}
                            className="text-3xl"
                        >
                            Notifications
                        </motion.div>
                        <div className="border-2 rounded-xl border-white w-full h-full overflow-y-scroll">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notification) => (
                                    <motion.div
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        key={notification["notification-id"]}
                                        className={`flex flex-col w-full gap-4 items-center p-4 border-b-2 border-white`}
                                        layout
                                    >
                                        <div className="flex flex-row gap-2 w-full items-center">
                                            <p className="text-lg flex items-end">
                                                {notification.message}
                                            </p>
                                            <div className="grow" />
                                            <div
                                                className="p-1 border-2 rounded-xl aspect-square w-auto h-full shrink-0 hover:cursor-pointer hover:bg-sky-900/50 transition-colors"
                                                onClick={async () => {
                                                    // eagerly delete
                                                    setNotifications((prev) =>
                                                        prev.filter(
                                                            (n) =>
                                                                n[
                                                                    "notification-id"
                                                                ] !==
                                                                notification[
                                                                    "notification-id"
                                                                ],
                                                        ),
                                                    )
                                                    // call api
                                                    await deleteNotification({
                                                        "notification-id":
                                                            notification[
                                                                "notification-id"
                                                            ],
                                                    })
                                                }}
                                            >
                                                <div className="h-full w-full">
                                                    <BiCheck size={25} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-full gap-2">
                                            {notification.subjects?.map(
                                                (subject) => (
                                                    <motion.p
                                                        layout
                                                        key={
                                                            subject[
                                                                "subject-code"
                                                            ]
                                                        }
                                                        className={`border-white border rounded-lg text-base px-2 transition-colors`}
                                                    >
                                                        {subject.name}
                                                    </motion.p>
                                                ),
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </motion.div>
            <div className="flex flex-row gap-2">
                {user["is-learner"] && (
                    <MotionButton
                        variants={itemVariants}
                        text="Find tutors?"
                        onClick={() => navigate("/options/learner")}
                    />
                )}
                {user["is-tutor"] && (
                    <MotionButton
                        variants={itemVariants}
                        text="See requests"
                        onClick={() => navigate("/requests")}
                    />
                )}
            </div>
        </>
    )
}

export default HomePage
