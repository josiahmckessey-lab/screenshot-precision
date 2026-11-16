import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runChat } from "./chat.server";

export const chat = createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth])
  .inputValidator((input:unknown)=>z.object({message:z.string(),conversationId:z.string().uuid().optional(),history:z.array(z.object({role:z.enum(["user","assistant"]),content:z.string().max(6000)})).max(12).optional()}).parse(input))
  .handler(async ({data,context})=>{
    const key=process.env['ANTHROPIC_API_KEY'];
    if(!key) throw new Error("AI replies need configuration before they can start.");
    return runChat(data,context.userId,context.supabase,key);
  });