const PROJECT_SEED = [
  ["10.webp", "matchday", "Matchday", "Motion", "2025"],
  ["12.webp", "nightshift", "Nightshift", "Art Direction", "2023"],
  ["14.webp", "volt", "Volt", "Branding", "2024"],
  ["16.webp", "keycard", "Keycard", "Product Design", "2026"],
  ["18.webp", "none", "None", "Photography", "2026"],
  ["2.webp", "prestige-equine", "Prestige Equine", "Web Design", "2025"],
  ["4.webp", "blue-room", "Blue Room", "Identity", "2023"],
  ["6.webp", "steininvest", "Steininvest", "Web Design", "2024"],
  ["8.webp", "cene-plus", "CENE+", "Branding", "2026"],
  ["9.webp", "snuff", "Snuff", "Editorial", "2024"],
  ["7.webp", "iris", "Iris", "Photography", "2023"],
  ["5.webp", "sevenworlds", "Sevenworlds", "Development", "2025"],
  ["3.webp", "irse-a-volver", "Irse a Volver", "Art Direction", "2024"],
  ["1.webp", "pm24", "PM24", "Branding", "2024"],
  ["17.webp", "favor", "Favor", "E-commerce", "2025"],
  ["15.webp", "freshweb", "Freshweb", "Web Design", "2025"],
  ["13.webp", "proba", "Proba", "Development", "2026"],
  ["11.webp", "mvn", "MVN", "Identity", "2025"],
];

const sentenceCase = (value) =>
  value.replace(/\+/g, " plus ").replace(/\s+/g, " ").trim();

export const DEFAULT_PROJECTS = PROJECT_SEED.map(
  ([posterPath, slug, title, type, year], index) => ({
    slug,
    title,
    type,
    year,
    posterPath,
    videoPath: "",
    videoUrl: "",
    shortDescription: `${title} is presented here as a featured ${sentenceCase(type).toLowerCase()} case study.`,
    longDescription: `${title} is ready to be replaced with the portfolio owner's real project story, process, outcomes, and credits.`,
    role: "Creative Direction",
    tools: "Add tools used on this project",
    clientName: "Add client or collaboration name",
    credits: "Add collaborators, production credits, or campaign context",
    published: true,
    status: "published",
    featured: index < 3,
    viewCount: 0,
    sortOrder: index,
  }),
);

export const DEFAULT_SITE_SETTINGS = {
  siteTitle: "Idayat Opeyemi",
  siteDescription:
    "AI Brand Storyteller and commercial video creator building story-first campaigns, edits, and AI-powered visuals.",
  introHeading: "Selected Works",
  introSubheading:
    "AI Brand Storyteller & Commercial Video Creator",
  navHomeLabel: "Home",
  navProjectsLabel: "Projects",
  navAboutLabel: "About",
  navContactLabel: "Contact",
  selectedProjectLabel: "Selected project",
  playVideoLabel: "Play video",
  ctaLabel: "See more",
  projectOverviewLabel: "Overview",
  projectBackHomeLabel: "Back to home",
  projectContactCtaLabel: "Contact",
  projectModalCloseLabel: "Close",
  projectModalBackLabel: "Back to carousel",
  noVideoLabel: "No video added yet",
  aboutTitle: "Profile",
  aboutBody: "AI Brand Storyteller & Commercial Video Creator",
  aboutPageTitle: "Idayat Opeyemi",
  aboutPageLead: "I turn brand ideas into stories people want to watch",
  aboutNotesTitle: "Philosophy",
  aboutNotesBody:
    "\"I'm interested in what makes people keep watching. Creative work built around the story, not the software. Technology changes constantly. Strong storytelling doesn't. That's why every project starts with the message, the audience and the feeling the work should leave behind.\"",
  availabilityLabel: "Availability",
  profileAvailability: "Available worldwide",
  servicesTitle: "Core offerings",
  serviceIdealForLabel: "Ideal for",
  serviceDeliverablesLabel: "Deliverables",
  serviceOneName: "AI-Powered Content",
  serviceOneDescription:
    "Story-first approach using AI as a production tool for scenes, motion, and atmosphere.",
  serviceOneIdealFor:
    "Product launches, ads, brand campaigns, social content, and creative experimentation.",
  serviceOneDeliverables:
    "Hero commercials, product visuals, campaign cutdowns, UGC concepts, and AI advertisements.",
  serviceOneCta: "Discuss an AI Content Project",
  serviceTwoName: "Video Editing",
  serviceTwoDescription:
    "Rhythm, continuity, and clarity focused on making the idea land fast and stay memorable.",
  serviceTwoIdealFor:
    "Short-form content, commercials, social advertising, campaign films, and long-to-short repurposing.",
  serviceTwoDeliverables:
    "Commercial edits, UGC editing, social cutdowns, versioning, and platform formats.",
  serviceTwoCta: "Discuss an Editing Project",
  serviceThreeName: "Brand Storytelling",
  serviceThreeDescription:
    "Creative direction before production, from audience insight and concept framing to sharper communication.",
  serviceThreeIdealFor:
    "Product stories, launch films, campaign narratives, awareness content, and creative concepts.",
  serviceThreeDeliverables:
    "Creative concepts, narrative direction, storyboards, messaging frameworks, and campaign treatments.",
  serviceThreeCta: "Discuss a Storytelling Project",
  skillsTitle: "Skills",
  skillsList:
    "Creative Direction\nAI Filmmaking\nVideo Editing\nStorytelling\nProduct Visuals\nSocial Campaigns",
  openToTitle: "Open to",
  openToList:
    "Commercial projects\nBrand campaigns\nProduct launches\nCreative collaborations\nRemote work",
  contactHeading: "Contact",
  contactPageTitle: "Let's talk about the next story.",
  contactPageLead:
    "Based in Nigeria and available worldwide for commercial projects, brand campaigns, product launches, and creative collaborations.",
  contactEmail: "hello@example.com",
  contactPhone: "+1 (000) 000-0000",
  whatsapp: "",
  location: "Nigeria",
  emailLabel: "Email",
  phoneLabel: "Phone",
  whatsappLabel: "WhatsApp",
  locationLabel: "Location",
  socialsLabel: "Socials",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  portfolioUrl: "http://localhost:3001",
  defaultLanguage: "English",
  timezone: "Africa/Lagos",
  bookingEnabled: false,
  bookingCta: "Book a call",
  bookingUrl: "",
  seoTitle: "Idayat Opeyemi",
  metaDescription:
    "AI Brand Storyteller and commercial video creator crafting story-first campaigns, edits, and AI-powered visuals.",
  trackingId: "",
};
