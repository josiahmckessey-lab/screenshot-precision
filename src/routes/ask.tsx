import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { supabase } from "@/integrations/supabase/client";
import { APP_DESCRIPTION, APP_NAME, QUESTION_TITLE } from "@/lib/brand";

export const Route = createFileRoute("/ask")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["topic"] === "string" ? { topic: search["topic"] } : {}),
  }),
  loaderDeps: ({ search }) => ({ topic: search.topic }),
  loader: async ({ deps }) => {
    if (!deps.topic || !/^topic-\d{2}$/.test(deps.topic)) return { topicSlug: null };
    const { data, error } = await supabase.from("library_pages").select("slug")
      .eq("slug", deps.topic).eq("status", "active").maybeSingle();
    return { topicSlug: !error && data ? data.slug : null };
  },
  head: () => ({ meta: [
    { title: `${QUESTION_TITLE} — ${APP_NAME}` },
    { name: "description", content: APP_DESCRIPTION },
    { property: "og:title", content: `${QUESTION_TITLE} — ${APP_NAME}` },
    { property: "og:description", content: APP_DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AskPage,
});

function AskPage() {
  const { topicSlug } = Route.useLoaderData();
  return <AppShell><section className="space-y-6 py-8">
    <h1 className="text-4xl leading-tight">{QUESTION_TITLE}</h1>
    <QuestionBox key={topicSlug ?? "general"} {...(topicSlug ? { topicSlug } : {})} />
  </section></AppShell>;
}