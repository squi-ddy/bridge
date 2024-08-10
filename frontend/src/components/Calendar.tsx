import { preciseFloor } from "@/util"
import { motion } from "framer-motion"
import { useCallback, useMemo, useRef, useState } from "react"

type CalendarData = {
    color: string
    selectable: boolean
    selected: boolean
}

export interface IContiguousSlot {
    dayOfWeek: number
    beginIndex: number
    endIndex: number
    color?: string
}

export interface IAdditionalSlot extends IContiguousSlot {
    dayOfWeek: number
    beginIndex: number
    endIndex: number
    styles: string
    text: string | string[]
}

type CalendarArray = CalendarData[][]
type RefArray = (HTMLElement | null)[][]

export const rows = 20
export const columns = 5

const selectedColor = "bg-emerald-700"
const calendarSelectedColor = "bg-emerald-700/50"
const calendarUnselectedColor = "bg-red-700/50"

// from 8:00 to 18:00, 0:30 separation => 20 slots

const emptyCalendarData: () => CalendarArray = () =>
    Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => {
            return {
                color: calendarUnselectedColor,
                selectable: true,
                selected: false,
            } satisfies CalendarData
        }),
    )

const defaultRefArray: RefArray = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => {
        return null
    }),
)

export const days: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri"]
export const timestamps: string[] = Array.from({ length: rows + 1 }, (_, i) => {
    return `${(8 + preciseFloor(i, 2)).toString().padStart(2, "0")}:${
        i % 2 ? "30" : "00"
    }`
})

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const mainVariants = {
    hidden: { opacity: 0, transform: "translateY(-20px)" },
    visible: {
        opacity: 1,
        transform: "translateY(0)",
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.02,
            duration: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: { when: "afterChildren", staggerChildren: 0.01 },
    },
}

function Calendar(props: {
    defaultSelected: IContiguousSlot[]
    setGetContiguousSlots: (func: () => IContiguousSlot[]) => void
    edit: boolean
    additionalSlots: IAdditionalSlot[]
    drawContiguousSlots: boolean
    limitEditsTo?: IContiguousSlot[]
    additionalHighlighted?: IContiguousSlot[]
}) {
    const [calendarData, setCalendarData] = useState<CalendarArray>(() => {
        // set calendar data
        const calendarData = emptyCalendarData()
        for (const slot of props.defaultSelected) {
            for (let i = slot.beginIndex; i <= slot.endIndex; i++) {
                calendarData[i][slot.dayOfWeek].selected = true
            }
        }
        if (props.limitEditsTo) {
            calendarData.forEach((row) => {
                row.forEach((cell) => {
                    cell.selectable = false
                })
            })
            for (const slot of props.limitEditsTo) {
                for (let i = slot.beginIndex; i <= slot.endIndex; i++) {
                    calendarData[i][slot.dayOfWeek].selectable = true
                }
            }
        }
        if (props.additionalHighlighted) {
            for (const slot of props.additionalHighlighted) {
                for (let i = slot.beginIndex; i <= slot.endIndex; i++) {
                    calendarData[i][slot.dayOfWeek].color =
                        slot.color ?? calendarUnselectedColor
                }
            }
        }
        return calendarData
    })

    const [dragging, setDragging] = useState(false)
    const [startCell, setStartCell] = useState<[number, number]>([-1, -1])
    const [endCell, setEndCell] = useState<[number, number]>([-1, -1])
    const [fill, setFill] = useState(false)

    const refs = useRef(defaultRefArray)
    const referenceRef = useRef<HTMLDivElement | null>(null)
    const [finishedRender, setFinishedRender] = useState(false)

    const setRef = useCallback(
        (i: number, j: number) => (ref: HTMLElement | null) => {
            refs.current[i][j] = ref
        },
        [],
    )

    const commitSelection = useCallback(() => {
        const newCalendarData = [...calendarData]
        if (dragging)
            for (
                let i = Math.min(startCell[0], endCell[0]);
                i <= Math.max(startCell[0], endCell[0]);
                i++
            ) {
                for (
                    let j = Math.min(startCell[1], endCell[1]);
                    j <= Math.min(startCell[1], endCell[1]);
                    j++
                ) {
                    if (newCalendarData[i][j].selectable)
                        newCalendarData[i][j].selected = fill
                }
            }
        setCalendarData(newCalendarData)
    }, [calendarData, dragging, fill, startCell, endCell])

    const isSelected = useCallback(
        (i: number, j: number): boolean | undefined => {
            if (i >= calendarData.length) return undefined
            if (!calendarData[i][j].selectable) return false
            if (
                i >= Math.min(startCell[0], endCell[0]) &&
                i <= Math.max(startCell[0], endCell[0]) &&
                j >= Math.min(startCell[1], endCell[1]) &&
                j <= Math.max(startCell[1], endCell[1])
            ) {
                return fill
            }
            return calendarData[i][j].selected
        },
        [calendarData, fill, startCell, endCell],
    )

    const isContiguous = useCallback(
        (i: number, j: number): string => {
            if (i >= calendarData.length) return ""
            if (isSelected(i, j)) return calendarSelectedColor
            return calendarData[i][j].color === calendarUnselectedColor
                ? ""
                : calendarData[i][j].color
        },
        [calendarData, isSelected],
    )

    const contiguousSlots: IContiguousSlot[] = useMemo(() => {
        const contiguousSlots = []
        for (let j = 0; j < columns; j++) {
            let startIndex = -1
            for (let i = 0; i < rows; i++) {
                if (isSelected(i, j) && startIndex === -1) {
                    startIndex = i
                }
                if (!isSelected(i, j) && startIndex !== -1) {
                    contiguousSlots.push({
                        dayOfWeek: j,
                        beginIndex: startIndex,
                        endIndex: i - 1,
                    })
                    startIndex = -1
                }
            }
            if (startIndex !== -1) {
                contiguousSlots.push({
                    dayOfWeek: j,
                    beginIndex: startIndex,
                    endIndex: rows - 1,
                })
            }
        }
        return contiguousSlots
    }, [isSelected])

    props.setGetContiguousSlots(
        useCallback(() => contiguousSlots, [contiguousSlots]),
    )

    const getSlotStyles = useCallback((slot: IContiguousSlot) => {
        const referenceBounds = referenceRef.current!.getBoundingClientRect()
        const topBounds =
            refs.current[slot.beginIndex][
                slot.dayOfWeek
            ]!.getBoundingClientRect()
        const bottomBounds =
            refs.current[slot.endIndex][slot.dayOfWeek]!.getBoundingClientRect()

        const top = topBounds.top - referenceBounds.top - 2
        const left = topBounds.left - referenceBounds.left - 0.5
        const width = topBounds.width
        const height = bottomBounds.bottom - topBounds.top

        return { top, left, width, height }
    }, [])

    const slotLabels = useMemo(
        () =>
            finishedRender
                ? (props.drawContiguousSlots
                      ? contiguousSlots.map((slot, idx) => {
                            const day = days[slot.dayOfWeek]
                            const beginTime = timestamps[slot.beginIndex]
                            const endTime = timestamps[slot.endIndex + 1]
                            const numSlots = slot.endIndex - slot.beginIndex + 1

                            return (
                                <div
                                    key={idx}
                                    className={`absolute z-10 ${
                                        numSlots > 1 ? "p-2" : "px-2 py-1"
                                    } pointer-events-none`}
                                    style={getSlotStyles(slot)}
                                >
                                    <div
                                        className={`flex flex-col items-center justify-center ${selectedColor} text-white border border-white rounded-md w-full h-full`}
                                    >
                                        {numSlots > 2 && (
                                            <span className="font-semibold">
                                                {day}
                                            </span>
                                        )}
                                        <span className="text-xs">
                                            {beginTime} - {endTime}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                      : []
                  ).concat(
                      props.additionalSlots.map((slot, idx) => {
                          const numSlots = slot.endIndex - slot.beginIndex + 1
                          const text = Array.isArray(slot.text)
                              ? slot.text
                              : [slot.text]

                          return (
                              <div
                                  key={`add${idx}`}
                                  className={`absolute z-20 p-2 pointer-events-none ${
                                      numSlots > 1 ? "p-2" : "px-2 py-1"
                                  }`}
                                  style={getSlotStyles(slot)}
                              >
                                  <div
                                      className={`flex flex-col items-center justify-center ${slot.styles} border border-white rounded-md w-full h-full`}
                                  >
                                      {text.map((line) => (
                                          <span key={line} className="text-xs">
                                              {line}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )
                      }),
                  )
                : [],
        [
            contiguousSlots,
            finishedRender,
            props.additionalSlots,
            getSlotStyles,
            props.drawContiguousSlots,
        ],
    )

    return (
        <motion.div
            className="table-container w-full relative overflow-x-hidden"
            variants={mainVariants}
            ref={referenceRef}
            onAnimationComplete={() => setFinishedRender(true)}
        >
            {slotLabels}
            <table
                className="calendar-table"
                cellSpacing={0}
                cellPadding={0}
                onMouseLeave={() => {
                    setDragging(false)
                    commitSelection()
                }}
                onMouseUp={() => {
                    setDragging(false)
                    commitSelection()
                }}
                onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
            >
                <thead>
                    <motion.tr variants={itemVariants}>
                        <th className="w-[25%]"></th>
                        {days.map((day) => (
                            <th className="w-[15%]" key={day}>
                                {day}
                            </th>
                        ))}
                    </motion.tr>
                </thead>
                <tbody>
                    {calendarData.map((row, i) => (
                        <motion.tr variants={itemVariants} key={i}>
                            <th>{`${timestamps[i]} - ${timestamps[i + 1]}`}</th>
                            {row.map((data, j) => {
                                const contiguous = isContiguous(i, j)
                                const selected = isSelected(i, j)
                                const lastContiguous = isContiguous(i + 1, j)

                                return (
                                    <td
                                        key={j}
                                        ref={setRef(i, j)}
                                        onMouseDown={() => {
                                            if (props.edit) {
                                                setDragging(true)
                                                setFill(
                                                    !calendarData[i][j]
                                                        .selected,
                                                )
                                                setStartCell([i, j])
                                                setEndCell([i, j])
                                            }
                                        }}
                                        onMouseEnter={() => {
                                            if (
                                                dragging &&
                                                startCell[1] === j
                                            ) {
                                                setEndCell([i, j])
                                            }
                                        }}
                                        title={`${days[j]} ${timestamps[i]} - ${
                                            timestamps[i + 1]
                                        }`}
                                        className={`${
                                            contiguous
                                                ? contiguous === lastContiguous
                                                    ? "contiguous"
                                                    : "contiguous-last"
                                                : ""
                                        } transition-colors ${
                                            selected
                                                ? calendarSelectedColor
                                                : data.color
                                        }`}
                                    ></td>
                                )
                            })}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    )
}

export default Calendar
