import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { STARTER_QUESTIONS } from "@/content/starter-questions";
import { APP_DESCRIPTION, APP_NAME, EXAMPLES_TITLE } from "@/lib/brand";

export const Route = createFileRoute("/examples")({
  head: () => {
    const title = `${EXAMPLES_TITLE} | ${APP_NAME}`;
    return {
      meta: [
        { title },
        { name: "description", content: APP_DESCRIPTION },
        { property: "og:title", content: title },
        { property: "og:description", content: APP_DESCRIPTION },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex, nofollow" },
      ],
    };
  },
  component: ExamplesPage,
});

function ExamplesPage() {
  return (
    <AppShell>
      <section className="space-y-6 py-4">
        <h1 className="text-4xl leading-tight">{EXAMPLES_TITLE}</h1>
        <ul className="divide-y divide-border">
          {STARTER_QUESTIONS.map((question) => (
            <li key={question.slug}>
              <Link to="/topic/$slug" params={{ slug: question.slug }} search={{}}
                className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-lg leading-relaxed underline underline-offset-4">
                <span>{question.text}</span><ArrowRight aria-hidden="true" className="size-5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}