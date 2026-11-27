// Negative tests for scripts/verify-seo.mjs. Run: npm test
// Each case copies the SEO inputs into a temp repo, breaks one requirement, and
// asserts that the checker reports it. Requires Python 3 for the sitemap XML check.
import { after, before, test } from "node:test";
import { execFileSync } from "node:child_process";
import { preview } from "vite";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runSeoChecks } from "./verify-seo.mjs";

const repo = process.cwd();
const inputs = ["src/config/site.ts", "src/config/seo.ts", "index.html", "vercel.json", "public"];

const builds = mkdtempSync(join(tmpdir(), "seo-builds-"));

before(() => {
  for (const env of ["production", "preview"]) {
    const outDir = join(builds, env);
    const options = { env: { ...process.env, VERCEL_ENV: env }, stdio: "pipe" };
    execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--outDir", outDir], options);
    execFileSync(process.execPath, ["scripts/prerender.mjs", outDir], options);
  }
});

after(() => rmSync(builds, { recursive: true, force: true }));

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "seo-"));
  for (const p of inputs) cpSync(join(repo, p), join(dir, p), { recursive: true });
  return dir;
}

function mutate(dir, rel, fn) {
  const p = join(dir, rel);
  writeFileSync(p, fn(readFileSync(p, "utf8")));
}

function failuresWith(mutator, artifact = "source") {
  const dir = fixture();
  try {
    if (artifact !== "source") {
      cpSync(join(builds, artifact === "preview" ? "preview" : "production"), join(dir, "dist"), { recursive: true });
    }
    mutator?.(dir);
    return runSeoChecks({ repoRoot: dir, artifact });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("baseline source inputs pass", () => {
  assert.deepEqual(failuresWith(), []);
});

test("baseline built output passes", () => {
  assert.deepEqual(failuresWith(null, "dist"), []);
});

test("wrong canonical host fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "dist/index.html", (s) => s.replace('href="https://nitishdotdev.vercel.app/"', 'href="http://localhost:3000/"')),
    "dist",
  );
  assert.ok(f.some((m) => m.includes("canonical")), f.join("\n"));
});

test("obsolete keywords tag fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "dist/index.html", (s) => s.replace("<title>", '<meta name="keywords" content="x" />\n    <title>')),
    "dist",
  );
  assert.ok(f.some((m) => m.includes("keywords")));
});

test("duplicate canonical fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "dist/index.html", (s) => s.replace("<title>", '<link rel="canonical" href="https://nitishdotdev.vercel.app/" />\n    <title>')),
    "dist",
  );
  assert.ok(f.some((m) => m.includes("exactly one canonical")));
});

test("relative social image URL fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "dist/index.html", (s) => s.replace('property="og:image" content="https://nitishdotdev.vercel.app/social-banner.png"', 'property="og:image" content="/social-banner.png"')),
    "dist",
  );
  assert.ok(f.some((m) => m.includes("og:image")));
});

test("broken JSON-LD fails", () => {
  const f = failuresWith((d) => mutate(d, "dist/index.html", (s) => s.replace('"@type":"Person",', '"@type":"Person" "x":,')), "dist");
  assert.ok(f.some((m) => m.includes("JSON-LD does not parse")));
});

test("unresolved @id reference fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "dist/index.html", (s) => s.replace('"mainEntity":{"@id":"https://nitishdotdev.vercel.app/#person"}', '"mainEntity":{"@id":"https://nitishdotdev.vercel.app/#missing"}')),
    "dist",
  );
  assert.ok(f.some((m) => m.includes("unresolved @id")));
});

test("codeRepository on SoftwareApplication fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "dist/index.html", (s) => s.replace('"name":"StudyKarle",', '"name":"StudyKarle","codeRepository":"https://github.com/nitishdotdev/StudyKarle",')),
    "dist",
  );
  assert.ok(f.some((m) => m.includes("codeRepository is not a SoftwareApplication property")), f.join("\n"));
});

test("sitemap containing the noindex Writing page fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "public/sitemap.xml", (s) => s.replace("</urlset>", "  <url><loc>https://nitishdotdev.vercel.app/writing</loc></url>\n</urlset>")),
  );
  assert.ok(f.some((m) => m.includes("/writing")));
});

test("malformed sitemap XML fails", () => {
  const f = failuresWith((d) => mutate(d, "public/sitemap.xml", (s) => s.replace("</urlset>", "")));
  assert.ok(f.some((m) => m.includes("not well-formed")));
});

test("robots.txt blocking the whole site fails", () => {
  const f = failuresWith((d) => mutate(d, "public/robots.txt", (s) => s.replace("User-agent: *\nAllow: /", "User-agent: *\nDisallow: /")));
  assert.ok(f.some((m) => m.includes("wildcard group must allow")));
});

test("GPTBot left allowed fails", () => {
  const f = failuresWith((d) => mutate(d, "public/robots.txt", (s) => s.replace("User-agent: GPTBot\nDisallow: /", "User-agent: GPTBot\nAllow: /")));
  assert.ok(f.some((m) => m.includes("GPTBot")));
});

test("OAI-SearchBot blocked fails", () => {
  const f = failuresWith((d) => mutate(d, "public/robots.txt", (s) => s.replace("User-agent: OAI-SearchBot\nAllow: /", "User-agent: OAI-SearchBot\nDisallow: /")));
  assert.ok(f.some((m) => m.includes("OAI-SearchBot")));
});

test("silently adding a Google-Extended block fails", () => {
  const f = failuresWith((d) => mutate(d, "public/robots.txt", (s) => s + "\nUser-agent: Google-Extended\nDisallow: /\n"));
  assert.ok(f.some((m) => m.includes("Google-Extended")));
});

test("catch-all rewrite restoring soft 404s fails", () => {
  const f = failuresWith((d) =>
    mutate(d, "vercel.json", (s) => s.replace('{ "source": "/writing", "destination": "/writing.html" }', '{ "source": "/writing", "destination": "/writing.html" },\n    { "source": "/(.*)", "destination": "/index.html" }')),
  );
  assert.ok(f.some((m) => m.includes("catch-all") || m.includes("rewrites must list")));
});

test("missing 404.html fails", () => {
  const f = failuresWith((d) => rmSync(join(d, "public/404.html")));
  assert.ok(f.some((m) => m.includes("404.html")));
});

test("llms.txt that omits a project fails", () => {
  const f = failuresWith((d) => mutate(d, "public/llms.txt", (s) => s.replace("StudyCanvas", "Study Canvas app")));
  assert.ok(f.some((m) => m.includes("StudyCanvas")));
});

test("llms.txt with an email address fails", () => {
  const f = failuresWith((d) => mutate(d, "public/llms.txt", (s) => s + "\nContact: someone@example.com\n"));
  assert.ok(f.some((m) => m.includes("email")));
});

test("restored removed content fails", () => {
  const f = failuresWith((d) => mutate(d, "public/llms.txt", (s) => s + "\nHackathon: ArthaSetu concept.\n"));
  assert.ok(f.some((m) => m.includes("ArthaSetu")));
});

test("built homepage marked noindex fails", () => {
  const f = failuresWith((d) => mutate(d, "dist/index.html", (s) => s.replace('name="robots" content="index, follow, max-image-preview:large"', 'name="robots" content="noindex, nofollow"')), "dist");
  assert.ok(f.some((m) => m.includes("indexable in this build")));
});

test("built output with localhost canonical fails", () => {
  const f = failuresWith((d) => mutate(d, "dist/index.html", (s) => s.replace('href="https://nitishdotdev.vercel.app/"', 'href="http://127.0.0.1:3000/"')), "dist");
  assert.ok(f.some((m) => m.includes("canonical") || m.includes("non-production")));
});

test("built output with a wrong social banner size fails", () => {
  const f = failuresWith((d) => {
    // Replace the banner with a minimal 1x1 PNG so its dimensions are wrong.
    const onePixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
    writeFileSync(join(d, "dist/social-banner.png"), onePixel);
  }, "dist");
  assert.ok(f.some((m) => m.includes("1200x630")));
});

test("missing writing noindex header fails", () => {
  const f = failuresWith((d) => mutate(d, "vercel.json", (s) => s.replace('"noindex, follow"', '"index, follow"')));
  assert.ok(f.some((m) => m.includes("X-Robots-Tag")));
});

test("source mismatch between JSON-LD and site.ts fails", () => {
  const f = failuresWith((d) => mutate(d, "src/config/site.ts", (s) => s.replace('live: "https://studykarle.me"', 'live: "https://example.com"')), "dist");
  assert.ok(f.some((m) => m.includes("live URL for StudyKarle")));
});

test("a generated route that contains the homepage instead fails", () => {
  const failures = failuresWith((dir) => {
    cpSync(join(dir, "dist/index.html"), join(dir, "dist/projects.html"));
  }, "dist");
  assert.ok(failures.some((message) => message.includes("/projects: canonical")));
  assert.ok(failures.some((message) => message.includes('/projects: expected exactly one H1, "Projects"')));
});

test("duplicate H1 or JSON-LD in route output fails", () => {
  const failures = failuresWith((dir) => {
    mutate(dir, "dist/contact.html", (html) => html.replace("</main>", "<h1>Duplicate</h1></main>")
      .replace("</head>", '<script type="application/ld+json">{}</script></head>'));
  }, "dist");
  assert.ok(failures.some((message) => message.includes("exactly one H1")));
  assert.ok(failures.some((message) => message.includes("one JSON-LD script")));
});

test("preview output publishes no indexable pages or sitemap", () => {
  assert.deepEqual(failuresWith(null, "preview"), []);
  const failures = failuresWith((dir) => {
    cpSync(join(dir, "public/sitemap.xml"), join(dir, "dist/sitemap.xml"));
    mutate(dir, "dist/contact.html", (html) => html.replace("noindex, nofollow", "index, follow"));
  }, "preview");
  assert.ok(failures.some((message) => message.includes("preview must not publish a sitemap")));
  assert.ok(failures.some((message) => message.includes("/contact: robots")));
});

test("built routes and assets work via HTTP, and unknown URLs return 404", async () => {
  for (const env of ["production", "preview"]) {
    const server = await preview({
      build: { outDir: join(builds, env) },
      preview: { host: "127.0.0.1", port: 0, open: false },
    });
    const base = server.resolvedUrls.local[0];
    try {
      for (const path of ["/", "/projects", "/experience", "/contact", "/writing"]) {
        const response = await fetch(new URL(path, base));
        assert.equal(response.status, 200, path);
        assert.match(response.headers.get("content-type"), /text\/html/);
        const html = await response.text();
        assert.ok(html.includes(`rel="canonical" href="https://nitishdotdev.vercel.app${path}"`), path);
      }
      const missing = await fetch(new URL("/nonexistent-seo-verification-route", base));
      assert.equal(missing.status, 404);
      const image = await fetch(new URL("/social-banner.png", base));
      assert.equal(image.status, 200);
      assert.match(image.headers.get("content-type"), /image\/png/);
      const sitemap = await fetch(new URL("/sitemap.xml", base));
      assert.equal(sitemap.status, env === "preview" ? 404 : 200);
      for (const response of [missing, image, sitemap]) await response.arrayBuffer();
    } finally {
      await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    }
  }
});
