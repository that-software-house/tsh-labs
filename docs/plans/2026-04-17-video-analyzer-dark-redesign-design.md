# Video Analyzer Dark Redesign

## Goal

Bring the Video Analyzer tool into the new Labs visual system so it no longer reads like a legacy white-card app embedded inside the darker public gallery shell.

## Chosen direction

Use an immersive dark studio layout rather than a light reskin. Keep the existing workflows and API behavior intact while rebuilding the app surface around:

- a stronger hero and control deck
- darker sectional panels
- clearer hierarchy between workflow, source, configuration, and actions
- a side rail for state, source, and access guidance
- result panels that match the Labs shell aesthetic

## Scope

- Update `src/components/apps/VideoAnalyzerApp.jsx` for better grouping and section structure
- Rebuild `src/components/apps/VideoAnalyzerApp.css` around the Labs token system in `src/index.css`
- Preserve existing child component behavior and only restyle through shared class names

## Non-goals

- No workflow rewrite
- No API changes
- No change to frame extraction, summary generation, content generation, or viral clip logic

## Verification

- `npm run build`
