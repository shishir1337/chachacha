import {
  Briefcase,
  Building2,
  Car,
  HeartHandshake,
  HeartPulse,
  House,
  KeyRound,
  PawPrint,
  Sailboat,
  Umbrella,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** One icon per kind of cover, shared across the site. */
export const coverIcons: Record<string, LucideIcon> = {
  "auto-insurance": Car,
  "pet-insurance": PawPrint,
  "boat-insurance": Sailboat,
  "homeowners-insurance": House,
  "renters-insurance": KeyRound,
  "condo-insurance": Building2,
  "flood-insurance": Waves,
  "life-insurance": HeartHandshake,
  "health-insurance": HeartPulse,
  "umbrella-insurance": Umbrella,
  "business-insurance": Briefcase,
};
