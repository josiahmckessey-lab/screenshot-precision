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
- Lamp illustration and compact wordmark share one browser-safe SVG module and global color tokens, keeping the age and home drawings consistent without outside image requests.

- Server logic uses TanStack `createServerFn` (in `src/lib/*.functions.ts`), not Supabase Edge Functions — the brief's "Edge Functions" maps to these.
- `brain_chunks`, `app_config`, `spend_ledger` have RLS on with no user policies and no anon/authenticated grants; read them only via `supabaseAdmin` loaded inside a handler after auth. Never import their contents into browser code (enforced by `src/test/product-rules.test.ts`).
- Every user-owned table uses a plain `user_id uuid` and own-row RLS; only `profiles` references `auth.users`. Conversation/message inserts require `public.can_save(auth.uid())`.
- Consent changes use the authenticated `change_consent` RPC through server functions; a profile trigger logs changes atomically and enforces the saving dependency, so direct writes cannot skip logging. The RPC rejects stale displayed text versions against `app_config`.
- Shared user-facing copy and the single app-name constant live in `src/lib/brand.ts`; editable welcome/About content lives in `src/content/about.ts`, with framework questions read from active library pages to avoid duplicated question text.
- Starter question text, topic mappings and selection live in one editable content module and render as TanStack links through the shared question box; select after hydration and retain each page's examples in device memory for browser-back navigation, without changing drafts, sending or writing storage.
- Installable via the `/manifest.webmanifest` server route using shared brand name and description constants; all page/social descriptions use the same description constant; home/root preview titles use the shared comma-joined title, keeping browser and installed copy in sync. No service worker unless offline is requested.
- Capture browser installation offers in a root provider outside the age and welcome gates; render the hint only on home after those gates, with dismissal stored as a device-only flag, so early offers survive without introducing network calls.
- Chat is a final-validated typed RPC in `chat.functions.ts` with server-only Claude streaming helpers; no unvalidated generated text is exposed before safety/output checks. The explicit project override uses direct Anthropic Messages calls, reads its credential only inside the authenticated handler, and reads native model IDs from server-only configuration, avoiding gateway routing.
- Daily budgets use atomic database reservations and settlement, reading the per-request reservation from app_config and retaining it after uncertain failures; authenticated keyword safety returns before configuration, provider blocks, caps, or rate limits, with text-free event recording and settlement unable to suppress safety.
- Exchange persistence rechecks saving under a profile row lock and commits both messages together; safety messages only create text-free crisis events.
- Provider access blocks persist in the server-only AI access state until an owner clears them after restoring access; no automatic retries or model substitutions.
- Privacy acknowledgement is versioned and required for chat; the one-time verse offer is stored on the profile so skip/reloads cannot opt people in.
- Library selection lives in a server-only helper: load core/index by slug, enforce active and explicitly invited faith stories, select faith/deep supplements, and force steady mode to entry 4 only; this prevents model-selected identifiers from bypassing retrieval rules.
- Chat uses AI Elements conversation/message/composer primitives with the existing final-validated RPC, rather than exposing streamed unvalidated text; session history stays in memory and database writes remain consent-controlled. Card expansion returns only the requested part and adds deep material at levels 2–3.
- The app is a read-only library with no accounts: the paused AI chat, sign-in, consent and settings code lives in root `paused-chat/` (outside `src/`, so it is never routed, bundled, linted or tested); restore from there instead of rewriting.
- The 18+ gate and one-time intro eligibility live in `__root.tsx` and read device local storage only (`/safety` stays reachable); content pages use `AppShell`, while the full-screen intro shares its wordmark and crisis button to keep safety visible without navigation interrupting the sequence.
- Ideas persist typed text, validated ordered topic numbers and crisis state in device session storage; the dedicated ideas route and explicit topic origin search field preserve navigation without server result history.
- Guide submissions use a validated public server function and an atomic capped insert RPC; save before Resend notification and acknowledge saved messages even if email fails, without logging or reading message text back.
- Questions are saved by calling the `submit_question` RPC (topic slug or null, plus body) instead of inserting into `questions`, so the daily limit lives in the database and a null return is handled as a save failure.
- Privacy paragraphs live in `src/content/privacy.ts` and render through the shared shell; shared form-notice links point to `/privacy` without altering existing notices.
- Optional deeper topic rows load with `maybeSingle` and fail closed to null; the chooser stores state only in its component, so missing data preserves existing pages and no device history is added.
