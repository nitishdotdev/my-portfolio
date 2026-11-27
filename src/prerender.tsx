import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import App from "@/App";
import { DEPLOYMENT_INDEXABLE, getRouteMetadata, JSON_LD_ID, ROUTE_SEO } from "@/config/seo";
import { getStructuredData } from "@/config/structured-data";

export { DEPLOYMENT_INDEXABLE, ROUTE_SEO };

export function renderRoute(path: string) {
  const { title, canonical, meta } = getRouteMetadata(path);
  const jsonLd = JSON.stringify(getStructuredData(path)).replace(/</g, "\\u003c");
  const head = renderToStaticMarkup(
    <>
      <title>{title}</title>
      <link rel="canonical" href={canonical} />
      {Object.entries(meta.name).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
      {Object.entries(meta.property).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}
      <script
        id={JSON_LD_ID}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </>,
  );

  const body = renderToString(
    <StaticRouter location={path}>
      <App />
    </StaticRouter>,
  );
  return { head, body };
}
