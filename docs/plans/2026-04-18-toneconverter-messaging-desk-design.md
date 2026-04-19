Tone Converter redesign direction: calmer messaging desk.

Goals:
- move the app out of the older light utility-card treatment
- align the tool with the dark Labs shell used by the updated gallery apps
- keep the workflow simple: choose a tone, paste a draft, convert, copy

Visual direction:
- a restrained dark drafting surface with softer contrast than Video Analyzer
- a messaging-oriented header instead of a promotional hero
- tone selection presented as a quiet mode switchboard rather than bright tiles
- paired input/output panels that feel like a writing desk with clearer hierarchy

Implementation notes:
- preserve the current API integration and app behavior
- add lightweight derived stats for input and output length
- keep fallback empty and error states visually consistent with the new shell
- maintain responsive behavior for mobile without changing the underlying workflow
