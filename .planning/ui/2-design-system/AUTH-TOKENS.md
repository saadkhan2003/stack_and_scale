# Auth Tokens (WS10)

Tokens used by the sign-in slice, all from `packages/ui/src/tokens.css`:

| Token                 | Use                                     |
| --------------------- | --------------------------------------- |
| `--ss-color-night`    | Primary button background               |
| `--ss-color-sand`     | Text on night / page background pairing |
| `--ss-color-ink`      | Headings on light surface               |
| `--ss-color-muted`    | Provider/legal notes                    |
| `--ss-color-petrol`   | Card border accent / focus context      |
| `--ss-radius-card`    | Sign-in card corners                    |
| `--ss-radius-control` | Button pill radius                      |
| `--ss-space-card`     | Card padding                            |
| `--ss-space-control`  | Input/button spacing                    |
| `--ss-border-subtle`  | Card + input borders                    |
| `--ss-shadow-card`    | Sign-in card elevation                  |
| `--ss-focus-ring`     | Visible focus on input + button         |

Motion: `--ss-motion-fast` for button hover only; respect `prefers-reduced-motion`.

No new tokens introduced for this slice. Any future auth-specific token must land in `packages/ui/src/tokens.css` first.
