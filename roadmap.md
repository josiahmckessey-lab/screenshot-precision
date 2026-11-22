# Roadmap

- [x] Add validated closest saying and fit results with compatible device storage, stored saying links, and optional live sorter checks; real saved result navigation verified on phone and desktop, 149 app checks and the final 32 case live evaluation pass. An earlier run missed case 12, so model matches can vary; the supplied instruction and expectations remain unchanged.
- [x] Group all existing and fourteen new starter questions into four groups on the examples page; all 22 links tested, phone layout and loose fit fallback verified without runtime errors.

- [x] Simplify home and question screens, add /examples and the privacy summary, move shared crisis help and care notice to the footer, and close reaching beyond by default; 112 tests pass, phone and desktop navigation checked, automatic crisis panel verified without storing test text, stored content and sorter unchanged.

- [x] Simplify home and topic screens, add safe shared Back navigation and URL restoration, move installation to About, add /ask, and shorten saying lists; 101 tests pass, phone Back restored the exact scroll position and expanded list, loaded saying title and question screen confirmed, desktop checked without overflow.

- [x] Move deeper sayings and endpoint to separate pages, preserve the open chooser on return, and verify navigation, titles, top scroll and missing entries on phone and desktop; all 82 tests pass.

- [x] Add the optional specific topic layer, chooser, endpoint, word definitions and related links; verified topic 10, unchanged topics 1, 9 and 15, phone and desktop, focus retention, safety and navigation, reduced motion and 77 tests.
- [x] Replace the profession name in topic 10 entry 3 with guides as requested; confirmed the stored entry appears unchanged otherwise and all eight choices are available.

- [x] Add device-only installation hint below the home guide card, installation instructions and footer link, and exact privacy wording; verified permanent dismissal, standalone visibility, early browser offer retention and simulated acceptance, phone and desktop navigation, and 68 tests.

- [x] Refine home order and lamp size, center the heading, keep only the inline topics link, announce welcome lines, set coral error colors and black iPhone status bar; all 64 tests passed, desktop/phone layouts and topics navigation checked, four accessible manual welcome lines and completion verified.

- [x] Apply Hearth colors, pill buttons, lamp illustrations and wordmark, welcome wording and fourth manual intro line, plus the home guide card; all 64 tests passed, phone and desktop screenshots checked, four manual lines and reduced motion verified, topics and guide links followed, crisis colors and numbers checked, theme and manifest confirmed, no overflow or outside font requests.

- [x] Add the one-time post-age welcome sequence with local flags, tap/Skip controls, reduced motion, crisis help and home fade; verified all three lines, automatic completion, new/returning/legacy devices, Skip, crisis panel and reduced motion on phone and desktop; 18 tests passed. Explicit per-line timings total 9.6 seconds before the home fade.

- [x] Apply Lamplight colors and locally hosted Literata headings only; replaced fixed black overlays in dialog, alert dialog, sheet and drawer with a semantic token, verified all 27 pages and phone layouts, text contrast, confidence labels, question box, crisis controls and local font requests; 28 tests passed.

- [x] Add Privacy page and footer/About/form-notice links without changing existing notices; verified phone/desktop, crisis panel and 34 tests.
- [x] Turn off visitor counting with approval and restore exact supplied Privacy wording. Automatic 12-month deletion was not verified or changed in this page-only request.

- [x] Apply wellbeing-library wording and adult descriptions; verified all 26 content pages, installed description and About anchor, preserved question/guide/About privacy copy, and listed unchanged research occurrences.

- [x] Apply exact research-project wording, welcome and preview tagline, shared research footer link, About anchor, feedback labels, reply-time and error text; verified desktop home, research anchor scroll, installed description, seven phone page footers/crisis buttons without overflow, and 25 focused tests.

- [x] Turn starter questions into mapped topic links with four quiet examples and shuffle; verified home, topic and ideas browser-back restoration on desktop/phone without sending or storage writes, plus 19 focused tests.

- [x] Rename question headings and add four random, editable starter questions to every question box, with different examples and no send/save on selection; verified home, topics and ideas on phone, desktop rendering, no storage writes or sends on selection, and 16 tests passing.

- [x] Rename to The Gift from one constant; add exact home welcome and About content with six ordered groups of live topic questions and guide link; verified all 20 links, phone layout and installed name.

- [x] Guide message form: optional reply and session question, insert-only storage, Resend notification, device/hour and atomic daily caps, honeypot and crisis panel; browser confirmation and saved row verified, Resend reports test email delivered.

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
- [x] Real app name supplied: The Gift.
- [x] Read-only library: no accounts, chat paused in paused-chat/, local 18+ screen, About + Safety, crisis button everywhere.
- [x] Guide page at /guide built with the exact wording and footer links from home and topic pages; guide name "Josiah", phone (407) 243-8448 and JosiahMcKessey@proton.me shown as call/mail links.
- [x] Guide page reply-time line: "Will respond when the message is seen. Every message is read ahead of everything else."
- [x] Theological grounding page at /about/theology: nine stored sections in position order with 19 quoted verses, Back to About links top and bottom, crisis button, and a card on the About page after "What this is"; not linked from home. Verified on phone: click-through, back links, no cookies.
- [x] Question box: "Ideas that relate" — match_topics server function (direct Anthropic, claude-haiku-5-5, 300/day cap in app_config), validated topic cards with home_line + Know more, guide line + Start over, crisis panel above cards, new notice text. Verified live: model-picked cards, model-set crisis panel on text with no local danger words, on-device keyword fallback when the reply is unusable, capped path falls back to keywords and the crisis panel still shows, one-per-minute device limit, no cookies.
