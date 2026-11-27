import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRouteMetadata, JSON_LD_ID, normalizePath } from "@/config/seo";
import { getStructuredData } from "@/config/structured-data";

export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    const { title, canonical, meta } = getRouteMetadata(path);
    document.title = title;

    for (const [attribute, tags] of Object.entries(meta)) {
      for (const [key, value] of Object.entries(tags)) {
        const found = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
        if (!value) {
          found?.remove();
          continue;
        }
        const tag = found ?? document.createElement("meta");
        tag.setAttribute(attribute, key);
        tag.content = value;
        if (!found) document.head.append(tag);
      }
    }

    const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const link = existingCanonical ?? document.createElement("link");
      link.rel = "canonical";
      link.href = canonical;
      if (!existingCanonical) document.head.append(link);
    } else {
      existingCanonical?.remove();
    }

    const data = getStructuredData(path);
    const existingGraph = document.getElementById(JSON_LD_ID);
    if (data) {
      const graph = existingGraph ?? document.createElement("script");
      graph.id = JSON_LD_ID;
      graph.setAttribute("type", "application/ld+json");
      graph.textContent = JSON.stringify(data);
      if (!existingGraph) document.head.append(graph);
    } else {
      existingGraph?.remove();
    }
  }, [pathname]);

  return null;
}
