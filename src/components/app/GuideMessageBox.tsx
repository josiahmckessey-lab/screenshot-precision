import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { GUIDE_MESSAGE_TITLE, GUIDE_MESSAGE_NOTICE, GUIDE_MESSAGE_LABEL, GUIDE_MESSAGE_PLACEHOLDER, GUIDE_REPLY_LABEL, GUIDE_REPLY_INVALID, GUIDE_INCLUDE_LABEL, GUIDE_SEND_LABEL, GUIDE_RECEIVED, GUIDE_SEND_ERROR, GUIDE_LIMIT_TEXT, GUIDE_INVALID_TEXT, QUESTION_CRISIS_TEXT } from "@/lib/brand";
import { canSendGuide, guideMessageSchema, recordGuideSend } from "@/lib/guide-message";
import { send_guide_message } from "@/lib/guide-message.functions";
import { readIdeas } from "@/lib/ideas-session";
import { hasCrisisPhrase } from "@/lib/question-match";

export function GuideMessageBox() {
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [website, setWebsite] = useState("");
  const [question, setQuestion] = useState("");
  const [include, setInclude] = useState(true);
  const [crisis, setCrisis] = useState(false);
  const [received, setReceived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [replyError, setReplyError] = useState("");
  const lock = useRef(false);
  const sendMessage = useServerFn(send_guide_message);
  useEffect(() => { setQuestion(readIdeas(sessionStorage)?.text ?? ""); }, []);

  async function submit() {
    setCrisis(hasCrisisPhrase(body));
    if (lock.current) return;
    if (reply.trim() && !guideMessageSchema.shape.reply_to.safeParse(reply).success) return setReplyError(GUIDE_REPLY_INVALID);
    const data = guideMessageSchema.safeParse({ body, reply_to: reply, website, ...(include && question ? { included_question: question } : {}) });
    if (!data.success) return setError(GUIDE_INVALID_TEXT);
    if (!canSendGuide(localStorage, Date.now())) return setError(GUIDE_LIMIT_TEXT);
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await sendMessage({ data: data.data });
      if (result.status === "capped") return setError(GUIDE_LIMIT_TEXT);
      recordGuideSend(localStorage, Date.now());
      setReceived(true);
      setReplyError("");
      setBody(""); setReply(""); setQuestion("");
    } catch { setError(GUIDE_SEND_ERROR); }
    finally { lock.current = false; setBusy(false); }
  }

  return <section id="message-box" className="scroll-mt-6 space-y-4">
    <h2 className="text-2xl">{GUIDE_MESSAGE_TITLE}</h2>
    <p className="text-base leading-relaxed text-muted-foreground">{GUIDE_MESSAGE_NOTICE}</p>
    {crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
    {received ? <p role="status" className="text-lg">{GUIDE_RECEIVED}</p> : <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <div className="space-y-2">
        <Label htmlFor="guide-body">{GUIDE_MESSAGE_LABEL}</Label>
        <Textarea id="guide-body" required minLength={1} maxLength={3000} placeholder={GUIDE_MESSAGE_PLACEHOLDER} rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guide-reply">{GUIDE_REPLY_LABEL}</Label>
        <Input id="guide-reply" type="email" maxLength={200} aria-invalid={replyError ? true : undefined} value={reply} onChange={(e) => { setReply(e.target.value); setReplyError(""); }} />
        {replyError && <p role="alert" className="text-destructive">{replyError}</p>}
      </div>
      {question && <div className="flex items-start gap-3">
        <Checkbox id="guide-include" checked={include} onCheckedChange={(value) => setInclude(value === true)} />
        <Label htmlFor="guide-include" className="leading-relaxed">{GUIDE_INCLUDE_LABEL}</Label>
      </div>}
      <input type="text" name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <Button type="submit" disabled={busy}>{GUIDE_SEND_LABEL}</Button>
      {error && <p role="alert" className="text-destructive">{error}</p>}
    </form>}
  </section>;
}