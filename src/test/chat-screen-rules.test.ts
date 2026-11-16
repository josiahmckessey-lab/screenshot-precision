import { describe, expect, it } from "vitest";
import { nextDepth } from "@/lib/chat-screen-rules";
import { chatInputSchema } from "@/lib/chat-contract";
describe("Per-part deeper explanations",()=>{
  it("advances plain why, how it works, research and roots then stops after the third level",()=>{
    expect(nextDepth(0)).toBe(1);expect(nextDepth(1)).toBe(2);expect(nextDepth(2)).toBe(3);expect(nextDepth(3)).toBeNull();
  });
  it("keeps the requested part separate from all the other reply parts",()=>{
    expect(chatInputSchema.parse({message:"A hard day",knowMore:{entryNumber:4,level:2,partId:"phenomenon",partText:"One reflection"}}).knowMore?.partId).toBe("phenomenon");
    expect(chatInputSchema.safeParse({message:"A hard day",knowMore:{entryNumber:4,level:2,partId:"all"}}).success).toBe(false);
  });
});