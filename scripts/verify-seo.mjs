import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const REMOVED_CONTENT = ["ArthaSetu", "Binary Hacks", "Class CR", "Campus & Collaboration"];
const ROUTES = {
  "/": {
    heading: "Nitish Kumar Singh",
    pageType: "ProfilePage",
    body: ["Full-Stack Developer", "About", "Developer Snapshot", "Tech Stack", "PostgreSQL", "StudyKarle", "Independent Projects"],
  },
  "/projects": {
    heading: "Projects",
    pageType: "CollectionPage",
    body: ["StudyKarle", "CampusBus", "StudyCanvas", "An education resource platform", "A multi-college transport platform", "https://studykarle.me", "https://github.com/nitishdotdev/StudyKarle", "https://github.com/nitishdotdev/CampusBus", "https://studycanvas.me"],
  },
  "/experience": {
    heading: "Independent Projects",
    pageType: "WebPage",
    body: ["Developer &amp; Product Builder", "Building and iterating on web products"],
  },
  "/contact": {
    heading: "Contact",
    pageType: "ContactPage",
    body: ["mailto:", "https://github.com/nitishdotdev", "https://www.linkedin.com/in/nitishdotdev/", "Resume"],
  },
  "/writing": {
    heading: "Writing &amp; Thoughts",
    pageType: "WebPage",
    body: ["No articles yet"],
  },
};

function groupRobots(txt) {
  const groups = new Map();
  let agents = [];
  let sawRule = false;

  for (const raw of txt.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      if (sawRule) agents = [];
      const agent = value.toLowerCase();
      agents.push(agent);
      if (!groups.has(agent)) groups.set(agent, []);
      sawRule = false;
    } else if (key === "allow" || key === "disallow") {
      for (const agent of agents) groups.get(agent).push(`${key}: ${value}`);
      sawRule = true;
    }
  }
  return groups;
}

export function routeFile(path) {
  return path === "/" ? "index.html" : `${path.slice(1)}.html`;
}

function visibleTextLength(value = "") {
  return [...value.replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, "x").trim()].length;
}

function verifyRoute({ path, html, siteUrl, preview, site, titles, descriptions, ok }) {
  const { heading, pageType, body: expectedBody } = ROUTES[path];
  const url = siteUrl + path;
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const body = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  const check = (cond, message) => ok(cond, `${path}: ${message}`);
  const canonicals = [...head.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  const title = head.match(/<title>([^<]+)<\/title>/)?.[1];
  const meta = (key, attribute = "name") => {
    const values = [...head.matchAll(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`, "g"))];
    check(values.length === 1 && values[0][1], `expected exactly one populated ${key} meta tag`);
    return values[0]?.[1];
  };
  const desc = meta("description");
  const titleLength = visibleTextLength(title);
  const descriptionLength = visibleTextLength(desc);
  check(titleLength >= 10 && titleLength <= 60, "title must be 10–60 characters");
  check(descriptionLength >= 120 && descriptionLength <= 160, "description must be 120–160 characters");
  check(!titles.has(title), "duplicate title");
  check(!descriptions.has(desc), "duplicate description");
  titles.add(title);
  descriptions.add(desc);
  check(canonicals.length === 1, "expected exactly one canonical link");
  check(canonicals[0]?.[1] === url, `canonical must be ${url}`);
  check(!/name="keywords"/.test(head), "obsolete meta keywords tag must not be present");
  const robots = meta("robots");
  const indexable = !preview && path !== "/writing";
  const expectedRobots = preview ? "noindex, nofollow" : indexable ? "index, follow, max-image-preview:large" : "noindex, follow";
  check(robots === expectedRobots, indexable ? "route must be indexable in this build" : `robots must be ${expectedRobots}`);
  for (const [key, value] of Object.entries({
    "og:type": "website",
    "og:title": title,
    "og:description": desc,
    "og:url": url,
    "og:image": `${siteUrl}/social-banner.png`,
    "og:image:width": "1200",
    "og:image:height": "630",
  })) {
    check(meta(key, "property") === value, `${key} must match ${value}`);
  }
  check(meta("og:image:alt", "property")?.length >= 20, "og:image needs descriptive alt text");
  check(meta("twitter:image:alt")?.length >= 20, "twitter:image needs descriptive alt text");
  for (const [key, value] of Object.entries({
    "twitter:title": title,
    "twitter:description": desc,
    "twitter:image": `${siteUrl}/social-banner.png`,
    "twitter:card": "summary_large_image",
  })) {
    check(meta(key) === value, `${key} must match ${value}`);
  }

  const headings = [...body.matchAll(/<h1\b[^>]*>([^<]+)<\/h1>/g)];
  check((html.match(/<h1\b/g) ?? []).length === 1 && headings[0]?.[1] === heading, `expected exactly one H1, "${heading}"`);
  for (const [tag] of body.matchAll(/<img\b[^>]*>/g)) {
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1];
    const alt = tag.match(/\salt="([^"]*)"/)?.[1];
    check(alt !== undefined, `image ${src ?? "(unknown source)"} is missing its alt attribute`);
    if (src === "/images/banner.webp") check(alt?.trim(), "homepage banner needs descriptive alt text");
  }
  for (const phrase of expectedBody) check(body.includes(phrase), `initial main content missing "${phrase}"`);
  check(!/localhost|127\.0\.0\.1|-git-|\.vercel\.app/.test(head.replaceAll(new URL(siteUrl).hostname, "")), "non-production host in metadata");

  const ld = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  check(ld.length === 1, "expected one JSON-LD script");
  let graph;
  try {
    const data = JSON.parse(ld[0]?.[1] ?? "null");
    check(data?.["@context"] === "https://schema.org", "expected Schema.org context");
    graph = data?.["@graph"];
  } catch (error) {
    check(false, `JSON-LD does not parse: ${error.message}`);
  }
  check(Array.isArray(graph) && graph.length > 0, "missing JSON-LD graph");
  if (!Array.isArray(graph)) return;

  const nodes = (type) => graph.filter((node) => node["@type"] === type);
  const ids = graph.map((node) => node["@id"]);
  check(ids.every(Boolean) && new Set(ids).size === graph.length, "missing or duplicate @id values");
  for (const [, ref] of JSON.stringify(graph).matchAll(/"@id":"([^"]+)"/g)) {
    check(ids.includes(ref), `unresolved @id reference: ${ref}`);
  }

  const personId = `${siteUrl}/#person`;
  const siteId = `${siteUrl}/#website`;
  const [person] = nodes("Person");
  const [website] = nodes("WebSite");
  check(nodes("Person").length === 1 && person?.["@id"] === personId && person.name === "Nitish Kumar Singh" && person.alternateName === "nitishdotdev", "expected stable Person identity");
  check(nodes("WebSite").length === 1 && website?.["@id"] === siteId && website.creator?.["@id"] === personId, "expected stable WebSite identity and creator");
  for (const profile of ["https://github.com/nitishdotdev", "https://www.linkedin.com/in/nitishdotdev/"]) {
    check(person?.sameAs?.includes(profile), `Person.sameAs missing ${profile}`);
  }

  const pages = graph.filter((node) => ["ProfilePage", "CollectionPage", "ContactPage", "WebPage"].includes(node["@type"]));
  const [page] = pages;
  check(pages.length === 1 && page?.["@type"] === pageType && page.url === url && page.isPartOf?.["@id"] === siteId, `expected one ${pageType} at its canonical URL`);
  if (path === "/") check(page?.mainEntity?.["@id"] === personId, "ProfilePage.mainEntity must reference the Person");

  const projects = nodes("SoftwareApplication");
  const sources = nodes("SoftwareSourceCode");
  if (path !== "/" && path !== "/projects") {
    check(projects.length === 0 && sources.length === 0, "project entities belong on routes displaying project cards");
    return;
  }
  for (const name of ["StudyKarle", "CampusBus", "StudyCanvas"]) {
    check(projects.some((item) => item.name === name), `structured data missing project ${name}`);
  }
  for (const project of projects) {
    check(project.creator?.["@id"] === personId, `${project.name} must reference the Person as creator`);
    check(!("codeRepository" in project), `${project.name}: codeRepository is not a SoftwareApplication property`);
    check(body.includes(project.name), `project ${project.name} is missing from visible content`);
    if (project.url) check(site.includes(`live: "${project.url}"`) && body.includes(project.url), `live URL for ${project.name} must match site.ts and visible content`);
  }
  check(sources.length === 2, "StudyKarle and CampusBus must each have a source entity");
  for (const source of sources) {
    const project = projects.find((item) => item["@id"] === source.targetProduct?.["@id"]);
    check(project?.hasPart?.["@id"] === source["@id"] && source.name === `${project?.name} source code`, `incorrect project relationship for ${source.name}`);
    check(source.creator?.["@id"] === personId, `${source.name} must reference the Person as creator`);
    check(site.includes(`source: "${source.codeRepository}"`) && body.includes(source.codeRepository), `source repository for ${source.name} must match site.ts and visible content`);
  }
  if (path === "/projects") {
    const [list] = nodes("ItemList");
    check(list?.["@id"] === page?.mainEntity?.["@id"] && list?.itemListElement?.length === projects.length, "collection must link to the project list");
  }
}

export function runSeoChecks({ repoRoot = process.cwd(), artifact = "source", distDir = "dist" } = {}) {
  const failures = [];
  const ok = (condition, message) => { if (!condition) failures.push(message); };
  const dir = artifact === "source" ? join(repoRoot, "public") : join(repoRoot, distDir);
  const preview = artifact === "preview";
  const read = (path) => {
    if (existsSync(path)) return readFileSync(path, "utf8");
    failures.push(`required file is missing: ${path}`);
    return "";
  };
  const site = read(join(repoRoot, "src/config/site.ts"));
  const seo = read(join(repoRoot, "src/config/seo.ts"));
  const siteUrl = site.match(/url:\s*"([^"]+)"/)?.[1];
  const expectedSite = "https://nitishdotdev.vercel.app";
  ok(siteUrl === expectedSite, `site.url must be ${expectedSite}`);
  const routes = Object.keys(ROUTES);
  const routeEntries = [...seo.matchAll(/"(\/[a-z]*)": \{[\s\S]*?indexable: (true|false)/g)];
  ok(JSON.stringify(routeEntries.map(([, path]) => path).sort()) === JSON.stringify([...routes].sort()), "SEO route configuration drift");
  const indexable = routeEntries.filter(([, , value]) => value === "true").map(([, path]) => path);
  ok(indexable.includes("/") && indexable.length === 4 && !indexable.includes("/writing"), "only the four core routes should be indexable");

  let vercel = {};
  try {
    vercel = JSON.parse(read(join(repoRoot, "vercel.json")));
  } catch {
    failures.push("vercel.json is not valid JSON");
  }
  const rewrites = vercel.rewrites ?? [];
  ok(rewrites.length === routes.length && routes.every((path) => rewrites.some(({ source, destination }) => source === path && destination === `/${routeFile(path)}`)), "Vercel rewrites must list exactly the routes and map each to its HTML file");
  const writingHeader = (vercel.headers ?? []).find(({ source }) => source === "/writing");
  ok(writingHeader?.headers?.some(({ key, value }) => key === "X-Robots-Tag" && value === "noindex, follow"), "/writing must send X-Robots-Tag: noindex, follow");

  const checkedFiles = [
    ["site.ts", site],
    ["llms.txt", read(join(dir, "llms.txt"))],
    ["404.html", read(join(dir, "404.html"))],
  ];
  const [, llms] = checkedFiles[1];
  const [, notFound] = checkedFiles[2];
  ok(/<meta name="robots" content="noindex/.test(notFound), "404.html must be noindex");
  ok(!/rel="canonical"/.test(notFound), "404.html must not declare a canonical URL");
  ok(llms.startsWith("# Nitish Kumar Singh"), "llms.txt must start with the portfolio name");
  for (const path of indexable) ok(llms.includes(`${siteUrl}${path}`), `llms.txt missing ${path}`);
  for (const title of ["StudyKarle", "CampusBus", "StudyCanvas"]) ok(llms.includes(title), `llms.txt missing project ${title}`);
  ok(llms.includes("https://github.com/nitishdotdev") && llms.includes("https://www.linkedin.com/in/nitishdotdev/"), "llms.txt must list verified profiles");
  ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(llms), "llms.txt must not include email addresses");
  ok(!llms.includes("/writing"), "llms.txt must not list the noindex Writing page");

  const robots = read(join(dir, "robots.txt"));
  const groups = groupRobots(robots);
  const rules = (crawler) => [...new Set(groups.get(crawler.toLowerCase()))].sort().join(", ");
  if (preview) {
    ok(!existsSync(join(dir, "sitemap.xml")), "preview must not publish a sitemap");
    ok(groups.size === 1 && rules("*") === "disallow: /" && !/sitemap:/i.test(robots), "preview robots.txt must block all crawlers and omit the sitemap directive");
  } else {
    ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), "robots.txt must reference the canonical sitemap");
    ok(rules("*") === "allow: /", "robots.txt wildcard group must allow public crawling");
    for (const crawler of ["GPTBot", "ClaudeBot", "Applebot-Extended"]) {
      ok(rules(crawler) === "disallow: /", `${crawler} must be disallowed`);
    }
    for (const crawler of ["Googlebot", "Bingbot", "Google-Extended", "OAI-SearchBot", "Claude-SearchBot", "Claude-User", "ChatGPT-User", "PerplexityBot", "Perplexity-User"]) {
      ok(rules(crawler) === "allow: /", `${crawler} must be allowed`);
    }

    const sitemapPath = join(dir, "sitemap.xml");
    const sitemap = read(sitemapPath);
    checkedFiles.push(["sitemap.xml", sitemap]);
    try {
      const locations = execFileSync("python3", ["-c", `
import json, sys, xml.etree.ElementTree as ET
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
root = ET.parse(sys.argv[1]).getroot()
assert root.tag == '{' + ns['s'] + '}urlset'
print(json.dumps([el.text for el in root.findall('s:url/s:loc', ns)]))
`, sitemapPath], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      const actual = JSON.parse(locations).sort();
      const expected = indexable.map((path) => `${siteUrl}${path}`).sort();
      ok(JSON.stringify(actual) === JSON.stringify(expected), `sitemap URLs must match the indexable routes (found ${actual.join(", ")})`);
    } catch (error) {
      failures.push(error.code === "ENOENT" ? "Python 3 is required for sitemap verification" : "sitemap.xml is not well-formed sitemap XML");
    }
    ok(!/<lastmod>/.test(sitemap), "do not add artificial lastmod timestamps");
  }

  const banner = join(dir, "social-banner.png");
  const png = existsSync(banner) ? readFileSync(banner) : Buffer.alloc(0);
  ok(png.length >= 24 && png.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" && png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630, "social-banner.png must be a 1200x630 PNG");

  if (artifact === "source") {
    const template = read(join(repoRoot, "index.html"));
    ok(template.includes("<!--page-head-->") && template.includes('<div id="root"></div>'), "index.html must provide the prerender placeholders");
    ok(!/<title>|rel="canonical"|application\/ld\+json/.test(template), "index.html must delegate route metadata to the renderer");
    checkedFiles.push(["index.html", template], ["seo.ts", seo]);
  } else {
    const titles = new Set();
    const descriptions = new Set();
    for (const path of routes) {
      const file = routeFile(path);
      const html = read(join(dir, file));
      checkedFiles.push([file, html]);
      verifyRoute({ path, html, siteUrl: expectedSite, preview, site, titles, descriptions, ok });
    }
  }

  for (const term of REMOVED_CONTENT) {
    for (const [name, content] of checkedFiles) ok(!content.includes(term), `removed content "${term}" found in ${name}`);
  }
  return failures;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const artifact = process.argv.includes("--preview") ? "preview" : process.argv.includes("--dist") ? "dist" : "source";
  const failures = runSeoChecks({ artifact });
  if (failures.length) {
    console.error(`SEO checks failed [${artifact}]\n${failures.map((failure) => ` - ${failure}`).join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`SEO checks passed [${artifact}].`);
  }
}
