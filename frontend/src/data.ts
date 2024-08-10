import { faker } from "@faker-js/faker"

const subjects = [
    "English",
    "Math",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
    "Computer Science",
]

const tutors: { name: string; subjects: string[]; year: number }[] = []

const learners: { name: string; subjects: string[]; year: number }[] = []

const lessons: {
    tutor: string
    learner: string
    subject: string
    date: Date
}[] = []

// populate both
for (let i = 0; i < 50; i++) {
    tutors.push({
        name: faker.person.fullName(),
        subjects: faker.helpers.arrayElements(subjects, { min: 1, max: 3 }),
        year: faker.number.int({ min: 3, max: 6 }),
    })
}

for (let i = 0; i < 50; i++) {
    learners.push({
        name: faker.person.fullName(),
        subjects: faker.helpers.arrayElements(subjects, { min: 1, max: 3 }),
        year: faker.number.int({ min: 3, max: 6 }),
    })
}

// generate lessons
for (let i = 0; i < 100; i++) {
    const tutor = faker.helpers.arrayElement(tutors)
    const learner = faker.helpers.arrayElement(learners)
    const subject = faker.helpers.arrayElement(tutor.subjects)
    const date = faker.date.between({ from: "2024-01-01", to: "2024-02-10" })
    lessons.push({
        tutor: tutor.name,
        learner: learner.name,
        subject,
        date,
    })
}

export { tutors, learners, lessons }
