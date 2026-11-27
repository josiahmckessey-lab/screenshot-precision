import { type ReactNode } from "react";
import { Streamdown } from "streamdown";

export function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</h2>
      {children}
    </section>
  );
}

export function Md({ text }: { text: string }) {
  return <Streamdown className="prose-text space-y-4 text-lg leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">{text}</Streamdown>;
}
