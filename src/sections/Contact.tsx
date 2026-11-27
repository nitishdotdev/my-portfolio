import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { GitHubIcon, LinkedInIcon, MailIcon, FileIcon } from "@/components/icons";
import { ArrowUpRight } from "lucide-react";

const GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function Contact({ isPage = false }: { isPage?: boolean }) {
  // Only links that are configured are shown; unverified contact details stay hidden.
  const contactLinks = [
    { label: "GitHub", href: site.socials.github, Icon: GitHubIcon },
    { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedInIcon },
    { label: "Mail", href: site.email ? `mailto:${site.email}` : "", Icon: MailIcon },
    { label: "Resume", href: site.socials.resume, Icon: FileIcon },
  ].filter((l) => Boolean(l.href));

  const cols = GRID_COLS[Math.min(contactLinks.length, 4)] ?? GRID_COLS[4];

  return (
    <div id="contact">
      <SectionHeader as={isPage ? "h1" : "h2"} title="Contact" />
      <Shell>
        <div className={`grid grid-cols-2 ${cols} border-b border-[var(--line)] sm:border-b-0`}>
          {contactLinks.map((l, idx) => {
            const IconComponent = l.Icon;
            const isLast = idx === contactLinks.length - 1;
            return (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`group flex items-center justify-center gap-2.5 border-[var(--line)] px-4 py-4 text-[13px] font-medium transition-colors duration-200 hover:bg-[var(--hover)] border-b ${
                  idx % 2 === 0 ? "border-r" : "border-r-0"
                } ${idx < contactLinks.length - (contactLinks.length % 2 === 0 ? 2 : 1) ? "" : "border-b-0"} sm:border-b-0 ${
                  isLast ? "sm:border-r-0" : "sm:border-r"
                }`}
              >
                <span className="grid size-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--chip)] text-[var(--muted)] transition-colors group-hover:text-[var(--fg)]">
                  <IconComponent className="size-4" />
                </span>
                <span className="text-[var(--muted)] transition-colors group-hover:text-[var(--fg)]">
                  {l.label}
                </span>
                <ArrowUpRight className="size-3.5 text-[var(--soft)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)]" />
              </a>
            );
          })}
        </div>
      </Shell>
    </div>
  );
}
