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

- Server logic uses TanStack `createServerFn` (in `src/lib/*.functions.ts`), not Supabase Edge Functions — the brief's "Edge Functions" maps to these.
- `brain_chunks`, `app_config`, `spend_ledger` have RLS on with no user policies and no anon/authenticated grants; read them only via `supabaseAdmin` loaded inside a handler after auth. Never import their contents into browser code (enforced by `src/test/product-rules.test.ts`).
- Every user-owned table uses a plain `user_id uuid` and own-row RLS; only `profiles` references `auth.users`. Conversation/message inserts require `public.can_save(auth.uid())`.
- Consent changes use the authenticated `change_consent` RPC through server functions; a profile trigger logs changes atomically and enforces the saving dependency, so direct writes cannot skip logging. The RPC rejects stale displayed text versions against `app_config`.
- Public welcome and direct auth entry use the same age step; the signed-in AgeGate records the pre-sign-in confirmation, and the named consent route precedes home until choices are reviewed, so optional choices cannot be skipped on first launch.
- Sign-in is email magic link only (`signInWithOtp`); `/_authenticated` is a client-only gate; the 18+ step is `AgeGate` wrapping each signed-in page.
- User-facing copy lives in `src/lib/brand.ts` / `src/lib/consent-text.ts`; banned-word check runs in `src/test/product-rules.test.ts`.
- Installable via manifest only (`public/manifest.webmanifest`); no service worker unless offline is requested.
- Chat is a final-validated typed RPC in `chat.functions.ts` with server-only Claude streaming helpers; no unvalidated generated text is exposed before safety/output checks. The explicit project override uses direct Anthropic Messages calls, reads its credential only inside the authenticated handler, and reads native model IDs from server-only configuration, avoiding gateway routing.
- Daily budgets use atomic database reservations and settlement, with conservative reservation retained after uncertain failures, preventing concurrent calls from overspending.
- Exchange persistence rechecks saving under a profile row lock and commits both messages together; safety messages only create text-free crisis events.
- Provider access blocks persist in the server-only AI access state until an owner clears them after restoring access; no automatic retries or model substitutions.
- Privacy acknowledgement is versioned and required for chat; the one-time verse offer is stored on the profile so skip/reloads cannot opt people in.
- Library selection lives in a server-only helper: load core/index by slug, enforce active and explicitly invited faith stories, select faith/deep supplements, and force steady mode to entry 4 only; this prevents model-selected identifiers from bypassing retrieval rules.
- Chat uses AI Elements conversation/message/composer primitives with the existing final-validated RPC, rather than exposing streamed unvalidated text; session history stays in memory and database writes remain consent-controlled. Card expansion returns only the requested part and adds deep material at levels 2–3.
