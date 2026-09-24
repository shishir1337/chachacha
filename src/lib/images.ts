/**
 * Image registry.
 *
 * Each slot renders a prompt placeholder until `ready` is true.
 * To swap in a real image: generate it from the prompt, save it to
 * /public/img/<file>, then set `ready: true` on that entry.
 */

const STYLE =
  "Editorial photograph, natural daylight, shallow depth of field, cool neutral tones with one small accent of crimson red, premium and calm, no text, no logos.";

export const images = {
  independent: {
    file: "independent.jpg",
    ratio: "4/5",
    ready: true,
    alt: "An agent and a couple reviewing insurance options together at a bright table",
    prompt: `A friendly insurance agent sitting beside a young couple at a light oak table, a laptop open showing several options side by side, everyone relaxed and smiling. ${STYLE}`,
  },
  auto: {
    file: "cover-auto.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A modern car on an open coastal road",
    prompt: `A modern silver car driving along an open coastal highway at golden hour, seen from a low three-quarter angle. ${STYLE}`,
  },
  pet: {
    file: "cover-pet.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A happy dog resting beside its owner at home",
    prompt: `A happy golden retriever resting its head on its owner's lap on a light sofa at home, the owner's hand gently on its head, a small crimson red collar tag, soft window light. ${STYLE}`,
  },
  boat: {
    file: "cover-boat.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A small motorboat on calm blue water",
    prompt: `A small white motorboat cruising on calm open water, aerial view, soft wake trailing behind, clear sky. ${STYLE}`,
  },
  homeowners: {
    file: "cover-homeowners.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A modern family home at dusk with warm windows",
    prompt: `A modern two-storey family home at dusk with glowing windows, tidy front lawn, architectural photography. ${STYLE}`,
  },
  renters: {
    file: "cover-renters.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A bright apartment living room with moving boxes",
    prompt: `A bright city apartment living room on moving day, a sofa, plants and a couple of open cardboard boxes, sunlight through large windows. ${STYLE}`,
  },
  condo: {
    file: "cover-condo.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A condo balcony overlooking a city skyline",
    prompt: `A stylish condo balcony with two chairs overlooking a city skyline in soft morning light. ${STYLE}`,
  },
  flood: {
    file: "cover-flood.jpg",
    ratio: "4/5",
    ready: true,
    alt: "Rain falling on a residential street",
    prompt: `Heavy rain falling on a quiet residential street, puddles reflecting house lights, moody but hopeful, no damage shown. ${STYLE}`,
  },
  life: {
    file: "cover-life.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A parent lifting a laughing child in a sunny park",
    prompt: `A parent lifting a laughing young child into the air in a sunny park, candid and joyful. ${STYLE}`,
  },
  health: {
    file: "cover-health.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A person stretching after a morning run",
    prompt: `A person in their thirties stretching after a morning run in a green park, healthy and energised. ${STYLE}`,
  },
  umbrella: {
    file: "cover-umbrella.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A single red umbrella in the rain",
    prompt: `A single crimson red umbrella held over a person walking through light rain on a clean modern plaza, overhead angle. ${STYLE}`,
  },
  business: {
    file: "cover-business.jpg",
    ratio: "4/5",
    ready: true,
    alt: "A small business owner opening their shop",
    prompt: `A small business owner flipping the sign to open on the glass door of a modern cafe or boutique, morning light. ${STYLE}`,
  },
  why: {
    file: "why-chacha.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A ChaCha agent smiling while on a phone call",
    prompt: `A warm, professional insurance agent wearing a headset, smiling while helping a customer on a call in a modern office with deep teal and crimson accents. ${STYLE}`,
  },
  cta: {
    file: "cta.jpg",
    ratio: "16/10",
    ready: true,
    alt: "Keys handed over in front of a new home",
    prompt: `Close-up of a hand passing a set of house and car keys to another hand, blurred modern home in the background. ${STYLE}`,
  },
  momentCar: {
    file: "moment-car.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A new car owner holding keys beside their car",
    prompt: `A delighted person in their late twenties holding up a new set of car keys beside a freshly bought hatchback, dealership lot softly blurred. ${STYLE}`,
  },
  momentMove: {
    file: "moment-move.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A young renter carrying a box into a bright apartment",
    prompt: `A young renter carrying a cardboard box and a potted plant into a sunlit empty apartment, candid moving-day moment. ${STYLE}`,
  },
  momentHome: {
    file: "moment-home.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A couple standing in front of their new house",
    prompt: `A happy couple standing on the front steps of their new modern home, holding a small house key, evening light. ${STYLE}`,
  },
  momentWedding: {
    file: "moment-wedding.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A newly married couple walking hand in hand",
    prompt: `A newly married couple walking hand in hand down a tree-lined street, relaxed and joyful, understated wedding outfits. ${STYLE}`,
  },
  momentBaby: {
    file: "moment-baby.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A parent holding a newborn by a window",
    prompt: `A parent gently holding a sleeping newborn near a bright window, soft and tender, minimal nursery. ${STYLE}`,
  },
  momentBusiness: {
    file: "moment-business.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A small business owner setting up a new shop",
    prompt: `A small business owner arranging products on shelves in a newly opened boutique, proud and focused. ${STYLE}`,
  },
  momentBoat: {
    file: "moment-boat.jpg",
    ratio: "3/4",
    ready: true,
    alt: "Friends relaxing on a small boat",
    prompt: `Friends relaxing on a small motorboat on a calm lake in summer, laughing, clear water. ${STYLE}`,
  },
  momentRenewal: {
    file: "moment-renewal.jpg",
    ratio: "3/4",
    ready: true,
    alt: "A person reading a renewal letter at the kitchen table",
    prompt: `A person at a bright kitchen table reading an insurance renewal letter, coffee cup nearby, thoughtful but calm expression. ${STYLE}`,
  },
} satisfies Record<string, ImageSpec>;

export type ImageSpec = {
  file: string;
  ratio: string;
  ready: boolean;
  /** CSS object-position, to keep the subject in frame when the photo is cropped. */
  position?: string;
  alt: string;
  prompt: string;
};

export type ImageKey = keyof typeof images;
