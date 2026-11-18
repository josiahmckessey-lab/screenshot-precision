# Roadmap

- [ ] Guide message form: optional reply and session question, insert-only storage, Resend notification, device/hour and atomic daily caps, honeypot and crisis panel; verify saved message and email delivery.

- [x] Keep results at /ideas in session storage, preserve topic return links, replace minute limit with three-second pause, raise sorter cap to 1500, and add another question plus direct guide message access; browser verified back/reload, replacement, start over, guide draft and mobile crisis help.

- [x] Adjust testing token cap to 600,000 and configurable reservation to 30,000, preserving other caps; cap/provider-block safety checks passed, plus a real ordinary reply, fixed safety response, and crisis help during processing on desktop/phone. All 66 tests passed.

- [x] Part 4: single-session chat using Chat UI composition, always-visible crisis help and safety page, per-card deeper explanations, story skip, and mode-specific replies. Real full reply and all three deeper levels verified on desktop/phone; further live checks stopped at the daily cap.

- [x] Update server-only library selection: core/index slugs, active and explicitly invited faith stories, faith/deep entries, and steady entry 4; selection tests passed and a signed-in ordinary steady reply returned with saving off.

- [x] Switch chat to direct Anthropic with a server-only ANTHROPIC_API_KEY and the requested model configuration; both models and signed-in safety flow verified, with 30 checks passing.

- [x] Part 1: Foundation — tables + privacy rules, magic-link sign-in, 18+ step, welcome with AI notice, settings/consent, home-screen install, placeholder library rows
- [x] Part 2: Welcome, age confirmation before email sign-in, optional saving and de-identified builder review consent, versioned consent records
- [x] Signed-in consent verification
- [x] Part 3: Server chat function — authenticated limits, crisis classifier and keywords, library routing, structured replies, validation, consent-only saving, usage accounting
- [x] Disclose outside AI-provider retention and add the one-time, opt-in Bible verse step after consent
- [x] Verify live Haiku classifier/routing and Sonnet structured-output calls with synthetic input; authenticated safety reply and usage accounting
- [x] Verify ordinary replies with the real imported library and saving off through the authenticated chat function.
- [x] Enable the reply box and verify ordinary replies through the signed-in chat screen.
- [x] Saved-exchange check dropped: chat paused, app is now a read-only library.
- [ ] Real app name (using "Daybreak" for now) — waiting on user
- [x] Read-only library: no accounts, chat paused in paused-chat/, local 18+ screen, About + Safety, crisis button everywhere.
- [x] Guide page at /guide built with the exact wording and footer links from home and topic pages; guide name "Josiah", phone (407) 243-8448 and JosiahMcKessey@proton.me shown as call/mail links.
- [x] Guide page reply-time line: "Will respond when the message is seen. Every message is read ahead of everything else."
- [x] Question box: "Ideas that relate" — match_topics server function (direct Anthropic, claude-haiku-5-5, 300/day cap in app_config), validated topic cards with home_line + Know more, guide line + Start over, crisis panel above cards, new notice text. Verified live: model-picked cards, model-set crisis panel on text with no local danger words, on-device keyword fallback when the reply is unusable, capped path falls back to keywords and the crisis panel still shows, one-per-minute device limit, no cookies.
