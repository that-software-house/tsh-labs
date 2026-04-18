# ContentForge AI Writing Studio Redesign

## Goal

Bring ContentForge into the new Labs dark visual system so it feels like a native AI writing tool rather than a separate light-themed demo surface.

## Chosen direction

Use a dark AI writing studio treatment:

- studio header instead of a marketing hero
- briefing-focused intake panels
- format routing panels for platform selection
- a draft review surface for generated outputs
- consistent dark panels, restrained accent usage, and stronger editorial hierarchy

## Scope

- Update `src/components/apps/ContentForgeApp.jsx` to create a stronger brief-to-draft structure
- Rebuild `src/components/apps/ContentForgeApp.css` around the Labs token system
- Patch the child ContentForge components so tabs, selectors, generated output, and carousel previews inherit the same system

## Non-goals

- No change to the generation API flow
- No change to content format logic
- No product-level workflow rewrite

## Verification

- `npm run build`
