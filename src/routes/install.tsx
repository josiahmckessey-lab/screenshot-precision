import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { APP_DESCRIPTION, BACK_TO_LIBRARY, INSTALL_PAGE_TITLE, INSTALL_SECTIONS } from "@/lib/brand";

export const Route = createFileRoute("/install")({
  head: () => ({ meta: [
    { title: INSTALL_PAGE_TITLE },
    { name: "description", content: APP_DESCRIPTION },
    { property: "og:title", content: INSTALL_PAGE_TITLE },
    { property: "og:description", content: APP_DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: InstallPage,
});

function InstallPage() {
  return (
    <AppShell>
      <article className="space-y-8 py-8">
        <h1 className="text-4xl leading-tight">{INSTALL_PAGE_TITLE}</h1>
        {INSTALL_SECTIONS.map(({ heading, steps }) => (
          <section key={heading} className="space-y-4">
            <h2 className="text-2xl">{heading}</h2>
            <ol className="list-decimal space-y-3 pl-6 text-lg leading-relaxed">
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        ))}
        <Link to="/" className="inline-flex min-h-12 items-center underline underline-offset-4">{BACK_TO_LIBRARY}</Link>
      </article>
    </AppShell>
  );
}