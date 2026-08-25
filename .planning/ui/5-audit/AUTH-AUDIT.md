# Auth Audit (WS10)

## Accessibility

- Single `h1` labelled by `signin-heading`; form uses explicit `<label for>` association.
- Email input: `type="email"`, `autocomplete="email"`, `required` — native validation before submit.
- Focus ring from `--ss-focus-ring` applies to input and button via global `:focus-visible` rule.
- Color pairings (sand-on-night, ink-on-light) meet contrast; muted notes used for non-essential text only.

## Security posture

- No password field, no client-side credential handling, no fake success states.
- Only action is POST to the OIDC start endpoint; provider owns authentication.
- Legal note discloses restricted access and logging.

## Consistency

- Tokens exclusively from `packages/ui/src/tokens.css`; no ad-hoc colors/radii introduced.
- Content centralized and validated; view has zero hardcoded strings.

## Known gaps / follow-ups

- `globals.css` has no `.signin` styles yet (file not owned) — shell relies on generic classes until a styling WS lands them.
- Callback/session handling out of scope; endpoint `/api/auth/oidc/start` owned by backend WS.
