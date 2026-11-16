// Plain-language consent text shown to the person. The server records the
// current text version from app config whenever consent changes.
export const CONSENT_TEXT = {
  age: "I confirm I am 18 or older.",
  save: {
    title: "Save my conversations",
    body: "Off by default. When on, your messages and replies are kept so you can come back to them. Turn it off any time.",
  },
  share: {
    title: "Allow sharing",
    body: "Off by default. Nothing you write is ever shared unless you turn this on.",
  },
} as const;
