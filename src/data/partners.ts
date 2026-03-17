export interface Tier {
  name: string;
  price: string;
  color: string;
  benefits: boolean[];
}

export const BENEFIT_ROWS = [
  "Logo on Website",
  "Social Media Shout-out",
  "Speaking Slot",
  "Judge Seats",
  "Sponsor a Prize / Track",
  "Expo / Demo Booth",
] as const;

export const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$500",
    color: "#94a3b8",
    benefits: [true, true, false, false, false, false],
  },
  {
    name: "Community",
    price: "$1,000",
    color: "#60a5fa",
    benefits: [true, true, true, false, false, false],
  },
  {
    name: "Innovation",
    price: "$2,500",
    color: "#a78bfa",
    benefits: [true, true, true, true, false, false],
  },
  {
    name: "Gold",
    price: "$5,000",
    color: "#facc15",
    benefits: [true, true, true, true, true, false],
  },
  {
    name: "Platinum",
    price: "$10,000",
    color: "#00e87b",
    benefits: [true, true, true, true, true, true],
  },
];
