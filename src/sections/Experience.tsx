import { motion } from "framer-motion";
import { Shell, SectionHeader } from "@/components/Layout";
import { site, type Job } from "@/config/site";
import { ExternalLink } from "lucide-react";

function Entry({ item, index }: { item: Job; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`px-6 py-6 transition-colors duration-200 hover:bg-[var(--hover)] sm:px-8 ${
        index > 0 ? "border-t border-[var(--line)]" : ""
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[15.5px] font-semibold text-[var(--fg)] flex items-center gap-2">
          {item.role} <span className="text-[var(--soft)]">·</span>{" "}
          <span className="text-[var(--muted)]">{item.company}</span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.role} project link`}
              className="text-[var(--soft)] hover:text-[var(--fg)] transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </h3>
        {item.period && <span className="font-mono text-[11px] text-[var(--soft)]">{item.period}</span>}
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)] max-w-2xl">{item.blurb}</p>
    </motion.div>
  );
}

export function Experience(_props: { isDetailed?: boolean }) {
  const hasExperience = site.experience.length > 0;
  const hasCollaboration = site.collaboration.length > 0;

  if (!hasExperience && !hasCollaboration) return null;

  return (
    <div id="experience">
      <SectionHeader title={site.experienceTitle} />
      <Shell>
        {site.experience.map((job, i) => (
          <Entry key={`${job.company}-${i}`} item={job} index={i} />
        ))}

        {hasCollaboration && (
          <div className={hasExperience ? "border-t border-[var(--line)]" : ""}>
            <div className="px-6 pt-6 sm:px-8">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--soft)] font-semibold">
                Campus & Collaboration
              </span>
            </div>
            {site.collaboration.map((item, i) => (
              <Entry key={`${item.company}-${i}`} item={item} index={i} />
            ))}
          </div>
        )}
      </Shell>
    </div>
  );
}

export default Experience;
