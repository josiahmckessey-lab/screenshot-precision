<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Appearance colors live in global semantic tokens and dedicated button variants; fonts are imported from installed font packages so external font services are never requested.
- Lamp illustration and compact wordmark share one browser-safe SVG module and global color tokens; the large drawing belongs on age and home screens, while AppShell hides only the home header mark and reserves its space to keep the brand text fixed.

- Server logic uses TanStack `createServerFn` (in `src/lib/*.functions.ts`), not Supabase Edge Functions — the brief's "Edge Functions" maps to these.
- `brain_chunks`, `app_config`, `spend_ledger` have RLS on with no user policies and no anon/authenticated grants; read them only via `supabaseAdmin` loaded inside a handler after auth. Never import their contents into browser code (enforced by `src/test/product-rules.test.ts`).
- Every user-owned table uses a plain `user_id uuid` and own-row RLS; only `profiles` references `auth.users`. Conversation/message inserts require `public.can_save(auth.uid())`.
- Consent changes use the authenticated `change_consent` RPC through server functions; a profile trigger logs changes atomically and enforces the saving dependency, so direct writes cannot skip logging. The RPC rejects stale displayed text versions against `app_config`.
- Shared user-facing copy and the single app-name constant live in `src/lib/brand.ts`; editable welcome/About content lives in `src/content/about.ts`, with framework questions read from active library pages to avoid duplicated question text.
- Starter questions and topic mappings live in one editable content module and render as a full list on /examples; QuestionBox picks its chips after mount (never during render, so SSR matches), and a chip only fills the textarea without sending or writing storage.
- Installable via the `/manifest.webmanifest` server route using shared brand name and description constants; all page/social descriptions use the same description constant; home/root preview titles use the shared comma-joined title, keeping browser and installed copy in sync. No service worker unless offline is requested.
- Capture browser installation offers outside the age and welcome gates; show the hint on About with device-only dismissal so early offers survive.
- Chat uses AI Elements conversation/message/composer primitives with the existing final-validated RPC, rather than exposing streamed unvalidated text; session history stays in memory and database writes remain consent-controlled. Card expansion returns only the requested part and adds deep material at levels 2–3.
- The app is a read-only library with no accounts: the paused AI chat, sign-in, consent and settings code lives in root `paused-chat/` (outside `src/`, so it is never routed, bundled, linted or tested); restore from there instead of rewriting.
- The 18+ gate and one-time intro eligibility live in `__root.tsx` and read device local storage only (`/safety` stays reachable); AppShell owns footer crisis help and the care notice, while the full-screen intro places crisis help below Skip outside the advance control.
- The results lead in types out only while the device session fresh flag set by QuestionBox is present and motion is allowed, with the full line always in the page for screen readers. Ideas persist typed text, validated ordered topic and saying numbers, fit and crisis state in device session storage with legacy compatibility; public library reads for results use a server function in the existing sorter module so only stored library text can be shown.
- Guide submissions use a validated public server function and an atomic capped insert RPC; save before Resend notification and acknowledge saved messages even if email fails, without logging or reading message text back.
- Questions are saved by calling the `submit_question` RPC (topic slug or null, plus body) instead of inserting into `questions`, so the daily limit lives in the database and a null return is handled as a save failure.
- Privacy paragraphs live in `src/content/privacy.ts` and render through the shared shell; shared form-notice links point to `/privacy` without altering existing notices.
- Optional deeper rows use `maybeSingle`, fail closed and redirect missing sayings to the topic. Validated topic search params retain reading, fit, chooser and disclosures via replace without scroll reset; history restores the reading lane.
- Shared Back uses in-app history indices and parent fallbacks with router scroll restoration to avoid leaving the library.
- The /ask route validates scope against active topics and reuses QuestionBox to keep submissions unchanged.
- Kept items store only one validated topic slug, title and timestamp on the device; the home check back reads storage after hydration and fetches only active public try text, with answers kept in component state and no reminders or tracking.
- Guided walk: `walk-load.ts` orders active walk rows joined to active pages; step and done are validated search params, answers stay in component state, and `walk.ts` keeps only the next step on the device. `TopicCards` is shared with topic pages to prevent drift.
