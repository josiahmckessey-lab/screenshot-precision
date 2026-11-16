import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Settings, Phone, ArrowUp } from "lucide-react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wordmark } from "./AppShell";
import { AiNotice } from "./AiNotice";
import { CrisisPanel } from "./CrisisHelp";
import { chat } from "@/lib/chat.functions";
import { KNOW_MORE, DEPTH_TITLES } from "@/lib/brand";
import type { ChatInput, ChatResult, GeneratedReply } from "@/lib/chat-contract";
import { nextDepth } from "@/lib/chat-screen-rules";

type Turn = { id: number; message: string; result?: ChatResult };
type Detail = { text: string; level: number };
type ReplyPart = GeneratedReply["parts"][number];

function ReplyCard({ part, busy, expand }: { part: ReplyPart; busy: boolean; expand: (level: 1 | 2 | 3) => Promise<string | null> }) {
  const [details, setDetails] = useState<Detail[]>([]);
  const [skipped, setSkipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const level=nextDepth(details.length);
  if(skipped) return null;
  async function more() {
    if(!level || busy || loading) return;
    setLoading(true);
    try { const text=await expand(level); if(text) setDetails(old=>[...old,{text,level}]); }
    finally {setLoading(false);}
  }
  return <article className="space-y-4 rounded-lg border border-border bg-card p-5 md:p-6" aria-label={part.title}>
    <div className="flex items-start justify-between gap-3"><h2 className="min-w-0 text-2xl">{part.id==="verse" ? part.reference : part.title}</h2>{part.id==="story" && <Button variant="ghost" size="sm" onClick={()=>setSkipped(true)}>Skip</Button>}</div>
    <MessageResponse className="text-lg leading-relaxed" mode="static">{part.text}</MessageResponse>
    {part.id==="verse" && <p className="border-t border-border pt-4 text-base">{part.practical}</p>}
    {details.map(detail=><div key={detail.level} className="space-y-3 border-t border-border pt-4"><h3 className="text-xl">{DEPTH_TITLES[detail.level-1]}</h3><MessageResponse mode="static" className="text-lg leading-relaxed">{detail.text}</MessageResponse></div>)}
    {loading && <p role="status" className="text-sm text-muted-foreground"><Shimmer>Taking a closer look…</Shimmer></p>}
    {level && <Button variant="link" className="h-auto max-w-full whitespace-normal p-0 text-left text-base" disabled={busy || loading} onClick={()=>void more()}>{KNOW_MORE}</Button>}
  </article>;
}

export function ChatScreen() {
  const callChat=useServerFn(chat);
  const [turns,setTurns]=useState<Turn[]>([]);
  const [text,setText]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string | null>(null);
  const [help,setHelp]=useState(false);
  const [safety,setSafety]=useState<string | null>(null);
  const conversation=useRef<string | null>(null);
  const history=useRef<NonNullable<ChatInput["history"]>>([]);
  const textarea=useRef<HTMLTextAreaElement>(null);
  const working=useRef(false);
  useEffect(()=>{textarea.current?.focus();},[]);
  async function submit() {
    const message=text.trim();
    if(!message || working.current) return;
    if(Array.from(message).length>2000) {setError("Please keep your message to 2,000 characters or fewer.");return;}
    working.current=true;setBusy(true);setError(null);setText("");
    const id=Date.now();setTurns(old=>[...old,{id,message}]);
    try {
      const result=await callChat({data:{message,conversationId:conversation.current ?? undefined,history:history.current.slice(-12)}});
      conversation.current=result.conversationId;
      if(result.reply.mode==="safety" && "message" in result.reply) {setSafety(result.reply.message);setTurns(old=>old.filter(t=>t.id!==id));}
      else {
        setTurns(old=>old.map(t=>t.id===id ? {...t,result} : t));
        history.current=[...history.current,{role:"user",content:message},{role:"assistant",content:JSON.stringify(result.reply).slice(0,6000)}].slice(-12) as NonNullable<ChatInput["history"]>;
      }
    } catch(e) {setError(e instanceof Error ? e.message : "We couldn't prepare a reply. Please try again later.");}
    finally {working.current=false;setBusy(false);if(!document.querySelector('[role="dialog"]')) textarea.current?.focus();}
  }
  async function expand(turn: Turn, part: ReplyPart, level: 1 | 2 | 3) {
    if(working.current || !turn.result?.entryNumber) return null;
    working.current=true;setBusy(true);setError(null);
    try {
      const result=await callChat({data:{message:turn.message,conversationId:conversation.current ?? undefined,history:history.current.slice(-12),knowMore:{entryNumber:turn.result.entryNumber,level,partId:part.id,partText:part.text}}});
      conversation.current=result.conversationId;
      if(result.reply.mode==="safety" && "message" in result.reply) {setSafety(result.reply.message);return null;}
      return result.detail?.text ?? null;
    } catch(e) {setError(e instanceof Error ? e.message : "We couldn't prepare that explanation.");return null;}
    finally {working.current=false;setBusy(false);}
  }
  return <div className="mx-auto flex h-dvh max-w-3xl flex-col px-4 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-8">
    <header className="flex shrink-0 items-center justify-between gap-2 py-3"><Link to="/" aria-label="Home"><Wordmark /></Link><div className="flex items-center gap-1"><Button variant="quiet" onClick={()=>setHelp(true)} className="h-11 px-3"><Phone />Crisis help</Button><Button asChild variant="ghost" size="icon" className="size-11"><Link to="/settings" aria-label="Settings" title="Settings"><Settings /></Link></Button></div></header>
    <div className="shrink-0 pb-3"><AiNotice /></div>
    {safety && <div className="max-h-[45dvh] shrink-0 overflow-y-auto pb-3"><CrisisPanel text={safety} /></div>}
    <Conversation className="min-h-0" aria-label="Conversation"><ConversationContent className="gap-7 px-0 py-5">
      {!turns.length && !safety && <div className="py-10 md:py-16"><h1 className="text-3xl md:text-4xl">What's happening today?</h1></div>}
      {turns.map(turn=><div key={turn.id} className="space-y-6"><Message from="user"><MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground text-lg"><p className="whitespace-pre-wrap break-words">{turn.message}</p></MessageContent></Message>
        {turn.result && <Message from="assistant" className="max-w-full"><MessageContent className="w-full text-lg">
          {"message" in turn.result.reply ? <MessageResponse mode="static">{turn.result.reply.message}</MessageResponse> : turn.result.reply.mode==="steady" ? <div className="space-y-4"><MessageResponse mode="static">{turn.result.reply.grounding ?? ""}</MessageResponse><MessageResponse mode="static">{turn.result.reply.question ?? ""}</MessageResponse></div> : <div className="space-y-5">{turn.result.reply.parts.map(part=><ReplyCard key={part.id} part={part} busy={busy} expand={level=>expand(turn,part,level)} />)}</div>}
        </MessageContent></Message>}
      </div>)}
      {busy && <Message from="assistant"><p role="status" className="text-base text-muted-foreground"><Shimmer>Taking a moment…</Shimmer></p></Message>}
    </ConversationContent><ConversationScrollButton aria-label="Latest message" /></Conversation>
    <footer className="shrink-0 bg-background pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      {error && <p role="alert" className="mb-3 text-base text-destructive">{error}</p>}
      <PromptInput onSubmit={()=>submit()} className="[&_[data-slot=input-group]]:bg-card">
        <PromptInputTextarea ref={textarea} value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" aria-label="Describe your situation" className="min-h-24 px-4 text-lg md:text-lg" />
        <PromptInputFooter className="justify-between px-3 pb-3"><span className="text-xs text-muted-foreground">{Array.from(text).length} / 2,000</span><PromptInputSubmit status={busy ? "submitted" : "ready"} disabled={busy || !text.trim()} aria-label={busy ? "Preparing reply" : "Get a reply"} title="Get a reply" className="size-11 rounded-lg">{!busy && <ArrowUp className="size-5" />}</PromptInputSubmit></PromptInputFooter>
      </PromptInput>
    </footer>
    <Dialog open={help} onOpenChange={setHelp}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Crisis help</DialogTitle></DialogHeader><CrisisPanel /></DialogContent></Dialog>
  </div>;
}