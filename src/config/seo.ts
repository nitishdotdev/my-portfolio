import { site } from "@/config/site";

/** Canonical production base. Source of truth: site.url. */
export const SITE_URL = site.url;

/** Injected by vite.config.ts. False on Vercel previews and other non-production deployments. */
declare const __SEO_INDEXABLE__: boolean;
export const DEPLOYMENT_INDEXABLE: boolean = __SEO_INDEXABLE__;

export const SOCIAL_IMAGE_URL = `${SITE_URL}${site.socialBannerImage}`;

export type RouteSeo = {
  title: string;
  description: string;
  indexable: boolean;
};

/** Indexable routes and their metadata. Keep descriptions consistent with visible page content. */
export const ROUTE_SEO: Record<string, RouteSeo> = {
  "/": {
    title: "Nitish Kumar Singh | Full-Stack Developer",
    description:
      "Nitish Kumar Singh (nitishdotdev) is a full-stack developer in Delhi building web products with React, TypeScript, Node.js, and PostgreSQL.",
    indexable: true,
  },
  "/projects": {
    title: "Projects | Nitish Kumar Singh (nitishdotdev)",
    description:
      "Explore StudyKarle, an education resource platform, CampusBus, a campus transport project, and StudyCanvas, a digital note-taking app.",
    indexable: true,
  },
  "/experience": {
    title: "Experience | Nitish Kumar Singh (nitishdotdev)",
    description:
      "Explore Nitish Kumar Singh’s independent product work across React interfaces, Node.js APIs, authentication, PostgreSQL data models, and deployment.",
    indexable: true,
  },
  "/contact": {
    title: "Contact | Nitish Kumar Singh (nitishdotdev)",
    description:
      "Contact Nitish Kumar Singh, a full-stack developer in Delhi, India. Get in touch by email or find him on GitHub and LinkedIn.",
    indexable: true,
  },
  "/writing": {
    title: "Writing | Nitish Kumar Singh (nitishdotdev)",
    description: "Writing and thoughts from Nitish Kumar Singh on software architecture, system design, and engineering lessons. Published articles will appear here.",
    // Currently an empty "No articles yet" page. Switch to true once real posts exist.
    indexable: false,
  },
};

export const NOT_FOUND_SEO: RouteSeo = {
  title: "Page not found | Nitish Kumar Singh (nitishdotdev)",
  description: "This page does not exist on nitishdotdev.",
  indexable: false,
};

export function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function canonicalFor(pathname: string): string {
  const path = normalizePath(pathname);
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export const JSON_LD_ID = "route-structured-data";

export function getRouteMetadata(pathname: string) {
  const path = normalizePath(pathname);
  const known = Object.prototype.hasOwnProperty.call(ROUTE_SEO, path);
  const route = known ? ROUTE_SEO[path] : NOT_FOUND_SEO;
  const canonical = known ? canonicalFor(path) : undefined;
  const robots = !DEPLOYMENT_INDEXABLE
    ? "noindex, nofollow"
    : route.indexable ? "index, follow, max-image-preview:large" : "noindex, follow";

  const imageAlt = `${site.name} (nitishdotdev), Full Stack Developer and Product Builder`;
  const meta = {
    name: {
      author: site.name,
      description: route.description,
      robots,
      "twitter:card": "summary_large_image",
      "twitter:title": route.title,
      "twitter:description": route.description,
      "twitter:image": SOCIAL_IMAGE_URL,
      "twitter:image:alt": imageAlt,
    },
    property: {
      "og:type": "website",
      "og:site_name": `${site.name} (nitishdotdev)`,
      "og:locale": "en_IN",
      "og:title": route.title,
      "og:description": route.description,
      "og:url": canonical,
      "og:image": SOCIAL_IMAGE_URL,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": `${imageAlt}, featuring StudyKarle and CampusBus`,
    },
  };

  return { title: route.title, canonical, meta };
}
