export interface ScheduleBlock {
  time: string;
  title: string;
  description: string;
  location: string;
  type: "ceremony" | "meal" | "hacking" | "workshop" | "judging" | "social";
}

export const SCHEDULE_BLOCKS: ScheduleBlock[] = [
  {
    time: "8:00 AM",
    title: "Registration & Breakfast",
    description: "Check in, pick up your badge, grab breakfast, and meet your teammates.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "9:00 AM",
    title: "Opening Ceremony",
    description: "Keynote and official track reveals.",
    location: "Knight Auditorium",
    type: "ceremony",
  },
  {
    time: "10:00 AM",
    title: "Buildathon Begins",
    description: "Students have roughly 4 hours of core build time.",
    location: "All Hacking Spaces",
    type: "hacking",
  },
  {
    time: "12:30 PM",
    title: "Grab-and-Go Lunch",
    description: "Refuel and confirm your track via MS Form around this time.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "2:30 PM",
    title: "Submissions Open",
    description: "Submit your project via the website or a specific form.",
    location: "Online Portal",
    type: "hacking",
  },
  {
    time: "4:00 PM",
    title: "Submissions Close",
    description: "Final deadline for all project submissions.",
    location: "Online Portal",
    type: "hacking",
  },
  {
    time: "4:30 PM",
    title: "First Round Judging",
    description: "10 rooms; 3 judges per room (including 1 student judge).",
    location: "Judging Rooms",
    type: "judging",
  },
  {
    time: "5:30 PM",
    title: "Substantial Snack / Dinner",
    description: "Dinner service for all participants while judges deliberate.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "6:30 PM",
    title: "Final Round Judging",
    description: "6 finalist teams present in Knight Auditorium.",
    location: "Knight Auditorium",
    type: "judging",
  },
  {
    time: "8:00 PM",
    title: "Award Ceremony",
    description: "Announcement of one winner and one runner-up per track.",
    location: "Knight Auditorium",
    type: "ceremony",
  },
  {
    time: "8:30 PM",
    title: "Event Ends",
    description: "Final wrap-up. Thank you for building with us!",
    location: "Knight Auditorium",
    type: "social",
  },
];
