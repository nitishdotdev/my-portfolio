import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const outDir = resolve(process.argv[2] ?? "dist");
const serverDir = await mkdtemp(resolve(".prerender-"));

try {
  await build({
    build: {
      ssr: "src/prerender.tsx",
      outDir: serverDir,
      copyPublicDir: false,
    },
  });

  const { DEPLOYMENT_INDEXABLE, ROUTE_SEO, renderRoute } = await import(
    pathToFileURL(join(serverDir, "prerender.js")).href
  );
  const template = await readFile(join(outDir, "index.html"), "utf8");
  if (!template.includes("<!--page-head-->") || !template.includes('<div id="root"></div>')) {
    throw new Error("The Vite HTML template is missing its prerendering placeholders.");
  }

  for (const path of Object.keys(ROUTE_SEO)) {
    const { head, body } = renderRoute(path);
    const html = template
      .replace("<!--page-head-->", () => head)
      .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
    const filename = path === "/" ? "index.html" : `${path.slice(1)}.html`;
    await writeFile(join(outDir, filename), html);
  }

  if (!DEPLOYMENT_INDEXABLE) {
    await writeFile(join(outDir, "robots.txt"), "User-agent: *\nDisallow: /\n");
    await rm(join(outDir, "sitemap.xml"), { force: true });
  }
} finally {
  await rm(serverDir, { recursive: true, force: true });
}
