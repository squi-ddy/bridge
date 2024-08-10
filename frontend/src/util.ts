import { ITimeslot, Time } from "@backend/types/timeslot"
import { columns, rows, timestamps } from "./components/Calendar"

export function preciseFloor(x: number, div: number) {
    return Math.round((x - (x % div)) / div)
}

export function mergeTimeslots(timeslots: ITimeslot[]): ITimeslot[] {
    const inTimeslot = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => {
            return false
        }),
    )
    timeslots.forEach((timeslot) => {
        const start = timeslot["start-time"]
        const end = timeslot["end-time"]

        const beginIndex = timestamps.indexOf(
            Time.fromITime(start).toHMString(),
        )
        const endIndex =
            timestamps.indexOf(Time.fromITime(end).toHMString()) - 1
        for (let i = beginIndex; i <= endIndex; i++) {
            inTimeslot[i][timeslot["day-of-week"]] = true
        }
    })
    const ret: ITimeslot[] = []
    for (let j = 0; j < columns; j++) {
        let startIndex = -1
        for (let i = 0; i < rows; i++) {
            if (inTimeslot[i][j] && startIndex === -1) {
                startIndex = i
            }
            if (!inTimeslot[i][j] && startIndex !== -1) {
                ret.push({
                    "day-of-week": j,
                    "start-time": Time.fromHMString(timestamps[startIndex]),
                    "end-time": Time.fromHMString(timestamps[i]),
                })
                startIndex = -1
            }
        }
        if (startIndex !== -1) {
            ret.push({
                "day-of-week": j,
                "start-time": Time.fromHMString(timestamps[startIndex]),
                "end-time": Time.fromHMString(timestamps[rows]),
            })
        }
    }
    return ret
}

export function timeslotsNotIn(
    timeslots: ITimeslot[],
    notIn: ITimeslot[],
): ITimeslot[] {
    const inTimeslot = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => {
            return false
        }),
    )
    timeslots.forEach((timeslot) => {
        const start = timeslot["start-time"]
        const end = timeslot["end-time"]

        const beginIndex = timestamps.indexOf(
            Time.fromITime(start).toHMString(),
        )
        const endIndex =
            timestamps.indexOf(Time.fromITime(end).toHMString()) - 1
        for (let i = beginIndex; i <= endIndex; i++) {
            inTimeslot[i][timeslot["day-of-week"]] = true
        }
    })
    notIn.forEach((timeslot) => {
        const start = timeslot["start-time"]
        const end = timeslot["end-time"]

        const beginIndex = timestamps.indexOf(
            Time.fromITime(start).toHMString(),
        )
        const endIndex =
            timestamps.indexOf(Time.fromITime(end).toHMString()) - 1
        for (let i = beginIndex; i <= endIndex; i++) {
            inTimeslot[i][timeslot["day-of-week"]] = false
        }
    })
    const ret: ITimeslot[] = []
    for (let j = 0; j < columns; j++) {
        let startIndex = -1
        for (let i = 0; i < rows; i++) {
            if (inTimeslot[i][j] && startIndex === -1) {
                startIndex = i
            }
            if (!inTimeslot[i][j] && startIndex !== -1) {
                ret.push({
                    "day-of-week": j,
                    "start-time": Time.fromHMString(timestamps[startIndex]),
                    "end-time": Time.fromHMString(timestamps[i]),
                })
                startIndex = -1
            }
        }
        if (startIndex !== -1) {
            ret.push({
                "day-of-week": j,
                "start-time": Time.fromHMString(timestamps[startIndex]),
                "end-time": Time.fromHMString(timestamps[rows]),
            })
        }
    }
    return ret
}
