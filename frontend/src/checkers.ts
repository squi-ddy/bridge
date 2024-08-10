import { createIs } from "typia"
import { IUserMinimal, IUserFull } from "@backend/types/user"
import {
    ILearnerSubject,
    ISubject,
    ITutorSubject,
} from "@backend/types/subject"
import { IEmptyTimeslot, IFindTimeslotsResult } from "@backend/types/timeslot"
import { IPendingTutelage } from "@backend/types/tutelage"
import { INotification } from "@backend/types/notification"

export const isMinimalUser = createIs<IUserMinimal>()
export const isFullUser = createIs<IUserFull>()
export const isSubjectArray = createIs<ISubject[]>()
export const isEmptyTimeslotArray = createIs<IEmptyTimeslot[]>()
export const isTutorSubjectArray = createIs<ITutorSubject[]>()
export const isLearnerSubjectArray = createIs<ILearnerSubject[]>()
export const isFindTimeslotsResultArray = createIs<IFindTimeslotsResult[]>()
export const isPendingTutelageArray = createIs<IPendingTutelage[]>()
export const isNotificationArray = createIs<INotification[]>()
