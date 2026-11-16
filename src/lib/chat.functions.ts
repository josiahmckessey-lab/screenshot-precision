import { createServerFn } from "@tanstack/react-start";
import { chatInputSchema } from "./chat-contract";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runChat } from "./chat.server";

export const chat = createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth])
  .inputValidator((input:unknown)=>chatInputSchema.parse(input))
  .handler(async ({data,context})=>{
    const key=process.env['ANTHROPIC_API_KEY'];
    if(!key) throw new Error("AI replies need configuration before they can start.");
    return runChat(data,context.userId,context.supabase,key);
  });