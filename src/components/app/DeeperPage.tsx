import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { CrisisButton } from "@/components/app/CrisisHelp";
import { Button } from "@/components/ui/button";
import type { DeeperData, DeeperEntry } from "@/lib/deeper";
import {
  DEEPER_BACK, DEEPER_OTHER, DEEPER_NONE, DEEPER_TRY, DEEPER_SURE,
  DEEPER_END_TITLE, DEEPER_END_BODY, DEEPER_REMINDER_TITLE, DEEPER_REMINDER,
  DEEPER_BROWSE, DEEPER_ROOM, DEEPER_CARE, DEEPER_GUIDE,
} from "@/lib/brand";

export function DeeperPage({ slug, data, entry }: { slug: string; data: DeeperData; entry: DeeperEntry | null }) {
  useEffect(() => { window.scrollTo(0, 0); }, [slug, entry?.position]);
  return (
    <AppShell>
      <article className="space-y-6 py-4">
        <Link to="/topic/$slug" params={{ slug }} search={{ chooser: true }} className="inline-flex min-h-12 items-center underline underline-offset-4">{DEEPER_BACK}</Link>
        <h1 className="text-4xl leading-tight sm:text-5xl">{entry ? entry.saying : DEEPER_END_TITLE}</h1>
        {entry ? (
          <>
            <p className="whitespace-pre-line text-lg leading-relaxed">{entry.what}</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">{DEEPER_TRY}</p>
              <p className="whitespace-pre-line text-lg leading-relaxed">{entry.try}</p>
            </div>
            <p className="text-base text-muted-foreground">{DEEPER_SURE}: {entry.sure_label}. {entry.sure_note}</p>
            <section className="space-y-2">
              <h2 className="text-2xl leading-snug">{DEEPER_OTHER}</h2>
              <ul>
                {data.entries.filter((item) => item.position !== entry.position).map((item) => (
                  <li key={item.position}><Link to="/topic/$slug/more/$position" params={{ slug, position: String(item.position) }} search={{}} className="inline-flex min-h-12 items-center underline underline-offset-4">{`“${item.saying}”`}</Link></li>
                ))}
                <li><Link to="/topic/$slug/more/none" params={{ slug }} search={{}} className="inline-flex min-h-12 items-center underline underline-offset-4">{DEEPER_NONE}</Link></li>
              </ul>
            </section>
          </>
        ) : (
          <>
            <p className="text-lg leading-relaxed">{DEEPER_END_BODY}</p>
            <h2 className="text-xl leading-snug">{DEEPER_REMINDER_TITLE}</h2>
            <p className="text-lg leading-relaxed">{DEEPER_REMINDER}</p>
            <div>
              <Link to="/about" hash="topics" className="inline-flex min-h-12 items-center underline underline-offset-4">{DEEPER_BROWSE}</Link>
              <p className="text-muted-foreground">{DEEPER_ROOM}</p>
            </div>
            <p className="text-lg leading-relaxed">{DEEPER_CARE}</p>
          </>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <CrisisButton />
          <Button asChild variant="quiet" className="h-auto min-h-12 rounded-full whitespace-normal px-5 py-3 text-base"><Link to="/guide">{DEEPER_GUIDE}</Link></Button>
        </div>
      </article>
    </AppShell>
  );
}