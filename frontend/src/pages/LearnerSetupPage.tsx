import {
    findTimeslots,
    getLearnerSubjects,
    getSubjects,
    sendLearnerSubjects,
} from "@/api"
import { UserContext } from "@/base/BasePage"
import Calendar, {
    IAdditionalSlot,
    IContiguousSlot,
    timestamps,
} from "@/components/Calendar"
import LearnerFindTimeslot from "@/components/LearnerFindTimeslot"
import LearnerSubjectSelection, {
    IInputSubject,
} from "@/components/LearnerSubjectSelection"
import MotionButton from "@/components/MotionButton"
import SetTitle from "@/components/SetTitle"
import { mergeTimeslots, timeslotsNotIn } from "@/util"
import { ISubject } from "@backend/types/subject"
import { IFindTimeslotsResult, Time } from "@backend/types/timeslot"
import { motion } from "framer-motion"
import {
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const emptyArray: IAdditionalSlot[] = []

function LearnerSetupPage() {
    const { state, pathname } = useLocation()
    const { user, updateUser } = useContext(UserContext)
    const navigate = useNavigate()
    const [allSubjects, setAllSubjects] = useState<ISubject[] | null>(null)
    const [subjects, setSubjects] = useState<IInputSubject[]>([])

    const [floatingRef, setFloatingRef] = useState<HTMLElement | null>(null)
    const getContiguousSlots = useRef<() => IContiguousSlot[]>(() => [])

    const [dialog, setDialog] = useState<ReactElement | null>(null)
    const [errorText, setErrorText] = useState<string>("")

    const [calendarEditable, setCalendarEditable] = useState(true)
    const [calendarDrawContiguous, setCalendarDrawContiguous] = useState(true)
    const getFilters = useRef<() => IInputSubject[]>(() => [])
    const [calendarAdditionalSlots, setCalendarAdditionalSlots] = useState<
        IAdditionalSlot[]
    >([])
    const [searchResults, setSearchResults] = useState<IFindTimeslotsResult[]>(
        [],
    )
    const [highlightSubject, setHighlightSubject] = useState<string>("")

    const setHoverIndex = useCallback(
        (index: number) => {
            if (index === -1) {
                setCalendarEditable(true)
                setCalendarDrawContiguous(true)
                setCalendarAdditionalSlots([])
            } else {
                setCalendarEditable(false)
                setCalendarDrawContiguous(false)
                setCalendarAdditionalSlots(
                    searchResults[index].timeslots.map((ts) => ({
                        dayOfWeek: ts["day-of-week"],
                        beginIndex: timestamps.indexOf(
                            Time.fromITime(ts["start-time"]).toHMString(),
                        ),
                        endIndex:
                            timestamps.indexOf(
                                Time.fromITime(ts["end-time"]).toHMString(),
                            ) - 1,
                        text: ts["has-pending"] ? "Conflict?" : "Available",
                        styles: ts["has-pending"]
                            ? "bg-yellow-700"
                            : "bg-emerald-700",
                    })),
                )
            }
        },
        [searchResults],
    )

    useEffect(() => {
        if (state?.setup && pathname.includes("setup")) updateUser()
        getSubjects().then((subjects) => {
            if (subjects) setAllSubjects(subjects)
        })
    }, [pathname, state, updateUser])

    useEffect(() => {
        if (state?.setup) {
            return
        }
        if (!user || !user["is-learner"]) {
            navigate("/")
            return
        }
        if (!state?.setup && pathname.includes("setup")) {
            navigate("/")
            return
        }
        getLearnerSubjects({ "learner-sid": user["student-id"] }).then(
            (subjects) => {
                if (subjects)
                    setSubjects(
                        subjects.map((subject) => ({
                            ...subject,
                            includeInSearch: true,
                        })),
                    )
            },
        )
    }, [pathname, state, user, navigate])

    const submit = useCallback(async () => {
        if (!user) return false
        if (subjects.length === 0) {
            setErrorText("Please select at least one subject!")
            return false
        }
        const resp = await sendLearnerSubjects(
            subjects.map((subject) => ({
                "subject-code": subject["subject-code"],
                "learner-sid": user["student-id"],
            })),
        )
        if (!resp.success) {
            setErrorText("Internal Server Error: Failed to submit subjects!")
            return false
        }
        return true
    }, [subjects, user])

    const search = useCallback(async () => {
        if (!user) return false
        const contiguousSlots = getContiguousSlots.current()
        if (contiguousSlots.length === 0) {
            setErrorText("Please select at least one slot!")
            return false
        }
        const filteredSubjects = getFilters.current()
        if (filteredSubjects.length === 0) {
            setErrorText("Please select at least one subject!")
            return false
        }
        const resp = await findTimeslots({
            subjects: filteredSubjects,
            timeslots: contiguousSlots.map((slot) => ({
                "day-of-week": slot.dayOfWeek,
                "start-time": Time.fromHMString(timestamps[slot.beginIndex]),
                "end-time": Time.fromHMString(timestamps[slot.endIndex + 1]),
            })),
        })
        if (!resp) {
            setErrorText("Internal Server Error: Search failed!")
            return false
        }
        resp.forEach((tutor) => {
            const conflicting = tutor.timeslots.filter(
                (ts) => ts["has-pending"],
            )
            const nonConflicting = tutor.timeslots.filter(
                (ts) => !ts["has-pending"],
            )
            tutor.timeslots = mergeTimeslots(conflicting)
                .map((ts) => ({
                    ...ts,
                    "has-pending": true,
                }))
                .concat(
                    timeslotsNotIn(nonConflicting, conflicting).map((ts) => ({
                        ...ts,
                        "has-pending": false,
                    })),
                )
                .sort((a, b) => {
                    if (a["day-of-week"] !== b["day-of-week"]) {
                        return a["day-of-week"] - b["day-of-week"]
                    }
                    if (a["start-time"].hour !== b["start-time"].hour) {
                        return a["start-time"].hour - b["start-time"].hour
                    }
                    return a["start-time"].minute - b["start-time"].minute
                })
        })
        setSearchResults(resp)
        return true
    }, [user])

    if (!allSubjects || !user) return <></>

    const pageTitle = state?.setup ? "Learner Setup" : "Learner Details"

    return (
        <>
            <SetTitle title={pageTitle} />
            <motion.div
                ref={setFloatingRef}
                variants={itemVariants}
                className="mb-1 flex flex-row w-4/5"
                layout
            >
                <h1 className="text-5xl">{pageTitle}</h1>
                <div className="grow" />
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-4/5 mb-4"
                layout
            >
                <i>
                    We want to know what subjects you&apos;re interested in
                    learning!
                </i>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-4/5 h-2/3 gap-4 items-center"
                layout
            >
                <div className="h-full w-1/5 flex flex-col items-center gap-2">
                    <LearnerSubjectSelection
                        subjects={subjects}
                        setSubjects={setSubjects}
                        allSubjects={allSubjects}
                        reference={floatingRef!}
                        setDialog={setDialog}
                        setHighlightSubject={setHighlightSubject}
                        setGetFilters={(f) => {
                            getFilters.current = f
                        }}
                    />
                </div>
                <div className="w-2/5 flex flex-col items-center gap-2">
                    <div className="flex flex-row w-full gap-2 justify-center">
                        <motion.div
                            variants={itemVariants}
                            className="text-3xl"
                            layout
                        >
                            Your Free Slots
                        </motion.div>
                    </div>
                    <Calendar
                        defaultSelected={emptyArray}
                        setGetContiguousSlots={(f: () => IContiguousSlot[]) => {
                            getContiguousSlots.current = f
                        }}
                        edit={calendarEditable}
                        additionalSlots={calendarAdditionalSlots}
                        drawContiguousSlots={calendarDrawContiguous}
                    />
                </div>
                <div className="h-full w-2/5 flex flex-col items-center gap-2">
                    <LearnerFindTimeslot
                        timeslots={searchResults}
                        setHoverIndex={setHoverIndex}
                        highlightSubject={highlightSubject}
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
                            navigate("/")
                        }}
                    />
                )}
                <MotionButton
                    variants={itemVariants}
                    text="Save Interests"
                    onClick={async () => {
                        if (!(await submit())) return
                        navigate("/")
                    }}
                />
                <MotionButton
                    variants={itemVariants}
                    text="Search for tutors..."
                    onClick={async () => {
                        if (!(await submit())) return
                        if (!(await search())) return
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

export default LearnerSetupPage
