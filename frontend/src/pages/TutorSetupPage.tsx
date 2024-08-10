import {
    getEmptyTimeslots,
    getSubjects,
    getTutorSubjects,
    sendEmptyTimeslots,
    sendTutorSubjects,
} from "@/api"
import { UserContext } from "@/base/BasePage"
import Calendar, {
    IAdditionalSlot,
    IContiguousSlot,
    timestamps,
} from "@/components/Calendar"
import MotionButton from "@/components/MotionButton"
import SetTitle from "@/components/SetTitle"
import TutorSubjectSelection, {
    IInputSubject,
} from "@/components/TutorSubjectSelection"
import { ISubject } from "@backend/types/subject"
import { Time } from "@backend/types/timeslot"
import { motion } from "framer-motion"
import { ReactElement, useContext, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const emptyArray: IAdditionalSlot[] = []

function TutorSetupPage() {
    const { state, pathname } = useLocation()
    const { user, updateUser } = useContext(UserContext)
    const navigate = useNavigate()
    const [allSubjects, setAllSubjects] = useState<ISubject[] | null>(null)
    const [subjects, setSubjects] = useState<IInputSubject[]>([])

    const [floatingRef, setFloatingRef] = useState<HTMLElement | null>(null)

    const [dialog, setDialog] = useState<ReactElement | null>(null)
    const getContiguousSlots = useRef<() => IContiguousSlot[]>(() => [])
    const [errorText, setErrorText] = useState<string>("")

    const [defaultSelected, setDefaultSelected] = useState<IContiguousSlot[]>(
        [],
    )
    const [calendarApiReturned, setCalendarApiReturned] = useState(false)

    useEffect(() => {
        if (state?.setup && pathname.includes("setup")) updateUser()
        getSubjects().then((subjects) => {
            if (subjects) setAllSubjects(subjects)
        })
    }, [pathname, state, updateUser])

    useEffect(() => {
        if (state?.setup) {
            setCalendarApiReturned(true)
            return
        }
        if (!user || !user["is-tutor"]) {
            navigate("/")
            return
        }
        if (!state?.setup && pathname.includes("setup")) {
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
        getTutorSubjects({ "tutor-sid": user["student-id"] }).then(
            (subjects) => {
                if (!subjects) throw new Error("Failed to get subjects")
                setSubjects(subjects)
            },
        )
    }, [pathname, state, user, navigate])

    if (!allSubjects || !user) return <></>

    const pageTitle = state?.setup ? "Tutor Setup" : "Tutor Details"

    return (
        <>
            <SetTitle title={pageTitle} />
            <motion.div
                ref={setFloatingRef}
                variants={itemVariants}
                className="mb-1 flex flex-row w-2/3"
                layout
            >
                <h1 className="text-5xl">{pageTitle}</h1>
                <div className="grow" />
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 mb-4"
                layout
            >
                <i>
                    We want to know when you&apos;re free, and what subjects you
                    want to teach!
                </i>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 h-2/3 gap-4 items-center"
                layout
            >
                <div className="h-full w-1/2 flex flex-col items-center gap-2">
                    <TutorSubjectSelection
                        subjects={subjects}
                        setSubjects={setSubjects}
                        allSubjects={allSubjects}
                        reference={floatingRef!}
                        setDialog={setDialog}
                    />
                </div>
                <div className="w-1/2 flex flex-col items-center gap-2">
                    <motion.div variants={itemVariants} className="text-3xl">
                        Your Free Slots
                    </motion.div>
                    {calendarApiReturned && (
                        <Calendar
                            defaultSelected={defaultSelected}
                            setGetContiguousSlots={(
                                f: () => IContiguousSlot[],
                            ) => {
                                getContiguousSlots.current = f
                            }}
                            edit={true}
                            additionalSlots={emptyArray}
                            drawContiguousSlots={true}
                        />
                    )}
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
                <MotionButton
                    variants={itemVariants}
                    text="Save"
                    onClick={async () => {
                        if (subjects.length === 0) {
                            setErrorText("Please select at least one subject!")
                            return
                        }
                        const contiguousSlots = getContiguousSlots.current()
                        if (contiguousSlots.length === 0) {
                            setErrorText("Please select at least one slot!")
                            return
                        }
                        let resp = await sendTutorSubjects(
                            subjects.map((subject) => ({
                                "subject-code": subject["subject-code"],
                                "subject-gpa": subject["subject-gpa"],
                                year: subject.year,
                                "tutor-sid": user["student-id"],
                            })),
                        )
                        if (!resp.success) {
                            setErrorText(
                                "Internal Server Error: Failed to submit subjects!",
                            )
                            return
                        }
                        resp = await sendEmptyTimeslots(
                            contiguousSlots.map((slot) => ({
                                "day-of-week": slot.dayOfWeek,
                                "start-time": Time.fromHMString(
                                    timestamps[slot.beginIndex],
                                ),
                                "end-time": Time.fromHMString(
                                    timestamps[slot.endIndex + 1],
                                ),
                            })),
                        )
                        if (!resp.success) {
                            setErrorText(
                                "Internal Server Error: Failed to submit timeslots!",
                            )
                            return
                        }
                        if (state?.setup && state?.learner) {
                            navigate("/setup/learner", {
                                state: { setup: true },
                            })
                        } else navigate("/")
                    }}
                />
            </motion.div>
            {errorText && (
                <motion.div
                    variants={itemVariants}
                    className="-mt-2 text-sm text-center border-white border bg-red-400 py-1 px-2 rounded-md"
                    layout
                >
                    {errorText}
                </motion.div>
            )}
            {dialog}
        </>
    )
}

export default TutorSetupPage
