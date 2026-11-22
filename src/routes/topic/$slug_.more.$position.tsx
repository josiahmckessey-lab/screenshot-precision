import { createFileRoute } from "@tanstack/react-router";
import { DeeperPage } from "@/components/app/DeeperPage";
import { loadDeeperPage } from "@/lib/deeper";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/topic/$slug_/more/$position")({
  loader: ({ params }) => loadDeeperPage(params.slug, params.position),
  head: ({ loaderData }) => {
    const title = loaderData?.entry?.saying ?? APP_NAME;
    return { meta: [
      { title }, { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: title }, { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ] };
  },
  component: SayingPage,
});

function SayingPage() {
  const { slug } = Route.useParams();
  const { data, entry } = Route.useLoaderData();
  return <DeeperPage slug={slug} data={data} entry={entry} />;
}