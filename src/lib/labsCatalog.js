export const labsCatalog = [
  {
    id: 'leadflow',
    num: '01',
    name: 'LeadFlow AI',
    tag: 'Lead capture and triage',
    blurb:
      'Auto-structure inbound emails, forms, and DMs into a lightweight pipeline with next-step suggestions.',
    category: 'Revenue',
    status: 'live',
    price: 'Free',
    users: '2,418',
    usersLabel: 'leads / month',
    social: 'Built for solo operators',
    public: true,
    complete: true,
    featured: true,
    authRequired: true,
    accent: '#D4F542',
    headline:
      'Turn messy inbound messages into qualified pipeline without doing manual CRM cleanup.',
    subhead:
      'Paste a lead message, let the extractor structure it, and keep the board organized only when you choose to sign in.',
    manifest: [
      ['Input', 'Email, DM, or form text'],
      ['Output', 'Structured lead record + pipeline stage'],
      ['Best for', 'Freelancers, agencies, founder-led sales'],
      ['Auth', 'Only required to save leads'],
    ],
    stats: [
      ['4 mins', 'saved per lead'],
      ['4 stages', 'default board'],
      ['0 setup', 'to try the parser'],
      ['Live', 'shipping now'],
    ],
  },
  {
    id: 'invoicechaser',
    num: '02',
    name: 'Invoice Chaser',
    tag: 'Collections workflow',
    blurb:
      'Upload invoice exports, prioritize overdue accounts, and generate friendly, firm, or final follow-up drafts.',
    category: 'Operations',
    status: 'live',
    price: 'Free + upgrade',
    users: '611',
    usersLabel: 'queues / month',
    social: 'Built around real collections work',
    public: true,
    complete: true,
    featured: true,
    authRequired: true,
    accent: '#FFB347',
    headline:
      'Prioritize who to chase, draft the right follow-up, and keep the action log in one place.',
    subhead:
      'The queue stays public to explore, but uploads and saved document history are tied to your account.',
    manifest: [
      ['Input', 'CSV, XLSX, JSON, or invoice export'],
      ['Output', 'Risk-ranked queue + message drafts'],
      ['Best for', 'Finance ops and agencies'],
      ['Auth', 'Required for uploads and history'],
    ],
    stats: [
      ['$48k', 'sample queue value'],
      ['3 tones', 'ready to send'],
      ['10/day', 'guest AI requests'],
      ['Pro', 'for unlimited uploads'],
    ],
  },
  {
    id: 'docanalyzer',
    num: '03',
    name: 'DocAnalyzer',
    tag: 'Document intelligence',
    blurb:
      'Upload a file and get a quick summary, key points, and copy-ready analysis from a single pass.',
    category: 'Research',
    status: 'live',
    price: 'Free',
    users: '1,384',
    usersLabel: 'docs / month',
    social: 'Works with text, docs, and images',
    public: true,
    complete: true,
    featured: false,
    authRequired: false,
    accent: '#D4F542',
    headline:
      'Turn raw documents into readable summaries without building a full research workflow.',
    subhead:
      'Useful for PDFs, DOCX, screenshots, and quick briefs when you only need the extraction and the key points.',
    manifest: [
      ['Input', 'PDF, DOCX, TXT, markdown, image'],
      ['Output', 'Summary + key points'],
      ['Best for', 'Research intake and fast review'],
      ['Auth', 'Optional'],
    ],
    stats: [
      ['10MB', 'file limit'],
      ['5-7', 'key points returned'],
      ['Images', 'supported'],
      ['Fast', 'single-pass analysis'],
    ],
  },
  {
    id: 'videoanalyzer',
    num: '04',
    name: 'Video Analyzer',
    tag: 'Frame extraction and recap',
    blurb:
      'Pull key frames from uploaded videos or YouTube links, then generate summaries and content hooks from the selected shots.',
    category: 'Content',
    status: 'live',
    price: 'Free',
    users: '923',
    usersLabel: 'videos / month',
    social: 'Auth unlocks higher-quality extraction',
    public: true,
    complete: true,
    featured: true,
    authRequired: true,
    accent: '#D4F542',
    headline:
      'Extract the frames that matter, then generate recap content from the moments worth keeping.',
    subhead:
      'Guests can use the core workflow. Signing in unlocks high-resolution frame quality and premium paths already built into the tool.',
    manifest: [
      ['Input', 'Video upload or YouTube URL'],
      ['Output', 'Frames, recap, social content'],
      ['Best for', 'Podcasts, webinars, long-form video'],
      ['Auth', 'Only for premium extraction modes'],
    ],
    stats: [
      ['15', 'max frame picks'],
      ['2 modes', 'frames or viral clips'],
      ['YouTube', 'metadata aware'],
      ['Live', 'shipping now'],
    ],
  },
  {
    id: 'contentforge',
    num: '05',
    name: 'ContentForge',
    tag: 'Long-form to social',
    blurb:
      'Transform source content into LinkedIn posts, Twitter threads, and carousel-ready output in one run.',
    category: 'Content',
    status: 'live',
    price: 'Free',
    users: '1,102',
    usersLabel: 'jobs / month',
    social: 'Built on the content agents stack',
    public: true,
    complete: true,
    featured: false,
    authRequired: false,
    accent: '#D4F542',
    headline:
      'Take an article, transcript, or prompt and turn it into platform-ready publishing assets.',
    subhead:
      'This is the utility version of the TSH content pipeline: pick the formats, send the source, and get structured output back.',
    manifest: [
      ['Input', 'Text, URL, or source content'],
      ['Output', 'LinkedIn, Twitter, carousel'],
      ['Best for', 'Repurposing and editorial ops'],
      ['Auth', 'Optional'],
    ],
    stats: [
      ['3 formats', 'in one pass'],
      ['URL', 'ingestion supported'],
      ['Free', 'daily guest quota'],
      ['Live', 'shipping now'],
    ],
  },
  {
    id: 'datainsights',
    num: '06',
    name: 'Data Insights',
    tag: 'Charts plus memo',
    blurb:
      'Upload CSV, JSON, or spreadsheet files and get schema analysis, chart recommendations, and a written summary.',
    category: 'Analytics',
    status: 'live',
    price: 'Free',
    users: '807',
    usersLabel: 'datasets / month',
    social: 'Good for lightweight BI',
    public: true,
    complete: true,
    featured: false,
    authRequired: false,
    accent: '#D4F542',
    headline:
      'Make a raw dataset legible without opening a heavyweight BI stack.',
    subhead:
      'The pipeline parses the data, surfaces anomalies, and recommends chart shapes that are actually grounded in the schema.',
    manifest: [
      ['Input', 'CSV, JSON, XLSX, XLS'],
      ['Output', 'Preview, insights, charts'],
      ['Best for', 'Ops, internal analytics, quick reviews'],
      ['Auth', 'Optional'],
    ],
    stats: [
      ['1k', 'rows analyzed'],
      ['3-stage', 'analysis pipeline'],
      ['Charts', 'export supported'],
      ['Live', 'shipping now'],
    ],
  },
  {
    id: 'textcleaner',
    num: '07',
    name: 'Text Cleaner',
    tag: 'LLM output cleanup',
    blurb:
      'Normalize hidden characters, spacing, quotes, dashes, and markdown artifacts so pasted AI output reads cleanly.',
    category: 'Writing',
    status: 'live',
    price: 'Free',
    users: '5,942',
    usersLabel: 'cleans / month',
    social: 'Zero-login utility',
    public: true,
    complete: true,
    featured: false,
    authRequired: false,
    accent: '#D4F542',
    headline:
      'Strip the invisible formatting junk out of pasted AI text before it reaches clients, docs, or CMS fields.',
    subhead:
      'A practical cleanup utility for ChatGPT, Claude, or any copied text that looks fine until it breaks formatting downstream.',
    manifest: [
      ['Input', 'Any pasted text'],
      ['Output', 'Normalized plain text'],
      ['Best for', 'Writers, marketers, operators'],
      ['Auth', 'Not required'],
    ],
    stats: [
      ['8', 'cleanup toggles'],
      ['Instant', 'local transform'],
      ['Copy', 'one-click export'],
      ['Open', 'no sign-in'],
    ],
  },
  {
    id: 'toneconverter',
    num: '08',
    name: 'Tone Converter',
    tag: 'Rewrite by register',
    blurb:
      'Rewrite text into professional, casual, friendly, persuasive, confident, empathetic, witty, or academic tones.',
    category: 'Writing',
    status: 'live',
    price: 'Free',
    users: '2,731',
    usersLabel: 'rewrites / month',
    social: 'Eight target tones',
    public: true,
    complete: true,
    featured: false,
    authRequired: false,
    accent: '#D4F542',
    headline:
      'Shift the register of a draft without manually rewriting the whole thing.',
    subhead:
      'Useful for emails, positioning copy, outreach, and anywhere tone matters more than full regeneration.',
    manifest: [
      ['Input', 'Any text block'],
      ['Output', 'Rewritten version by tone'],
      ['Best for', 'Email, messaging, copy passes'],
      ['Auth', 'Optional'],
    ],
    stats: [
      ['8 tones', 'available'],
      ['Side-by-side', 'rewrite flow'],
      ['Copy', 'one-click export'],
      ['Live', 'shipping now'],
    ],
  },
];

export const publicLabsApps = labsCatalog.filter((app) => app.public && app.complete);

export function findLabApp(projectId) {
  return publicLabsApps.find((app) => app.id === projectId) || null;
}

