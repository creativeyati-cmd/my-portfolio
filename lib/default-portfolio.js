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
    categoryId: null,
    sortOrder: index,
  }),
);

export const DEFAULT_SERVICE_CATEGORIES = [
  {
    name: "AI-Powered Production",
    description: "Story-first AI production for commercial campaigns and product launches.",
    color: "#1197a0",
    icon: "spark",
    displayOrder: 1,
    status: "active",
    services: [
      {
        name: "AI Content Creation",
        description: "Story-first approach using AI as production tool",
        idealFor: "Product launches, Ads, Brand campaigns, Social content",
        deliverables:
          "Hero commercials, Product visuals, Campaign cutdowns, UGC concepts, AI advertisements",
        cta: "Discuss an AI Content Project",
        displayOrder: 1,
        status: "active",
      },
      {
        name: "Product Visuals",
        description: "AI-generated product shots and commercial worlds",
        idealFor: "E-commerce, Launch visuals, Product ads",
        deliverables: "Hero shots, 3D renders, Lifestyle visuals",
        cta: "Get Product Visuals",
        displayOrder: 2,
        status: "active",
      },
    ],
  },
  {
    name: "Video Post-Production",
    description: "Editing, versioning, and platform-ready post-production systems.",
    color: "#e4972f",
    icon: "timeline",
    displayOrder: 2,
    status: "active",
    services: [
      {
        name: "Video Editing",
        description: "Rhythm, continuity, clarity. Idea lands fast, stays memorable.",
        idealFor: "Short-form content, Commercials, Social advertising, Campaign films",
        deliverables:
          "Commercial edits, UGC editing, Social cutdowns, Platform formats",
        cta: "Discuss an Editing Project",
        displayOrder: 1,
        status: "active",
      },
      {
        name: "Repurposing & Versioning",
        description: "Transform long-form content into platform-optimized cuts",
        idealFor: "Long-to-short repurposing, Multi-platform campaigns",
        deliverables: "TikTok/Reels cuts, YouTube Shorts, Instagram versions",
        cta: "Discuss Repurposing",
        displayOrder: 2,
        status: "active",
      },
    ],
  },
  {
    name: "Creative Strategy",
    description: "Concept framing, campaign narratives, and message-led creative direction.",
    color: "#4c5873",
    icon: "idea",
    displayOrder: 3,
    status: "active",
    services: [
      {
        name: "Brand Storytelling",
        description:
          "Creative direction before production. Audience insight to concept framing.",
        idealFor:
          "Product stories, Launch films, Campaign narratives, Awareness content",
        deliverables:
          "Creative concepts, Narrative direction, Storyboards, Messaging frameworks",
        cta: "Discuss a Storytelling Project",
        displayOrder: 1,
        status: "active",
      },
      {
        name: "Campaign Concepts",
        description: "Full campaign ideation from message to visual direction",
        idealFor: "Brand campaigns, Creative collaborations, Awareness campaigns",
        deliverables: "Campaign treatments, Mood boards, Visual frameworks",
        cta: "Discuss Campaign Concepts",
        displayOrder: 2,
        status: "active",
      },
    ],
  },
];

export const DEFAULT_SITE_SETTINGS = {
  siteTitle: "Idayat Opeyemi",
  siteDescription:
    "AI Brand Storyteller and commercial video creator building story-first campaigns, edits, and AI-powered visuals.",
  introHeading: "Selected Works",
  introSubheading:
    "AI Brand Storyteller & Commercial Video Creator",
  navHomeLabel: "Home",
  navServicesLabel: "Services",
  navProjectsLabel: "Projects",
  navAboutLabel: "About",
  navContactLabel: "Contact",
  navContactCtaLabel: "Contact",
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
  portfolioUrl: "https://aivideocreator.cv/",
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
