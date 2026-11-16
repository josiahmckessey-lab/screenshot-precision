// Plain-language consent text shown to the person. The server records the
// current text version from app config whenever consent changes.
export const CONSENT_TEXT = {
  age: "I am 18 or older.",
  save: {
    title: "Save my conversations in my account so I can come back to them.",
    body: "Optional and off by default. When off, we do not save your conversations in your account. The outside AI provider may still keep messages for a limited time under its own policy. You can change this any time.",
  },
  share: {
    title: "Let the builder read my conversations, with my name and email removed, to improve the app.",
    body: "Optional and off by default. Available only when saving is on. Turning saving off also turns this off.",
  },
} as const;

export const CONSENT_VERSION = "v3";
export const AGE_VERSION = "v2";
export const VERSE_TITLE = "Include a Bible verse with replies";
export const VERSE_OFFER = "Some people like a verse with their reply. You can turn this on or off any time.";
export const AGE_ACCEPTED_KEY = "daybreak-age-v2";
export const ADULTS_ONLY = "This app is for adults 18 and older. Please confirm your age to continue.";
