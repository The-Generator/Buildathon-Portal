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
    team: "IPE",
    event: "Fall 2025",
    track: "Entrepreneurial Applications for Biotech",
    description:
      "An AI-powered patent management platform that helps biotech startups navigate the patent process — using NLP and machine learning to predict patent success rates and provide actionable feedback on draft filings.",
    images: [
      "/photos/ipe-team.jpg",
      "/photos/ipe-presenting.jpg",
      "/photos/ipe-pitch.jpg",
    ],
    deckUrl: "/decks/ipe-fall-2025.pptx",
  },
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
