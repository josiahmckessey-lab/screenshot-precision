import { createFileRoute } from "@tanstack/react-router";
import { DeeperPage } from "@/components/app/DeeperPage";
import { loadDeeperPage } from "@/lib/deeper";
import { APP_DESCRIPTION, DEEPER_END_TITLE } from "@/lib/brand";

export const Route = createFileRoute("/topic/$slug_/more/none")({
  loader: ({ params }) => loadDeeperPage(params.slug, "none"),
  head: () => ({ meta: [
    { title: DEEPER_END_TITLE }, { name: "description", content: APP_DESCRIPTION },
    { property: "og:title", content: DEEPER_END_TITLE }, { property: "og:description", content: APP_DESCRIPTION },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: EndpointPage,
});

function EndpointPage() {
  const { slug } = Route.useParams();
  const { data } = Route.useLoaderData();
  return <DeeperPage slug={slug} data={data} entry={null} />;
}