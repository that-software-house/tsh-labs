export const PRODUCT_TRACK = {
  id: 'product',
  name: 'Product / App',
  description: 'SaaS, mobile app, or digital product.',
  categories: [
    {
      id: 'product-readiness',
      name: 'Product Readiness',
      icon: 'Rocket',
      questions: [
        {
          id: 'product-core-feature',
          text: 'Is your core feature built and working?',
          gapMessage: 'Finish and stabilize your core feature before launch traffic hits.',
        },
        {
          id: 'product-user-testing',
          text: 'Have you tested with at least 3-5 real users?',
          gapMessage: 'Run quick user tests now to catch confusion before launch week.',
        },
        {
          id: 'product-bug-feedback-plan',
          text: 'Do you have a plan for bugs and feedback after launch?',
          gapMessage: 'Set up a clear post-launch bug and feedback response workflow.',
        },
        {
          id: 'product-onboarding',
          text: 'Is your onboarding flow clear for first-time users?',
          gapMessage: 'Tighten onboarding so new users can hit value fast.',
        },
        {
          id: 'product-infra-spike',
          text: 'Can your infrastructure handle a traffic spike on launch day?',
          gapMessage: 'Load test and harden infrastructure for launch-day spikes.',
        },
      ],
    },
    {
      id: 'distribution',
      name: 'Distribution & Go-to-Market',
      icon: 'Megaphone',
      questions: [
        {
          id: 'distribution-channels',
          text: 'Do you know the 2-3 specific channels where your target users hang out?',
          gapMessage: 'Pick and prioritize your top acquisition channels before launch.',
        },
        {
          id: 'distribution-audience',
          text: 'Have you built an audience or waitlist before launch?',
          gapMessage: 'Start warming up a waitlist so launch day has real momentum.',
        },
        {
          id: 'distribution-launch-plan',
          text: 'Do you have a launch-day promotion plan (not just "post it and pray")?',
          gapMessage: 'Create a launch-day playbook with timing, copy, and owners.',
        },
        {
          id: 'distribution-partnerships',
          text: 'Have you lined up any partnerships, cross-promos, or influencer mentions?',
          gapMessage: 'Line up at least one amplification partner before you go live.',
        },
        {
          id: 'distribution-follow-up',
          text: 'Do you have a follow-up plan for week 2 and beyond?',
          gapMessage: 'Plan week 2+ campaigns to avoid a launch-day cliff.',
        },
      ],
    },
    {
      id: 'messaging',
      name: 'Landing Page & Messaging',
      icon: 'MessageSquare',
      questions: [
        {
          id: 'messaging-clarity',
          text: 'Can a stranger understand what you do within 5 seconds of landing?',
          gapMessage: 'Rewrite your hero section for instant clarity and relevance.',
        },
        {
          id: 'messaging-value-prop',
          text: 'Is your value prop specific (not generic "we help businesses grow")?',
          gapMessage: 'Sharpen your value proposition with concrete outcomes.',
        },
        {
          id: 'messaging-cta',
          text: 'Do you have a clear, single CTA above the fold?',
          gapMessage: 'Reduce CTA clutter and push one primary action above the fold.',
        },
        {
          id: 'messaging-validation',
          text: 'Have you tested your messaging with people outside your team?',
          gapMessage: 'Validate messaging with outsiders before launch content locks.',
        },
        {
          id: 'messaging-mobile',
          text: 'Does your landing page work well on mobile?',
          gapMessage: 'Polish the mobile experience before traffic starts converting.',
        },
      ],
    },
    {
      id: 'analytics',
      name: 'Analytics & Tracking',
      icon: 'BarChart3',
      questions: [
        {
          id: 'analytics-installed',
          text: 'Do you have analytics installed (Google Analytics, Mixpanel, etc.)?',
          gapMessage: 'Install analytics before launch so you do not lose baseline data.',
        },
        {
          id: 'analytics-events',
          text: 'Are you tracking conversion events (signups, purchases, key actions)?',
          gapMessage: 'Implement conversion events for your key user actions.',
        },
        {
          id: 'analytics-success-metric',
          text: 'Do you know what your success metric is for launch week?',
          gapMessage: 'Define launch-week success metrics and target thresholds.',
        },
        {
          id: 'analytics-traffic-source',
          text: 'Can you tell where your traffic is coming from?',
          gapMessage: 'Enable source attribution to identify your best channels quickly.',
        },
      ],
    },
    {
      id: 'credibility',
      name: 'Social Proof & Credibility',
      icon: 'ShieldCheck',
      questions: [
        {
          id: 'credibility-testimonials',
          text: 'Do you have testimonials, case studies, or beta user quotes?',
          gapMessage: 'Add proof points from real users to increase trust.',
        },
        {
          id: 'credibility-team-info',
          text: 'Does your site have real team/founder info (not anonymous)?',
          gapMessage: 'Add founder/team context to make the product feel trustworthy.',
        },
        {
          id: 'credibility-press',
          text: 'Do you have any press mentions, awards, or notable logos?',
          gapMessage: 'Gather and display external credibility signals where possible.',
        },
        {
          id: 'credibility-trust-signals',
          text: 'Is there any form of trust signal (reviews, security badges, guarantees)?',
          gapMessage: 'Add trust signals that reduce hesitation at decision points.',
        },
      ],
    },
  ],
};

export const WEBSITE_TRACK = {
  id: 'website',
  name: 'Website',
  description: 'Business website, portfolio, or online store.',
  categories: [
    {
      id: 'content-readiness',
      name: 'Content Readiness',
      icon: 'FileText',
      questions: [
        {
          id: 'content-written',
          text: 'Is all your page content written and reviewed?',
          gapMessage: 'Finalize and proofread all page copy before launch day.',
        },
        {
          id: 'content-visuals',
          text: 'Do you have professional photos or quality visuals (not just stock)?',
          gapMessage: 'Upgrade visuals so your brand feels credible and specific.',
        },
        {
          id: 'content-contact-info',
          text: 'Is your contact info accurate and easy to find?',
          gapMessage: 'Fix contact visibility so leads can reach you instantly.',
        },
        {
          id: 'content-about-page',
          text: 'Do you have an About page that tells your story?',
          gapMessage: 'Add a clear About page to build trust and context.',
        },
        {
          id: 'content-services',
          text: 'Are your services/products clearly described with pricing or next steps?',
          gapMessage: 'Clarify service details and the exact next step for buyers.',
        },
      ],
    },
    {
      id: 'seo-fundamentals',
      name: 'SEO Fundamentals',
      icon: 'Search',
      questions: [
        {
          id: 'seo-meta-tags',
          text: 'Does every page have a unique title tag and meta description?',
          gapMessage: 'Set unique page titles and descriptions for search visibility.',
        },
        {
          id: 'seo-google-business',
          text: 'Have you set up Google Business Profile for local search?',
          gapMessage: 'Create or optimize your Google Business Profile for local discovery.',
        },
        {
          id: 'seo-alt-text',
          text: 'Do your images have alt text?',
          gapMessage: 'Add descriptive alt text to improve SEO and accessibility.',
        },
        {
          id: 'seo-site-structure',
          text: 'Is your site structure clean (clear navigation, no orphan pages)?',
          gapMessage: 'Tighten navigation and page hierarchy for users and crawlers.',
        },
        {
          id: 'seo-sitemap',
          text: 'Have you submitted your sitemap to Google Search Console?',
          gapMessage: 'Submit your sitemap in Search Console before launch.',
        },
      ],
    },
    {
      id: 'technical-mobile',
      name: 'Technical & Mobile',
      icon: 'Smartphone',
      questions: [
        {
          id: 'tech-speed',
          text: 'Does your site load in under 3 seconds?',
          gapMessage: 'Improve performance so pages load quickly on real networks.',
        },
        {
          id: 'tech-mobile-ux',
          text: 'Does it look and work properly on phones?',
          gapMessage: 'Fix mobile UX issues before traffic arrives from social/search.',
        },
        {
          id: 'tech-https',
          text: 'Is HTTPS / SSL set up?',
          gapMessage: 'Enable HTTPS to protect users and avoid trust warnings.',
        },
        {
          id: 'tech-links-forms',
          text: 'Do all links and forms actually work (no broken links)?',
          gapMessage: 'Run a full QA sweep of forms, links, and key user paths.',
        },
      ],
    },
    {
      id: 'legal-trust',
      name: 'Legal & Trust',
      icon: 'Scale',
      questions: [
        {
          id: 'legal-privacy',
          text: 'Do you have a Privacy Policy page?',
          gapMessage: 'Publish a privacy policy before collecting visitor data.',
        },
        {
          id: 'legal-terms',
          text: 'Do you have Terms of Service?',
          gapMessage: 'Add terms of service to reduce legal and expectation risk.',
        },
        {
          id: 'legal-compliance',
          text: 'If collecting emails, are you GDPR/CAN-SPAM compliant?',
          gapMessage: 'Add compliant consent and unsubscribe flows for email capture.',
        },
        {
          id: 'legal-testimonials',
          text: 'Do you have real testimonials or reviews visible?',
          gapMessage: 'Show real testimonials to increase trust and conversion.',
        },
      ],
    },
    {
      id: 'lead-analytics',
      name: 'Lead Capture & Analytics',
      icon: 'Target',
      questions: [
        {
          id: 'lead-capture-method',
          text: 'Do you have at least one way to capture leads (form, email signup, chat)?',
          gapMessage: 'Add at least one reliable lead capture method site-wide.',
        },
        {
          id: 'lead-analytics-installed',
          text: 'Is analytics installed and tracking page views?',
          gapMessage: 'Install analytics and verify page view tracking.',
        },
        {
          id: 'lead-conversion-tracking',
          text: 'Do you have conversion tracking set up (form submissions, calls, etc.)?',
          gapMessage: 'Implement conversion tracking for your primary business goals.',
        },
        {
          id: 'lead-primary-action',
          text: 'Do you know what action you want visitors to take?',
          gapMessage: 'Define one primary conversion action per key page.',
        },
        {
          id: 'lead-cta-every-page',
          text: 'Is there a clear CTA on every page?',
          gapMessage: 'Add clear CTAs across pages to reduce drop-off.',
        },
      ],
    },
  ],
};

export const TRACKS = [PRODUCT_TRACK, WEBSITE_TRACK];

const ANSWER_POINTS = {
  yes: 1,
  unsure: 0.5,
  no: 0,
};

const GAP_RESOURCES = {
  product: {
    'product-readiness': { label: 'Launch QA support', href: '/contact' },
    distribution: { label: 'Go-to-market planning help', href: '/contact' },
    messaging: { label: 'Messaging + landing page services', href: '/marketing' },
    analytics: { label: 'Tracking setup support', href: '/data-insights' },
    credibility: { label: 'Brand credibility audit', href: '/contact' },
  },
  website: {
    'content-readiness': { label: 'Website copy + content help', href: '/contact' },
    'seo-fundamentals': { label: 'SEO services', href: '/seo' },
    'technical-mobile': { label: 'Technical website improvements', href: '/services' },
    'legal-trust': { label: 'Website trust audit', href: '/contact' },
    'lead-analytics': { label: 'Try Website Cost Estimator', href: '/website-cost-estimator' },
  },
};

function normalizeTrack(track) {
  if (!track) return null;
  if (typeof track === 'string') {
    return TRACKS.find((item) => item.id === track) || null;
  }
  if (track?.id && Array.isArray(track?.categories)) return track;
  return null;
}

function severityWeight(severity) {
  if (severity === 'high') return 2;
  if (severity === 'medium') return 1;
  return 0;
}

export function getTrackById(trackId) {
  return TRACKS.find((track) => track.id === trackId) || null;
}

export function getTrackCategories(trackId) {
  return getTrackById(trackId)?.categories || [];
}

export function getGapResource(trackId, categoryId) {
  return GAP_RESOURCES[trackId]?.[categoryId] || { label: 'Talk to TSH', href: '/contact' };
}

export function calculateScores(track, answers = {}) {
  const selectedTrack = normalizeTrack(track);

  if (!selectedTrack) {
    return {
      overall: 0,
      categories: [],
      gaps: [],
    };
  }

  const categories = selectedTrack.categories.map((category) => {
    const total = category.questions.length;

    let earned = 0;
    const categoryGaps = [];

    category.questions.forEach((question) => {
      const answer = answers[question.id];
      earned += ANSWER_POINTS[answer] ?? 0;

      if (answer === 'no' || answer === 'unsure') {
        categoryGaps.push({
          question: question.text,
          questionId: question.id,
          categoryId: category.id,
          categoryName: category.name,
          gapMessage: question.gapMessage,
          severity: answer === 'no' ? 'high' : 'medium',
        });
      }
    });

    const score = total > 0 ? Math.round((earned / total) * 100) : 0;

    return {
      id: category.id,
      name: category.name,
      score,
      total,
      gaps: categoryGaps,
    };
  });

  const overall = categories.length > 0
    ? Math.round(categories.reduce((sum, item) => sum + item.score, 0) / categories.length)
    : 0;

  const gaps = categories
    .flatMap((category) => category.gaps)
    .sort((a, b) => {
      const severityDiff = severityWeight(b.severity) - severityWeight(a.severity);
      if (severityDiff !== 0) return severityDiff;
      return a.categoryName.localeCompare(b.categoryName);
    });

  return {
    overall,
    categories: categories.map(({ id, name, score, total }) => ({ id, name, score, total })),
    gaps,
  };
}

export function getScoreLabel(score) {
  if (score < 40) {
    return { label: 'Not ready yet', colorClass: 'launch-score-label--red' };
  }

  if (score < 70) {
    return { label: 'Getting there', colorClass: 'launch-score-label--amber' };
  }

  if (score < 90) {
    return { label: 'Almost launch-ready', colorClass: 'launch-score-label--accent' };
  }

  return { label: "You're ready to ship", colorClass: 'launch-score-label--green' };
}

export function buildActionPlan(trackId, gaps = []) {
  return gaps.map((gap, index) => {
    const resource = getGapResource(trackId, gap.categoryId);

    return {
      id: `${gap.questionId}-${index}`,
      priority: gap.severity === 'high' ? 'Fix this first' : 'Verify this next',
      recommendation: gap.gapMessage,
      categoryName: gap.categoryName,
      question: gap.question,
      resourceLabel: resource.label,
      resourceHref: resource.href,
      severity: gap.severity,
    };
  });
}
