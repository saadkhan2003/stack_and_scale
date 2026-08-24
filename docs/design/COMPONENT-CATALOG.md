# Component Catalog

The local review surface is available at `/design-system` during development. It is excluded from search indexing and shows the approved action, secondary action, dark surface and keyboard-focus treatments.

## Foundation delivered in Phase 02

- token package: colors, semantic surfaces/text, spacing, borders, radius, shadow, breakpoints, motion and z-index layers
- action styles: primary and secondary buttons with a 44 px minimum target
- navigation: desktop links and a native compact disclosure menu
- cards: light and dark surface reference treatments
- focus and reduced-motion behavior

## Planned feature primitives

Forms, dialogs, toasts, media frames and loading states will be added with the feature that needs them, inside `packages/ui` first. No third-party component registry stylesheet or runtime is used directly by an app.

## Review checklist

- Tab through the primary and compact navigation.
- Enable reduced motion at operating-system level and confirm no required information changes.
- Review Canvas/Ink and Night/Sand body-copy contrast through the automated token test.
- Check compact, tablet and wide viewports before merging a component change.
