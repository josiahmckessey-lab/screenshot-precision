import { createServerFn } from "@tanstack/react-start";
import { createPublicReadClient } from "@/lib/match-topics.server";
import { guideEmailText, guideMessageSchema, saveThenNotify } from "@/lib/guide-message";

export const send_guide_message = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => guideMessageSchema.parse(data))
  .handler(async ({ data }) => {
    const client = createPublicReadClient();
    return saveThenNotify(async () => {
      const { data: id, error } = await client.rpc("submit_guide_message", {
        _body: data.body,
        ...(data.reply_to ? { _reply_to: data.reply_to } : {}),
        ...(data.included_question ? { _included_question: data.included_question } : {}),
      });
      if (error) throw new Error("message_save_failed");
      return id;
    }, async (id) => {
      const key = process.env["RESEND_API_KEY"];
      const gatewayKey = process.env["LOVABLE_API_KEY"];
      if (!key || !gatewayKey) throw new Error("email_not_configured");
      const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key, "Idempotency-Key": `guide-message-${id}` },
        body: JSON.stringify({
          from: "Daybreak <onboarding@resend.dev>",
          to: ["josiahmckessey@proton.me"],
          subject: "Library message",
          ...(data.reply_to ? { reply_to: data.reply_to } : {}),
          text: guideEmailText(data),
        }),
      });
      if (!response.ok) throw new Error(`email_status_${response.status}`);
    });
  });