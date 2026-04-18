# DocAnalyzer Research Desk Redesign

## Goal

Bring DocAnalyzer into the new Labs visual system with a calmer, reading-oriented interface that fits document review better than the older bright utility styling.

## Chosen direction

Use a dark research-desk treatment:

- quieter upload and preview surface
- softer metadata framing
- side notes that feel like research context instead of app chrome
- results presented as calm insight blocks for summary and key points

## Scope

- Update `src/components/apps/DocAnalyzerApp.jsx` to regroup the tool into intake, preview, and results zones
- Rebuild `src/components/apps/DocAnalyzerApp.css` around the Labs token system
- Preserve the existing document handling and analysis logic

## Non-goals

- No API or workflow rewrite
- No change to document analysis behavior
- No backend changes

## Verification

- `npm run build`
