export type Project = {
  title: string;
  blurb: string;
  story?: string;
  stack: string[];
  year: string;
  links: { live?: string; source?: string };
  featured?: boolean;
  status?: string;
  image?: string;
  categories?: ("Frontend" | "Backend" | "Fullstack")[];
};

export type Job = {
  company: string;
  role: string;
  period: string;
  blurb: string;
  url?: string;
};

export type Post = {
  title: string;
  summary: string;
  date: string;
  url: string;
  readingTime?: string;
};

export type OpenSourceContribution = {
  title: string;
  repo: string;
  prNumber: number;
  url: string;
  status: "Merged";
  description: string;
  technologies: string[];
};

/*
 * Single source of truth for portfolio content.
 * Empty strings / empty arrays hide the related UI automatically.
 * Only add facts that can be verified (see MY_INFO.md section 15).
 */
export const site = {
  name: "Nitish Kumar Singh",
  firstName: "Nitish",
  initials: "NKS",
  url: "",
  role: "Full-Stack Developer · Backend Engineer · Clean Code Advocate",
  location: "Delhi, India",
  timezone: "Asia/Kolkata",

  // Leave empty until verified; the contact UI hides unset links.
  email: "nitishkumarsingh.cs@gmail.com",

  // Add image paths (e.g. "/images/profile2.webp") to enable the avatar switcher.
  profileImages: ["/images/profile.webp"] as string[],
  // Hero banner image (files live in public/images/).
  bannerImage: "/images/banner.webp",
  socialBannerImage: "/social-banner.png",

  headlines: [
    "Full-Stack Developer",
    "Backend Engineer",
    "Clean Code Advocate",
  ],

  about: {
    intro:
      "Hey, I'm Nitish — a second-year B.Tech CSE (AI & ML) student who loves turning ideas into practical, well-built products. I enjoy building, shipping and continuously improving software.",
    points: [
      {
        lead: "I build real products.",
        text: "I've built and shipped projects like StudyKarle and CampusBus, turning ideas into applications people can actually use.",
      },
      {
        lead: "I enjoy the full stack.",
        text: "From React and TypeScript to Node.js, Express and PostgreSQL, I love bringing different pieces together to build complete products.",
      },
      {
        lead: "I care about good engineering.",
        text: "Clean code, thoughtful design, solving problems and sweating the small details matter to me.",
      },
    ],
    outro: "Always learning, building and looking for interesting problems to solve.",
  },

  tldr: [
    "Building Products",
    "Stack: React · Node.js · PostgreSQL",
    "B.Tech CSE (AI & ML), RKGIT, Shipping consistently.",
    "Learning: System design · DSA · AI/ML",
  ],

  // Footer rotator: short personal statements.
  quotes: [
    {
      text: "Stay hungry. Stay foolish.",
      author: "Steve Jobs · Stanford Commencement, 2005",
    },
    {
      text: "The first principle is that you must not fool yourself—and you are the easiest person to fool.",
      author: "Richard Feynman · Caltech Commencement, 1974",
    },
    {
      text: "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil.",
      author: "Donald Knuth · Structured Programming with go to Statements, 1974",
    },
    {
      text: "Talk is cheap. Show me the code.",
      author: "Linus Torvalds · Linux kernel mailing list, 2000",
    },
    {
      text: "Imagination is more important than knowledge.",
      author: "Albert Einstein · Saturday Evening Post interview, 1929",
    },
  ],

  socials: {
    github: "https://github.com/nitishdotdev",
    linkedin: "https://www.linkedin.com/in/nitishdotdev/",
    instagram: "https://www.instagram.com/nitishdotdev/",
    twitter: "", // add exact profile URL if active
    resume: "https://nitishdotdev.vercel.app", // per update request: links to the live portfolio
    medium: "", // no publishing platform confirmed yet
  },

  // Independent work (no formal employment confirmed in MY_INFO.md).
  experienceTitle: "Independent Projects",
  experience: [
    {
      company: "Independent",
      role: "Developer & Product Builder",
      period: "",
      blurb:
        "Building and iterating on web products, including an education resource platform and a campus transportation platform. Working across frontend interfaces, backend APIs, authentication, PostgreSQL data models, deployment, and production debugging.",
    },
  ] as Job[],

  // Campus roles and team work, shown below the independent projects.
  collaboration: [
    {
      company: "RKGIT",
      role: "Class CR / Assignment Coordinator",
      period: "",
      blurb: "Served as class representative and assignment coordinator.",
    },
    {
      company: "Binary Hacks 4.0 · RKGIT",
      role: "Team Leader",
      period: "22–24 Sep 2026",
      blurb:
        "Led a team to develop ArthaSetu, a concept exploring micro-investment access for gig workers.",
      url: "https://github.com/goyaldaksh284-crypto/ArthaSetu",
    },
  ] as Job[],

  projects: [
    {
      title: "StudyKarle",
      blurb:
        "An education resource platform for engineering students. It organizes notes, previous-year questions, solutions, assignments, and tutorials into a fast, mobile-friendly discovery experience.",
      story:
        "The problem: study material for engineering courses is scattered across chat groups, drives, and personal folders. StudyKarle follows the academic structure students already use (year, semester, subject, unit, and files), so resources can be found where they belong in a course.\n\nThe stack: a React and Vite frontend, a Node.js and Express API, and PostgreSQL hosted on Neon, queried with Knex.js. The frontend is deployed on Vercel and the backend on Render. It includes admin workflows for uploading and managing resources, authentication with account linking, and search across the resource hierarchy.\n\nStatus: launched and in ongoing development.",
      stack: ["React", "Vite", "Node.js", "Express.js", "PostgreSQL", "Neon", "Knex.js", "Vercel", "Render"],
      year: "",
      links: {
        live: "https://studykarle.me",
        source: "https://github.com/nitishdotdev/StudyKarle",
      },
      featured: true,
      categories: ["Fullstack", "Backend"],
      image: "/project-images/studykarle.webp",
    },
    {
      title: "CampusBus",
      blurb:
        "A multi-college transport platform concept for bus tracking and route administration, designed around student, driver, and admin workflows.",
      story:
        "The problem: students wait at stops without knowing where their bus is, and colleges manage routes, vehicles, and drivers with little tooling. CampusBus is designed to serve multiple colleges from one platform instead of a single-campus demo.\n\nRoles: Student, Driver, and Admin. Admins create campuses, buses, routes, stops, drivers, and students and assign drivers. Driver accounts are managed by administrators, not public self-signup.\n\nDesigned for, and still in progress: driver location sharing, bus positions updated about every five seconds, map-based route views, alerts, and low-connectivity handling. These are planned or partially built and are not yet described as production features.\n\nStack: a Node.js API with PostgreSQL on Neon, deployed on Render, with a Vercel frontend. Work so far has focused on API integration, production configuration, and testing.",
      stack: ["Node.js", "PostgreSQL", "Neon", "Render", "Vercel"],
      year: "",
      links: {
        source: "https://github.com/nitishdotdev/CampusBus",
      },
      status: "In Development",
      featured: false,
      categories: ["Fullstack", "Backend"],
      image: "/project-images/campusbus.webp",
    },
    {
      title: "StudyCanvas",
      blurb:
        "An earlier digital note-writing web app built around a bagless student experience. It was the first step toward StudyKarle.",
      story:
        "This was an early product experiment in digital note-taking. Bringing study material into one focused digital place shaped the later move toward StudyKarle's academic resource platform.",
      stack: [],
      year: "",
      links: {
        live: "https://studycanvas.me",
      },
      status: "Earlier Project",
      featured: false,
      categories: ["Frontend"],
      image: "/project-images/studycanvas.webp",
    },
  ] as Project[],

  // Grouped skills shown in the Tech Stack section. Only defensible skills.
  skillGroups: {
    Languages: ["JavaScript", "TypeScript", "Java", "C", "C++", "Python", "DSA", "AI/ML"],
    Frontend: ["React", "HTML", "CSS", "Tailwind CSS", "Bootstrap"],
    Backend: ["Node.js", "Express.js", "REST APIs", "Authentication & Authorization", "Role-Based Access Control", "System Design"],
    Databases: ["PostgreSQL", "Neon", "Knex.js"],
    "DevOps & Tools": ["Git", "GitHub", "Vercel", "Render", "Postman", "Production Reliability"],
  } as Record<string, string[]>,

  // Add posts as { title, summary, date, url, readingTime }.
  writing: [] as Post[],

  // Add verified PRs as they are merged (see MY_INFO.md section 7).
  openSourceContributions: [] as OpenSourceContribution[],

  github: {
    username: "nitishdotdev",
  },

  footerNote: "Built with care, one feature at a time.",
} as const;

export type Site = typeof site;
