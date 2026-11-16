// Plain-language consent text shown to the person. The server records the
// current text version from app config whenever consent changes.
export const CONSENT_TEXT = {
  age: "I am 18 or older.",
  save: {
    title: "Save my conversations in my account so I can come back to them.",
    body: "Optional and off by default. When off, nothing from your conversations is stored. You can change this any time.",
  },
  share: {
    title: "Let the builder read my conversations, with my name and email removed, to improve the app.",
    body: "Optional and off by default. Available only when saving is on. Turning saving off also turns this off.",
  },
} as const;

export const CONSENT_VERSION = "v2";
export const AGE_ACCEPTED_KEY = "daybreak-age-v2";
export const ADULTS_ONLY = "This app is for adults 18 and older. Please confirm your age to continue.";
