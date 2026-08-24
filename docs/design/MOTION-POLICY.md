# Motion Policy

- Motion supports orientation and feedback; it never carries required information.
- Standard duration: 240 ms; fast duration: 160 ms.
- Allowed: opacity/transform transitions, focused-card lift, restrained ecosystem drift after performance review.
- Disallowed: autoplay video in the hero, scroll hijacking, looping motion that obscures content, and WebGL without a static equivalent.
- `prefers-reduced-motion: reduce` disables nonessential transitions.
- Advanced motion must remain optional, fit the page performance budget, and pass keyboard/mobile testing before release.
- Any advanced effect needs a static first-render equivalent, a reduced-motion fallback, no loss of semantic content, and a rollback path in an isolated component commit.
