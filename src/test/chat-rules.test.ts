import { describe,expect,it } from "vitest";
import { cleanMessage,keywordCrisis,validReply } from "@/lib/chat-rules.server";

const part=(id:string)=>({id,title:"A small step",text:"Pause and breathe.",reference:null,practical:null});
const full=(parts:unknown[],faith_story=false)=>({mode:"full",grounding:null,question:null,parts,faith_story});
describe("Server chat rules",()=>{
  it("accepts exactly 2,000 characters",()=>expect(cleanMessage("a".repeat(2000))).toHaveLength(2000));
  it("rejects 2,001 characters",()=>expect(()=>cleanMessage("a".repeat(2001))).toThrow());
  it("removes hidden control characters",()=>expect(cleanMessage("  hello\u200b  ")).toBe("hello"));
  it.each(["suicide","self harm","abuse","danger","emergency"])("flags %s in the keyword safety net",word=>expect(keywordCrisis(word)).toBe(true));
  it("does not flag an ordinary hard day",()=>expect(keywordCrisis("I feel overwhelmed with work today")).toBe(false));
  it("omits verses entirely when off",()=>expect(validReply(full([part("picture"),part("phenomenon"),part("next"),{...part("verse"),reference:"Psalm 23:1",practical:"Rest a moment."}]),{story_on:false,verse_on:false},false)).toBeNull());
  it("rejects unsolicited faith with verses off",()=>expect(validReply({mode:"steady",grounding:"Pray to God.",question:"What next?",parts:[],faith_story:false},{verse_on:false,story_on:false},false)).toBeNull());
  it("accepts no-verse full replies",()=>expect(validReply(full([part("picture"),part("phenomenon"),part("next")]),{verse_on:false,story_on:false},false)).not.toBeNull());
  it("requires reference and practical sentence with verse on",()=>expect(validReply(full([part("picture"),part("phenomenon"),part("next"),part("verse")]),{verse_on:true,story_on:false},true)).toBeNull());
  it("drops verse when a faith story was told",()=>expect(validReply(full([part("picture"),part("phenomenon"),part("story"),part("next")],true),{verse_on:true,story_on:true},true)).not.toBeNull());
  it("rejects a named condition claim",()=>expect(validReply({mode:"steady",grounding:"You have depression.",question:"What next?",parts:[],faith_story:false},{verse_on:false,story_on:false},false)).toBeNull());
  it("rejects banned words",()=>expect(validReply({mode:"steady",grounding:"Try therapy.",question:"What next?",parts:[],faith_story:false},{verse_on:false,story_on:false},false)).toBeNull());
});