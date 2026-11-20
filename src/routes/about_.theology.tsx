import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

type ScriptureItem = { reference: string; verse: string };

export const Route = createFileRoute("/about_/theology")({
  loader: async () => {
    const { data, error } = await supabase
      .from("about_sections")
      .select("slug,position,heading,body,scripture")
      .eq("page", "theology")
      .eq("status", "active")
      .order("position");
    if (error) throw new Error("The page could not be loaded.");
    return data ?? [];
  },
  head: () => ({
    meta: [
      { title: `Theological grounding — ${APP_NAME}` },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: `Theological grounding — ${APP_NAME}` },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <AppShell>
      <p role="alert" className="py-8 text-lg">{error instanceof Error ? error.message : String(error)}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p className="py-8 text-lg">This page could not be found.</p>
    </AppShell>
  ),
  component: TheologyPage,
});

function BackLink() {
  return (
    <Link to="/about" className="underline underline-offset-4">← Back to About</Link>
  );
}

function TheologyPage() {
  const sections = Route.useLoaderData();
  return (
    <AppShell>
      <article className="space-y-10 py-8">
        <BackLink />
        <h1 className="text-4xl">Theological grounding</h1>
        {sections.map((section) => {
          const items = (section.scripture ?? []) as unknown as ScriptureItem[];
          const paragraphs = section.body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
          return (
            <section key={section.slug} className="space-y-4">
              <h2 className="text-3xl">{section.heading}</h2>
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed">{paragraph}</p>
              ))}
              {items.length > 0 && (
                <div className="space-y-4 border-l-4 border-clay bg-clay-soft p-5">
                  {items.map((item) => (
                    <blockquote key={item.reference} className="space-y-1">
                      <p className="text-lg italic leading-relaxed">{item.verse}</p>
                      <cite className="block text-sm not-italic text-muted-foreground">{item.reference}</cite>
                    </blockquote>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        <BackLink />
      </article>
    </AppShell>
  );
}
