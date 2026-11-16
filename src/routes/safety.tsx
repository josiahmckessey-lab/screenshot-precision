import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/safety")({
  head: () => ({meta:[{title:`Safety — ${APP_NAME}`},{name:"description",content:"Immediate safety help and US crisis contacts."},{property:"og:title",content:`Safety — ${APP_NAME}`},{property:"og:description",content:"Call or text 988, or call 911 for immediate danger."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),
  component: () => <AppShell><div className="space-y-6 py-8"><h1 className="text-4xl">Your safety matters</h1><CrisisPanel /><p>This AI cannot provide crisis care. If it is safe, move away from immediate danger and reach out to someone you trust.</p></div></AppShell>,
});