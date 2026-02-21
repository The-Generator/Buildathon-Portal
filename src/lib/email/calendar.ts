import icalGenerator from "ical-generator";
import { EVENT_CONFIG } from "@/lib/constants";

export function generateCalendarInvite(): string {
  const calendar = icalGenerator({
    name: EVENT_CONFIG.name,
    prodId: { company: "Babson Generator", product: "Build-a-thon" },
  });

  calendar.createEvent({
    start: new Date(EVENT_CONFIG.startTime),
    end: new Date(EVENT_CONFIG.endTime),
    summary: EVENT_CONFIG.name,
    description: `${EVENT_CONFIG.theme} — A 12-hour hackathon at Babson College`,
    location: `${EVENT_CONFIG.location}, ${EVENT_CONFIG.address}`,
    url: "https://babsongenerator.com",
  });

  const icsString = calendar.toString();
  const base64 = Buffer.from(icsString).toString("base64");

  return base64;
}

export function getCalendarAttachment() {
  return {
    filename: "buildathon-2026.ics",
    content: generateCalendarInvite(),
  };
}
