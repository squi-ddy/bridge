import { createPendingTutelage } from "@/api"
import { UserContext } from "@/base/BasePage"
import Calendar, {
    IAdditionalSlot,
    IContiguousSlot,
    timestamps,
} from "@/components/Calendar"
import MotionButton from "@/components/MotionButton"
import RequestSubjectSelection, {
    IInputSubject,
} from "@/components/RequestSubjectSelection"
import SetTitle from "@/components/SetTitle"
import FormTextInput from "@/components/forms/FormTextInput"
import { InputSubmitFunction } from "@/types/FormDefinition"
import { timeslotsNotIn } from "@/util"
import { ISubject } from "@backend/types/subject"
import { IFindTimeslotsResult, Time } from "@backend/types/timeslot"
import { motion } from "framer-motion"
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
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

function RequestTutelagePage() {
    const { state } = useLocation()
    const navigate = useNavigate()

    const [errorText, setErrorText] = useState<string>("")
    const getContiguousSlots = useRef<() => IContiguousSlot[]>(() => [])
    const getFilters = useRef<() => IInputSubject[]>(() => [])
    const whatToLearnSubmit = useRef<InputSubmitFunction<string>>(() => "")

    const { user } = useContext(UserContext)

    useEffect(() => {
        if (!state?.data) {
            navigate("/")
        }
    }, [state, navigate])

    const data = state?.data as IFindTimeslotsResult | undefined
    const [slotsData, setSlotsData] = useState<{
        [key: string]: (IContiguousSlot & { subjectName: string })[]
    }>({})

    const calendarTimeslots = useMemo(() => {
        if (!data) return []
        return data.timeslots.map((ts) => ({
            beginIndex: timestamps.indexOf(
                Time.fromITime(ts["start-time"]).toHMString(),
            ),
            endIndex:
                timestamps.indexOf(
                    Time.fromITime(ts["end-time"]).toHMString(),
                ) - 1,
            dayOfWeek: ts["day-of-week"],
            color: "bg-purple-500/50",
        }))
    }, [data])

    const [clickedSubject, setClickedSubject] = useState<ISubject | undefined>(
        undefined,
    )
    const addSchedule = useCallback(
        (subject: ISubject, slots: IContiguousSlot[]) => {
            const newSlotsData = { ...slotsData }
            if (!(subject["subject-code"] in newSlotsData)) {
                newSlotsData[subject["subject-code"]] = []
            }
            newSlotsData[subject["subject-code"]] = slots.map((slot) => ({
                ...slot,
                subjectName: subject.name,
            }))
            return newSlotsData
        },
        [slotsData],
    )

    const subjectAvailableTimeslots = useMemo(() => {
        const baseTimeslots = [...calendarTimeslots]
        const subject = clickedSubject
        const subjectCodes = getFilters
            .current()
            .map((s) => s["subject-code"])
            .filter((code) => code !== subject?.["subject-code"])
        const conflictingTimeslots = Object.entries(slotsData)
            .filter(([k]) => subjectCodes.includes(k))
            .flatMap(([_, v]) => v)
        const availableTimeslots = timeslotsNotIn(
            baseTimeslots.map((ts) => ({
                "start-time": Time.fromHMString(timestamps[ts.beginIndex]),
                "end-time": Time.fromHMString(timestamps[ts.endIndex + 1]),
                "day-of-week": ts.dayOfWeek,
            })),
            conflictingTimeslots.map((ts) => ({
                "start-time": Time.fromHMString(timestamps[ts.beginIndex]),
                "end-time": Time.fromHMString(timestamps[ts.endIndex + 1]),
                "day-of-week": ts.dayOfWeek,
            })),
        )
        const availableCalendarTimeslots: IContiguousSlot[] =
            availableTimeslots.map((ts) => ({
                beginIndex: timestamps.indexOf(
                    Time.fromITime(ts["start-time"]).toHMString(),
                ),
                endIndex:
                    timestamps.indexOf(
                        Time.fromITime(ts["end-time"]).toHMString(),
                    ) - 1,
                dayOfWeek: ts["day-of-week"],
            }))
        const colouredTimeslots: IContiguousSlot[] = availableCalendarTimeslots
            .map((ts) => ({
                ...ts,
                color: "bg-purple-500/50",
            }))
            .concat(
                conflictingTimeslots.map((ts) => ({
                    ...ts,
                    color: "bg-yellow-500/50",
                })),
            )
        const additionalSlots: IAdditionalSlot[] = conflictingTimeslots.map(
            (ts) => ({
                ...ts,
                styles: "bg-yellow-500/50",
                text: ts.subjectName,
            }),
        )
        return {
            availableCalendarTimeslots,
            colouredTimeslots,
            additionalSlots,
        }
    }, [calendarTimeslots, clickedSubject, slotsData])

    const changeClickedSubject = useCallback(
        (subject: ISubject | undefined) => {
            if (clickedSubject) {
                setSlotsData(
                    addSchedule(clickedSubject, getContiguousSlots.current()),
                )
            }
            setClickedSubject(subject)
        },
        [clickedSubject, setSlotsData, addSchedule],
    )

    const submit = useCallback(async () => {
        if (!user || !data) return false
        const whatToLearn = whatToLearnSubmit.current()
        if (!whatToLearn) {
            return false
        }
        const subjects = getFilters.current().filter((sub) => sub.include)
        if (subjects.length === 0) {
            setErrorText("Please select at least one subject!")
            return false
        }
        const contiguousSlots = getContiguousSlots.current()
        const newSlotsData = clickedSubject
            ? addSchedule(clickedSubject, contiguousSlots)
            : slotsData
        for (const subject of subjects) {
            if (
                !(subject["subject-code"] in newSlotsData) ||
                newSlotsData[subject["subject-code"]].length === 0
            ) {
                setErrorText(`Please select timeslots for ${subject.name}!`)
                return false
            }
        }
        setSlotsData(newSlotsData)
        const resp = await createPendingTutelage({
            "tutor-sid": data["tutor-sid"],
            "what-to-learn": whatToLearn,
            timeslots: subjects
                .map((subject) => {
                    return newSlotsData[subject["subject-code"]].map((ts) => ({
                        "day-of-week": ts.dayOfWeek,
                        "start-time": Time.fromHMString(
                            timestamps[ts.beginIndex],
                        ),
                        "end-time": Time.fromHMString(
                            timestamps[ts.endIndex + 1],
                        ),
                        "subject-code": subject["subject-code"],
                    }))
                })
                .flat(),
        })
        if (!resp.success) {
            if (resp.response?.status !== 500) {
                setErrorText(
                    resp.response?.data.message ??
                        "Internal Server Error: Unknown non-500 error!",
                )
                return false
            }
            setErrorText("Internal Server Error: Failed to create tutelage!")
            return false
        }
        return true
    }, [addSchedule, clickedSubject, slotsData, user, data])

    if (!data) return <></>

    return (
        <>
            <SetTitle title={"Request Tutelage"} />
            <motion.div
                variants={itemVariants}
                className="mb-1 flex flex-row w-2/3"
                layout
            >
                <h1 className="text-5xl">{"Request Tutelage"}</h1>
                <div className="grow" />
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 mb-4"
                layout
            >
                <i>
                    Requesting for tutelage is a simple process. First, select
                    the subject you want to learn. Then, select the timeslots
                    you are available for. Finally, click the &quot;Save&quot;
                    button to submit your request.
                </i>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 h-3/5 gap-4 items-center justify-center"
                layout
            >
                <motion.div
                    variants={itemVariants}
                    className="h-full w-1/3 flex flex-col items-center gap-2"
                    layout
                >
                    <RequestSubjectSelection
                        subjects={data["can-teach-subjects"].map((sub) => ({
                            ...sub,
                            include: true,
                        }))}
                        setGetFilters={(f) => {
                            getFilters.current = f
                        }}
                        clickedSubject={clickedSubject}
                        setClickedSubject={changeClickedSubject}
                    />
                </motion.div>
                {clickedSubject && (
                    <motion.div
                        variants={itemVariants}
                        className="w-2/3 flex flex-col items-center gap-2"
                        layout
                    >
                        <div className="flex flex-row w-full gap-2 justify-center">
                            <motion.div
                                variants={itemVariants}
                                className="text-3xl"
                                layout
                            >
                                Slots
                            </motion.div>
                        </div>
                        <Calendar
                            key={clickedSubject["subject-code"]}
                            defaultSelected={
                                slotsData[clickedSubject["subject-code"]] ??
                                emptyArray
                            }
                            setGetContiguousSlots={(
                                f: () => IContiguousSlot[],
                            ) => {
                                getContiguousSlots.current = f
                            }}
                            edit={true}
                            additionalSlots={
                                subjectAvailableTimeslots.additionalSlots
                            }
                            drawContiguousSlots={true}
                            limitEditsTo={
                                subjectAvailableTimeslots.availableCalendarTimeslots
                            }
                            additionalHighlighted={
                                subjectAvailableTimeslots.colouredTimeslots
                            }
                        />
                    </motion.div>
                )}
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 justify-center gap-2 z-10"
                layout
            >
                <FormTextInput
                    fieldName="learn"
                    fieldPlaceholder="What do you want to learn?"
                    width="w-full"
                    textSize="text-lg"
                    h="h-10"
                    checker={(value) => {
                        if (value.length === 0) {
                            return {
                                success: false,
                                message:
                                    "Please enter something specific that you want to learn!",
                            }
                        }
                        return { success: true }
                    }}
                    setSubmitFunction={(f) => {
                        whatToLearnSubmit.current = f
                    }}
                />
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="flex flex-row w-2/3 justify-center gap-2"
                layout
            >
                <MotionButton
                    variants={itemVariants}
                    text="Back"
                    onClick={async () => {
                        navigate("/options/learner")
                    }}
                />
                <MotionButton
                    variants={itemVariants}
                    text="Submit"
                    onClick={async () => {
                        if (!(await submit())) return
                        navigate("/")
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
        </>
    )
}

export default RequestTutelagePage
