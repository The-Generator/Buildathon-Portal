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
    location: "Main Check-In Area",
    type: "meal",
  },
  {
    time: "9:00–10:00 AM",
    title: "Opening Ceremony + All-Hands Photo",
    description: "Keynote, official track reveals, and group photo.",
    location: "Main Gathering Space",
    type: "ceremony",
  },
  {
    time: "10:00 AM",
    title: "Buildathon Begins",
    description: "Students have roughly 4 hours of core build time.",
    location: "Assigned Build Rooms",
    type: "hacking",
  },
  {
    time: "10:30 AM",
    title: "Live Demo: GitHub — From 0 → Launch",
    description: "GitHub Education leads a live walkthrough of GitHub CLI and how to go from zero to a shipped project.",
    location: "Winn Auditorium",
    type: "workshop",
  },
  {
    time: "12:30 PM",
    title: "Grab-and-Go Lunch",
    description: "Refuel without losing momentum.",
    location: "Designated Dining / Common Areas",
    type: "meal",
  },
  {
    time: "2:30 PM",
    title: "Project Submissions Open",
    description: "Submit your project via the online portal.",
    location: "Online",
    type: "hacking",
  },
  {
    time: "4:00 PM",
    title: "Project Submissions Close",
    description: "Final deadline for all project submissions.",
    location: "Online",
    type: "hacking",
  },
  {
    time: "4:30–5:30 PM",
    title: "Project Showcases & Judging",
    description: "Teams present to judges in assigned rooms.",
    location: "Assigned Presentation Rooms",
    type: "judging",
  },
  {
    time: "5:30–6:15 PM",
    title: "Dinner Break",
    description: "Dinner service for all participants while judges deliberate.",
    location: "Designated Dining Areas",
    type: "meal",
  },
  {
    time: "6:15–7:45 PM",
    title: "Final Round Presentations",
    description: "Finalist teams present on stage.",
    location: "Knight Auditorium",
    type: "judging",
  },
  {
    time: "8:15 PM",
    title: "Awards Ceremony",
    description: "Announcement of winners and prizes.",
    location: "Knight Auditorium",
    type: "ceremony",
  },
];
