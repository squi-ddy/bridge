import { getPendingTutelages } from "@/api"
import { UserContext } from "@/base/BasePage"
import Calendar, { IAdditionalSlot, timestamps } from "@/components/Calendar"
import MotionButton from "@/components/MotionButton"
import RequestsList from "@/components/RequestsList"
import SetTitle from "@/components/SetTitle"
import { Time } from "@backend/types/timeslot"
import { IPendingTutelage } from "@backend/types/tutelage"
import { motion } from "framer-motion"
import { useCallback, useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

function RequestsPage() {
    const { state, pathname } = useLocation()
    const { user } = useContext(UserContext)
    const navigate = useNavigate()

    const [calendarAdditionalSlots, setCalendarAdditionalSlots] = useState<
        IAdditionalSlot[]
    >([])
    const [hover, setHover] = useState(-1)

    const [tutelages, setTutelages] = useState<IPendingTutelage[]>([])

    const setHoverIndex = useCallback(
        (index: number) => {
            setHover(index)
            if (index === -1) {
                setCalendarAdditionalSlots([])
            } else {
                setCalendarAdditionalSlots(
                    tutelages[index].timeslots.map((ts) => ({
                        dayOfWeek: ts["day-of-week"],
                        beginIndex: timestamps.indexOf(
                            Time.fromITime(ts["start-time"]).toHMString(),
                        ),
                        endIndex:
                            timestamps.indexOf(
                                Time.fromITime(ts["end-time"]).toHMString(),
                            ) - 1,
                        text: [
                            ts.subject.name,
                            Time.fromITime(ts["start-time"]).toHMString() +
                                " - " +
                                Time.fromITime(ts["end-time"]).toHMString(),
                        ],
                        styles: "bg-yellow-700 text-center",
                    })),
                )
            }
        },
        [tutelages],
    )

    useEffect(() => {
        if (!user) {
            navigate("/")
            return
        }
        getPendingTutelages().then((tutelages) => {
            if (tutelages) setTutelages(tutelages)
        })
    }, [pathname, state, user, navigate])

    if (!user) return <></>

    const pageTitle = "Requests"

    return (
        <>
            <SetTitle title={pageTitle} />
            <motion.div
                variants={itemVariants}
                className="mb-1 flex flex-row w-2/3"
                layout
            >
                <h1 className="text-5xl">{pageTitle}</h1>
                <div className="grow" />
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 h-2/3 gap-4 items-center"
                layout
            >
                <div className="h-full w-1/2 flex flex-col items-center gap-2">
                    <RequestsList
                        tutelages={tutelages}
                        setHoverIndex={setHoverIndex}
                    />
                </div>
                <div className="w-1/2 flex flex-col items-center gap-2">
                    <motion.div variants={itemVariants} className="text-3xl">
                        Slots
                    </motion.div>
                    <Calendar
                        key={hover}
                        defaultSelected={calendarAdditionalSlots}
                        setGetContiguousSlots={() => {}}
                        edit={false}
                        additionalSlots={calendarAdditionalSlots}
                        drawContiguousSlots={false}
                    />
                </div>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-full justify-center gap-2"
                layout
            >
                {state?.setup && (
                    <MotionButton
                        variants={itemVariants}
                        text="Skip"
                        onClick={() => {
                            if (state?.learner) {
                                navigate("/setup/learner", {
                                    state: { setup: true },
                                })
                            } else {
                                navigate("/")
                            }
                        }}
                    />
                )}
            </motion.div>
        </>
    )
}

export default RequestsPage
