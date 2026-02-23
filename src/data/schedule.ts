export interface ScheduleBlock {
  time: string;
  title: string;
  description: string;
  location: string;
  type: "ceremony" | "meal" | "hacking" | "workshop" | "judging" | "social";
}

export const SCHEDULE_BLOCKS: ScheduleBlock[] = [
  {
    time: "8:30 AM",
    title: "Doors Open & Check-In",
    description: "Pick up your badge, grab a seat, and meet your teammates.",
    location: "Knight Auditorium Lobby",
    type: "social",
  },
  {
    time: "9:00 AM",
    title: "Breakfast",
    description: "Fuel up before the day begins. Coffee, pastries, and more.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "9:30 AM",
    title: "Opening Ceremony",
    description: "Welcome remarks, theme reveal, and track announcements.",
    location: "Knight Auditorium",
    type: "ceremony",
  },
  {
    time: "10:00 AM",
    title: "Team Formation & Matching",
    description: "Solo participants matched into teams. Partial teams get filled.",
    location: "Knight Auditorium",
    type: "social",
  },
  {
    time: "10:30 AM",
    title: "Hacking Begins",
    description: "The clock starts. 8.5 hours to build something real.",
    location: "All Hacking Spaces",
    type: "hacking",
  },
  {
    time: "11:00 AM",
    title: "Workshop: AI Tools Crash Course",
    description: "Quick-start guides for the sponsored AI tools available to you.",
    location: "Room 101",
    type: "workshop",
  },
  {
    time: "12:00 PM",
    title: "Workshop: Pitching Your Project",
    description: "Learn how to present your idea to judges in 3 minutes.",
    location: "Room 101",
    type: "workshop",
  },
  {
    time: "12:30 PM",
    title: "Lunch",
    description: "Take a break and refuel. Lunch served buffet-style.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "1:30 PM",
    title: "Sponsor Lightning Talks",
    description: "Quick presentations from sponsors on their tools and APIs.",
    location: "Knight Auditorium",
    type: "workshop",
  },
  {
    time: "2:30 PM",
    title: "Mentor Office Hours",
    description: "One-on-one guidance from industry mentors and faculty.",
    location: "Mentorship Lounge",
    type: "social",
  },
  {
    time: "3:30 PM",
    title: "Snack Break",
    description: "Quick energy boost to power through the afternoon.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "5:30 PM",
    title: "Dinner",
    description: "Full dinner service. Last big meal before the final push.",
    location: "Knight Auditorium Lobby",
    type: "meal",
  },
  {
    time: "6:30 PM",
    title: "Final Sprint",
    description: "Last chance to polish your project and prepare your demo.",
    location: "All Hacking Spaces",
    type: "hacking",
  },
  {
    time: "7:00 PM",
    title: "Submissions Due",
    description: "Upload your project. No more code changes after this.",
    location: "Online Portal",
    type: "hacking",
  },
  {
    time: "7:30 PM",
    title: "Judging & Demos",
    description: "Teams present to judges. 3-minute pitch + live demo.",
    location: "Knight Auditorium",
    type: "judging",
  },
  {
    time: "8:30 PM",
    title: "Awards Ceremony & Closing",
    description: "Winners announced, prizes awarded, and closing remarks.",
    location: "Knight Auditorium",
    type: "ceremony",
  },
];
