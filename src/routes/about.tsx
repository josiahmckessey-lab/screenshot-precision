import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { APP_DESCRIPTION, APP_NAME, INSTALL_LABEL, RESEARCH_LINK, MESSAGE_GUIDE, NEED_MORE_TITLE } from "@/lib/brand";
import { InstallHint } from "@/components/app/InstallHint";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ABOUT_HEADING, ABOUT_INTRO_HEADING, ABOUT_PARAGRAPHS, ABOUT_GUIDE_TEXT, FRAMEWORK_HEADING, FRAMEWORK_INTRO, FRAMEWORK_PARTS, RESEARCH_HEADING, RESEARCH_TEXT } from "@/content/about";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const { data, error } = await supabase.from("library_pages")
      .select("topic_number,home_line").eq("status", "active")
      .in("topic_number", FRAMEWORK_PARTS.flatMap((part) => part.topics));
    if (error) throw new Error("The topics could not be loaded.");
    return data ?? [];
  },
  head: () => ({
    meta: [
      { title: `About — ${APP_NAME}` },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: `About — ${APP_NAME}` },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const topics = Route.useLoaderData();
  return (
    <AppShell>
      <article className="space-y-8 py-8">
        <h1 className="text-4xl">{ABOUT_HEADING}</h1>
        <nav className="flex flex-wrap gap-x-6">
          <Link to="/install" className="inline-flex min-h-12 items-center underline underline-offset-4">{INSTALL_LABEL}</Link>
          <Link to="/about" hash="wellbeing" className="inline-flex min-h-12 items-center underline underline-offset-4">{RESEARCH_LINK}</Link>
        </nav>
        <InstallHint />
        <section className="space-y-5">
          <h2 className="text-3xl">{ABOUT_INTRO_HEADING}</h2>
          {ABOUT_PARAGRAPHS.map((paragraph) => <p key={paragraph} className="text-lg leading-relaxed">{paragraph}</p>)}
        </section>
        <section id="wellbeing" className="scroll-mt-4 space-y-5">
          <h2 className="text-3xl">{RESEARCH_HEADING}</h2>
          <p className="text-lg leading-relaxed">{RESEARCH_TEXT}</p>
          <Link to="/privacy" className="underline underline-offset-4">Privacy</Link>
        </section>
        <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
          <h2 className="text-2xl">For readers who want the theological grounding</h2>
          <p className="text-lg leading-relaxed">The faith underneath the model, laid out in the open. Nothing on that page is required.</p>
          <Button asChild><Link to="/about/theology">Read the theological grounding</Link></Button>
        </section>
        <section id="topics" className="scroll-mt-4 space-y-5">
          <h2 className="text-3xl">{FRAMEWORK_HEADING}</h2>
          <p className="text-lg leading-relaxed">{FRAMEWORK_INTRO}</p>
          <div className="space-y-5">
            {FRAMEWORK_PARTS.map((part) => (
              <section key={part.number} id={`part-${part.number}`} className="scroll-mt-4 space-y-4 rounded-2xl border bg-card p-5 text-card-foreground">
                <h3 className="text-2xl font-bold">Part {part.number}. {part.title}</h3>
                <p className="text-lg italic">{part.picture}</p>
                <p className="text-lg leading-relaxed">{part.summary}</p>
                <ul className="space-y-3">
                  {part.topics.flatMap((number) => {
                    const topic = topics.find((item) => item.topic_number === number);
                    return topic ? [<li key={number}>
                      <Link to="/topic/$slug" params={{ slug: `topic-${String(number).padStart(2, "0")}` }} className="block text-lg underline underline-offset-4">{topic.home_line}</Link>
                    </li>] : [];
                  })}
                </ul>
              </section>
            ))}
          </div>
        </section>
        <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
          <h2 className="text-2xl">{NEED_MORE_TITLE}</h2>
          <p className="text-lg leading-relaxed">{ABOUT_GUIDE_TEXT}</p>
          <Button asChild><Link to="/guide">{MESSAGE_GUIDE}</Link></Button>
        </section>
      </article>
    </AppShell>
  );
}
