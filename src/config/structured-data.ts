import { canonicalFor, getRouteMetadata } from "@/config/seo";
import { site } from "@/config/site";

const home = canonicalFor("/");
const personId = `${home}#person`;
const websiteId = `${home}#website`;
const reference = (id: string) => ({ "@id": id });
const personRef = reference(personId);

export function getStructuredData(path: string) {
  const { canonical, title, meta } = getRouteMetadata(path);
  if (!canonical) return null;

  const person = {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    alternateName: site.github.username,
    url: home,
    image: new URL(site.profileImages[0], home).href,
    description: getRouteMetadata("/").meta.name.description,
    jobTitle: site.headlines.slice(0, 2),
    knowsAbout: Object.values(site.skillGroups).flat(),
    address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
    sameAs: [site.socials.github, site.socials.linkedin],
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: home,
    name: `${site.name} (${site.github.username})`,
    alternateName: [site.name, site.github.username],
    inLanguage: "en",
    creator: personRef,
    publisher: personRef,
  };

  const projectIds: string[] = [];
  const projectGraph = path === "/" || path === "/projects" ? site.projects.flatMap((project) => {
    const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = `${home}#project-${slug}`;
    const sourceId = `${home}#source-${slug}`;
    projectIds.push(id);

    const application = {
      "@type": "SoftwareApplication",
      "@id": id,
      name: project.title,
      url: project.links.live,
      description: project.blurb,
      operatingSystem: "Web browser",
      image: project.image && new URL(project.image, home).href,
      keywords: project.stack.length ? project.stack.join(", ") : undefined,
      creator: personRef,
      hasPart: project.links.source ? reference(sourceId) : undefined,
    };

    if (!project.links.source) return [application];
    return [application, {
      "@type": "SoftwareSourceCode",
      "@id": sourceId,
      name: `${project.title} source code`,
      codeRepository: project.links.source,
      creator: personRef,
      targetProduct: reference(id),
    }];
  }) : [];

  const list = {
    "@type": "ItemList",
    "@id": `${canonical}#project-list`,
    itemListElement: projectIds.map((id, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: reference(id),
    })),
  };

  const page = {
    "@type": path === "/" ? "ProfilePage" : path === "/projects" ? "CollectionPage" : path === "/contact" ? "ContactPage" : "WebPage",
    "@id": `${canonical}#${path === "/" ? "profilepage" : "webpage"}`,
    url: canonical,
    name: title,
    description: meta.name.description,
    inLanguage: "en",
    isPartOf: reference(websiteId),
    about: personRef,
    mainEntity: path === "/" ? personRef : path === "/projects" ? reference(list["@id"]) : undefined,
    mentions: path === "/" ? projectIds.map(reference) : undefined,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [person, website, page, ...projectGraph, ...(path === "/projects" ? [list] : [])],
  };
}
