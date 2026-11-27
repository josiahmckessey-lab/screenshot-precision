# Paused chat rules

These apply when the paused chat code is restored.

- Chat is a final-validated typed RPC in `chat.functions.ts` with server-only Claude streaming helpers; no unvalidated generated text is exposed before safety/output checks. The explicit project override uses direct Anthropic Messages calls, reads its credential only inside the authenticated handler, and reads native model IDs from server-only configuration, avoiding gateway routing.
- Daily budgets use atomic database reservations and settlement, reading the per-request reservation from app_config and retaining it after uncertain failures; authenticated keyword safety returns before configuration, provider blocks, caps, or rate limits, with text-free event recording and settlement unable to suppress safety.
- Exchange persistence rechecks saving under a profile row lock and commits both messages together; safety messages only create text-free crisis events.
- Provider access blocks persist in the server-only AI access state until an owner clears them after restoring access; no automatic retries or model substitutions.
- Privacy acknowledgement is versioned and required for chat; the one-time verse offer is stored on the profile so skip/reloads cannot opt people in.
- Library selection lives in a server-only helper: load core/index by slug, enforce active and explicitly invited faith stories, select faith/deep supplements, and force steady mode to entry 4 only; this prevents model-selected identifiers from bypassing retrieval rules.
