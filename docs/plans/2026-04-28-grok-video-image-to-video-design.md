# Grok Video Image-to-Video

## Goal

Add a new authenticated Labs app that takes a still image, lets the user choose a 5s or 10s duration, and generates a Grok video with an in-app preview.

## Chosen direction

Use a thin React client with a server-side job API:

- the frontend uploads the image and starts a job
- the backend submits image-to-video generation to xAI
- the frontend polls a status endpoint until the video is ready
- the finished video is shown in-app only for v1

## Scope

- Add a new Labs app surface and register it in the showcase
- Add authenticated `POST` and `GET` job routes in `tsh-labs-api`
- Enforce sign-in in both the client UI and server route
- Return the temporary xAI video URL for playback when generation completes

## Non-goals

- No Supabase persistence for jobs or video files
- No WebSockets or SSE in v1
- No prompt editor in v1; use a fixed internal animation prompt

## Verification

- `npm run build` in `tsh-labs`
- Smoke-check the new API route shape in `tsh-labs-api`
