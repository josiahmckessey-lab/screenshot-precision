import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_ERROR, QUESTION_NOTICE, QUESTION_SENT_SHORT } from "@/lib/brand";

// Anonymous question box: inserts only body + optional topic slug. No names, no identifiers.
export function QuestionBox({ topicSlug }: { topicSlug?: string }) {
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const text = body.trim();

  async function send() {
    if (!text || text.length > 2000) return;
    setState("sending");
    const { error } = await supabase.from("questions").insert({ body: text, topic_slug: topicSlug ?? null });
    if (error) return setState("error");
    setBody("");
    setState("sent");
  }

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground">{QUESTION_NOTICE}</p>
      <Textarea
        aria-label="Question"
        value={body}
        maxLength={2000}
        rows={4}
        onChange={(e) => { setBody(e.target.value); if (state !== "sending") setState("idle"); }}
        className="text-lg"
      />
      <div className="flex items-center gap-4">
        <Button onClick={send} disabled={!text || state === "sending"}>Send</Button>
        {state === "sent" && <p role="status">{QUESTION_SENT_SHORT}</p>}
        {state === "error" && <p role="alert" className="text-destructive">{QUESTION_ERROR}</p>}
      </div>
    </div>
  );
}
