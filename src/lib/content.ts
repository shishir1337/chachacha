import type { ImageKey } from "./images";

export const contact = {
  phone: "888-888-9914",
  phoneHref: "tel:+18888889914",
  email: "info@chachainsurance.com",
  address: ["ChaCha, Inc.", "109 E 17th Street, Suite 80", "Cheyenne, WY 82001"],
  hours: "Monday to Friday, 9:00am to 6:00pm",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/chachainsurance/" },
    { label: "Twitter", href: "https://twitter.com/ChachaInsurance" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UCSO1Qsvczrg3qA6F59Z5GDg" },
  ],
};

export const nav = [
  { label: "Insurance", href: "#coverage" },
  { label: "About us", href: "/about-us" },
  { label: "Service", href: "/service" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact-us" },
];

export type Product = {
  slug: string;
  name: string;
  blurb: string;
  image: ImageKey;
};

export type Category = {
  name: string;
  tagline: string;
  products: Product[];
};

export const categories: Category[] = [
  {
    name: "Vehicle",
    tagline: "What you drive and ride",
    products: [
      { slug: "auto-insurance", name: "Auto", blurb: "Liability, collision, comprehensive and more for the car you drive every day.", image: "auto" },
      { slug: "boat-insurance", name: "Boat", blurb: "Protection on the water for your boat, motor, trailer and passengers.", image: "boat" },
    ],
  },
  {
    name: "Home & property",
    tagline: "Where you live and what is in it",
    products: [
      { slug: "homeowners-insurance", name: "Homeowners", blurb: "Your building, your belongings and your liability, in one policy.", image: "homeowners" },
      { slug: "renters-insurance", name: "Renters", blurb: "Your landlord insures the building. This covers everything you moved in.", image: "renters" },
      { slug: "condo-insurance", name: "Condo", blurb: "Fills the gap between your association's master policy and your unit.", image: "condo" },
      { slug: "flood-insurance", name: "Flood", blurb: "Standard home policies exclude flood. This is the cover that does not.", image: "flood" },
    ],
  },
  {
    name: "Life & health",
    tagline: "You and your family",
    products: [
      { slug: "life-insurance", name: "Life", blurb: "Term, whole and universal: what each one actually does, and who it suits.", image: "life" },
      { slug: "health-insurance", name: "Health", blurb: "Plan types, networks and what changes your premium.", image: "health" },
      { slug: "pet-insurance", name: "Pet", blurb: "Vet bills for accidents and illness, so the best care is never a hard call.", image: "pet" },
    ],
  },
  {
    name: "Liability & business",
    tagline: "Extra protection and commercial cover",
    products: [
      { slug: "umbrella-insurance", name: "Umbrella", blurb: "Extra liability that starts where your auto and home limits stop.", image: "umbrella" },
      { slug: "business-insurance", name: "Business", blurb: "Property, liability, commercial auto and workers' comp for your business.", image: "business" },
    ],
  },
];

export const allProducts = categories.flatMap((c) => c.products);

export const steps = [
  {
    title: "Analyze your insurance needs",
    body: "Tell us what you drive, where you live and who depends on you. We map the risks worth covering and point out the ones you can skip.",
  },
  {
    title: "Shop for your quote",
    body: "We take your details to dozens of carriers and line the offers up side by side, so you see price and coverage together.",
  },
  {
    title: "Put your policy into place",
    body: "Pick the option that fits. We handle the paperwork with the carrier and make sure your cover starts the day it should.",
  },
  {
    title: "Review and follow up",
    body: "Life changes and so do rates. We check in at renewal and shop again whenever there is a better deal to be had.",
  },
];

export const reasons = [
  {
    title: "Our customer-comes-first approach",
    body: "Trained staff who pick up the phone and stay with you from the first quote through every claim.",
  },
  {
    title: "Expert advice at your fingertips",
    body: "We use years of industry know-how to shape a plan around your life, not a one-size policy.",
  },
  {
    title: "The best coverage and price",
    body: "We are not tied to one national or direct-sell insurer, so we can go wherever the value is. That also means faster processing.",
  },
  {
    title: "A stress-free experience",
    body: "Hassle-free claims support and carriers we trust, so the hard days feel a little lighter.",
  },
];

export const compareRows = [
  {
    topic: "Insurers to choose from",
    captive: "One company's policies",
    chacha: "Dozens of carriers, compared for you",
  },
  {
    topic: "Who the agent works for",
    captive: "The insurer they represent",
    chacha: "You, the person buying the policy",
  },
  {
    topic: "When your renewal price jumps",
    captive: "Same company, same options",
    chacha: "We shop the market again",
  },
  {
    topic: "Bundling home, auto and more",
    captive: "Only inside one company",
    chacha: "Across carriers, with multi-policy discounts where available",
  },
  {
    topic: "When you file a claim",
    captive: "You are on your own with the insurer",
    chacha: "We guide you through it with the insurer",
  },
];

export const faqs = [
  {
    q: "How are you different from other insurance companies?",
    a: "We are not an insurance company. We are an independent agency, which means we compare policies from dozens of insurers for you. A captive agent can only sell the policies of the one company they work for.",
  },
  {
    q: "How does ChaCha work?",
    a: "Four steps: we analyze what you need covered, shop for your quote across carriers, put your chosen policy into place, and then review and follow up at renewal.",
  },
  {
    q: "How does ChaCha make money?",
    a: "The insurer you choose pays us a commission. You never pay us a separate fee, and buying through us costs no more than going to the insurer directly.",
  },
  {
    q: "Is ChaCha licensed?",
    a: "Yes. We are licensed state by state. You can find the details on our licenses page, or contact us if you do not see your state listed.",
  },
  {
    q: "Why should I trust ChaCha?",
    a: "Judge us on the quote. Our clients tell us their calls get answered, their coverage is explained in plain language, and their rates are competitive.",
  },
  {
    q: "How much does a quote cost?",
    a: "Nothing. Request one online or call us on 888-888-9914.",
  },
  {
    q: "Can you handle my claim?",
    a: "Your insurer settles the claim, but you will not face it alone. Our team guides you through each step of the process.",
  },
  {
    q: "Can I bundle policies together?",
    a: "Usually, yes. Putting more than one vehicle or policy together often unlocks multi-vehicle or multi-policy discounts.",
  },
];

export const posts = [
  {
    title: "Six Simple Strategies to Reduce Your Automobile Insurance Premium",
    tag: "Auto",
    date: "Dec 25, 2020",
    read: "6 min",
    slug: "six-simple-strategies-to-reduce-your-automobile-insurance-premium",
    alt: "A driver checking paperwork beside a parked car",
  },
  {
    title: "Watch Out For These Five Classical Homeowner Mistakes",
    tag: "Home",
    date: "Dec 14, 2020",
    read: "6 min",
    slug: "watch-out-for-these-five-classical-homeowner-mistakes",
    alt: "A suburban house seen from the front yard",
  },
  {
    title: "7 Secrets to Save on Car Insurance for 18-Year-Olds",
    tag: "Auto",
    date: "Dec 11, 2020",
    read: "5 min",
    slug: "7-secrets-to-save-on-car-insurance-for-18-year-olds",
    alt: "A young driver holding car keys",
  },
  {
    title: "Top Eight Tips to Securing Your Home against Theft",
    tag: "Home",
    date: "Dec 11, 2020",
    read: "7 min",
    slug: "top-eight-tips-to-securing-your-home-against-theft",
    alt: "A front door lock being secured",
  },
];

export const moments: {
  title: string;
  body: string;
  covers: string[];
  image: ImageKey;
}[] = [
  {
    title: "You just bought a car",
    body: "New keys, new questions. We compare liability, collision and comprehensive so you drive off covered.",
    covers: ["Auto", "Umbrella"],
    image: "momentCar",
  },
  {
    title: "Moving into your first place",
    body: "Your landlord insures the building. Renters cover protects everything you carried up the stairs.",
    covers: ["Renters"],
    image: "momentMove",
  },
  {
    title: "Buying a home",
    body: "We line up home cover your lender will accept, and check whether flood cover belongs in the plan.",
    covers: ["Homeowners", "Flood"],
    image: "momentHome",
  },
  {
    title: "Getting married",
    body: "Two cars, two policies, one household. Combining them is often where the savings show up.",
    covers: ["Auto", "Homeowners", "Life"],
    image: "momentWedding",
  },
  {
    title: "Welcoming a baby",
    body: "Someone new depends on you. We explain term, whole and universal life in plain words.",
    covers: ["Life", "Health"],
    image: "momentBaby",
  },
  {
    title: "Starting a business",
    body: "Property, liability, commercial auto and workers' comp, matched to the business you are actually building.",
    covers: ["Business", "Umbrella"],
    image: "momentBusiness",
  },
  {
    title: "A summer on the water",
    body: "Cover for your boat, motor, trailer and the friends you bring along.",
    covers: ["Boat"],
    image: "momentBoat",
  },
  {
    title: "Your renewal just went up",
    body: "Do not just pay it. Send us the notice and we will shop the market again.",
    covers: ["Any policy"],
    image: "momentRenewal",
  },
];

export const promises = [
  { big: "$0", title: "Your quote is free", body: "No fee to compare, and no obligation to switch. The insurer you choose pays our commission." },
  { big: "Dozens", title: "Of carriers compared", body: "We are not tied to one company, so the shortlist is built around you, not a sales target." },
  { big: "11", title: "Kinds of cover", body: "Cars, homes, boats, families and businesses. One agency for all of it." },
  { big: "1", title: "Agent for every policy", body: "One person who knows your whole picture and picks up when you call." },
];

export const serviceHelp = [
  { title: "General questions", body: "Coverage, billing or anything in between. Ask and we will explain it plainly." },
  { title: "Making a claim", body: "Your insurer settles the claim. We walk you through each step so nothing slips." },
  { title: "Changing a policy", body: "New car, new address, new driver. Tell us and we update your cover." },
  { title: "Requesting a certificate", body: "Need proof of insurance for a lender, landlord or client? We send it over." },
];
