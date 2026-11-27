import { useEffect, useState } from "react";

export interface HeatmapData {
  cells: (number | null)[];
  total: number;
  /** true only when real contribution data was loaded. Never fabricated. */
  live: boolean;
}

const EMPTY: HeatmapData = { cells: [], total: 0, live: false };

/** Live GitHub contributions for the last year (public API, no auth). */
export function useGithubHeatmap(user: string): HeatmapData {
  const [heatmap, setHeatmap] = useState<HeatmapData>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    setHeatmap(EMPTY);
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((d) => {
        const contribs = d?.contributions ?? [];
        if (cancelled || contribs.length === 0) return;
        // pad so the first column starts on the right weekday
        const firstDow = new Date(contribs[0].date).getDay();
        const cells: (number | null)[] = Array(firstDow)
          .fill(null)
          .concat(contribs.map((c: any) => c.level));
        const total =
          d?.total?.lastYear ?? contribs.reduce((a: number, c: any) => a + c.count, 0);
        setHeatmap({ cells, total, live: true });
      })
      .catch(() => {
        /* leave EMPTY: the section shows an honest unavailable message */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return heatmap;
}
