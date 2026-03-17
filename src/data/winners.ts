export interface Winner {
  team: string;
  event: string;
  track: string;
  description: string;
  images: string[];
  deckUrl: string;
}

export const WINNERS: Winner[] = [
  {
    team: "TerraFlex",
    event: "Spring 2025",
    track: "AI-Powered Bio-Medical Devices",
    description:
      "An AI-driven prosthetic foot that dynamically adapts to uneven terrain using biomimicry design principles.",
    images: [
      "/photos/buildathon-event.jpg",
      "/photos/buildathon-hacking.jpg",
      "/photos/terraflex-pitch.png",
      "/photos/terraflex-cad.png",
    ],
    deckUrl: "/decks/terraflex-spring-2025.pdf",
  },
];
