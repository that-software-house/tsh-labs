export const INDUSTRY_OPTIONS = [
  {
    id: 'restaurant',
    label: 'Restaurant / Food',
    description: 'Menus, orders, and reservations.',
    icon: 'Utensils',
  },
  {
    id: 'retail',
    label: 'Retail / Shop',
    description: 'Catalogs, payments, and promos.',
    icon: 'ShoppingBag',
  },
  {
    id: 'services',
    label: 'Professional Services',
    description: 'Credibility and lead capture.',
    icon: 'Briefcase',
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    description: 'Bookings, trust, and clear info.',
    icon: 'Heart',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    description: 'Listings, galleries, and inquiries.',
    icon: 'Home',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'A custom fit for your business.',
    icon: 'Sparkles',
  },
];

export const SITE_SIZE_OPTIONS = [
  {
    id: 'single-page',
    label: 'Single Page',
    description: 'Landing page, all info on one scroll.',
    low: 500,
    high: 800,
  },
  {
    id: 'small-site',
    label: 'Small Site (3-5 pages)',
    description: 'Home, About, Services, Contact.',
    low: 1000,
    high: 2000,
  },
  {
    id: 'medium-site',
    label: 'Medium Site (6-10 pages)',
    description: 'Multiple service pages, team, FAQ.',
    low: 2500,
    high: 4000,
  },
  {
    id: 'large-site',
    label: 'Large Site (10+ pages)',
    description: 'Full content site with many sections.',
    low: 5000,
    high: 8000,
  },
];

export const FEATURE_OPTIONS = [
  {
    id: 'online-store',
    label: 'Online Store',
    description: 'Sell products and accept payments.',
    low: 1500,
    high: 3000,
  },
  {
    id: 'booking',
    label: 'Booking / Scheduling',
    description: 'Let customers reserve time slots.',
    low: 400,
    high: 800,
  },
  {
    id: 'blog',
    label: 'Blog / News',
    description: 'Publish articles and updates.',
    low: 300,
    high: 600,
  },
  {
    id: 'forms',
    label: 'Contact Forms',
    description: 'Custom forms and file uploads.',
    low: 200,
    high: 400,
  },
  {
    id: 'gallery',
    label: 'Photo Gallery / Portfolio',
    description: 'Showcase your work visually.',
    low: 200,
    high: 400,
  },
  {
    id: 'reviews',
    label: 'Customer Reviews',
    description: 'Testimonials and social proof.',
    low: 150,
    high: 300,
  },
  {
    id: 'live-chat',
    label: 'Live Chat',
    description: 'Real-time chat widget for visitors.',
    low: 200,
    high: 400,
  },
  {
    id: 'member-area',
    label: 'Member Area / Login',
    description: 'Accounts and gated content.',
    low: 800,
    high: 1500,
  },
];

export const DESIGN_LEVEL_OPTIONS = [
  {
    id: 'template',
    label: 'Template-Based',
    description: 'Clean and modern template customized to your brand.',
    low: 0,
    high: 0,
  },
  {
    id: 'custom',
    label: 'Custom Design',
    description: 'Unique design, built from scratch.',
    low: 1000,
    high: 2500,
  },
];

export const ADDON_OPTIONS = [
  {
    id: 'seo-setup',
    label: 'SEO Setup',
    description: 'Search optimization and local listing setup.',
    low: 300,
    high: 500,
    pricingType: 'fixed',
  },
  {
    id: 'speed-optimization',
    label: 'Speed Optimization',
    description: 'Core web vitals and performance tuning.',
    low: 200,
    high: 400,
    pricingType: 'fixed',
  },
  {
    id: 'rush-delivery',
    label: 'Rush Delivery',
    description: 'Need it in 2 weeks instead of 4-6.',
    multiplier: 1.3,
    pricingType: 'multiplier',
  },
  {
    id: 'maintenance',
    label: 'Ongoing Maintenance',
    description: 'Monthly updates, backups, and support.',
    low: 100,
    high: 300,
    pricingType: 'monthly',
  },
];

export const COST_TIPS = [
  'Get clear on must-have features first to avoid scope creep.',
  'Prioritize launch version now, then phase in extras later.',
  'Have your branding and copy ready before design starts.',
  'Ask for a content plan if you need help writing pages.',
  'Reserve budget for SEO and ongoing maintenance after launch.',
];

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value || 0)));
}

export function formatRange(low, high, suffix = '') {
  return `${formatCurrency(low)} - ${formatCurrency(high)}${suffix}`;
}

function sumRanges(items) {
  return items.reduce(
    (acc, item) => ({
      low: acc.low + (item?.low || 0),
      high: acc.high + (item?.high || 0),
    }),
    { low: 0, high: 0 },
  );
}

function getOptionById(options, id) {
  if (!id) return null;
  return options.find((option) => option.id === id) || null;
}

function getOptionsByIds(options, ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return ids
    .map((id) => getOptionById(options, id))
    .filter(Boolean);
}

function estimateCore(selections = {}) {
  const siteSize = getOptionById(SITE_SIZE_OPTIONS, selections.siteSize);
  const selectedFeatures = getOptionsByIds(FEATURE_OPTIONS, selections.features);
  const designLevel = getOptionById(
    DESIGN_LEVEL_OPTIONS,
    selections.extras?.designLevel || 'template',
  );
  const selectedAddons = getOptionsByIds(ADDON_OPTIONS, selections.extras?.addons);

  const fixedAddons = selectedAddons.filter((item) => item.pricingType === 'fixed');
  const maintenance = selectedAddons.find((item) => item.id === 'maintenance') || null;
  const rushAddon = selectedAddons.find((item) => item.id === 'rush-delivery') || null;

  const baseItems = [siteSize, ...selectedFeatures, designLevel, ...fixedAddons].filter(Boolean);
  const baseTotals = sumRanges(baseItems);

  let low = baseTotals.low;
  let high = baseTotals.high;
  let rushAmount = { low: 0, high: 0 };

  if (rushAddon) {
    const multiplier = rushAddon.multiplier || 1;
    low = Math.round(low * multiplier);
    high = Math.round(high * multiplier);
    rushAmount = {
      low: Math.round(baseTotals.low * (multiplier - 1)),
      high: Math.round(baseTotals.high * (multiplier - 1)),
    };
  }

  return {
    low,
    high,
    monthlyLow: maintenance?.low || 0,
    monthlyHigh: maintenance?.high || 0,
    hasMaintenance: Boolean(maintenance),
    hasRush: Boolean(rushAddon),
    rushAmount,
    siteSize,
    selectedFeatures,
    designLevel,
    fixedAddons,
  };
}

export function calculateEstimate(selections = {}) {
  const totals = estimateCore(selections);

  return {
    low: totals.low,
    high: totals.high,
    monthlyLow: totals.monthlyLow,
    monthlyHigh: totals.monthlyHigh,
    hasMaintenance: totals.hasMaintenance,
    hasRush: totals.hasRush,
  };
}

export function calculateTimeline(selections = {}) {
  const baseTimelines = {
    'single-page': { min: 2, max: 3 },
    'small-site': { min: 3, max: 5 },
    'medium-site': { min: 5, max: 8 },
    'large-site': { min: 8, max: 12 },
  };

  const fallback = { minWeeks: 0, maxWeeks: 0, label: 'Pick your site size to estimate timeline.' };
  const base = baseTimelines[selections.siteSize];
  if (!base) return fallback;

  let min = base.min;
  let max = base.max;
  const featureIds = Array.isArray(selections.features) ? selections.features : [];

  if (featureIds.length >= 3) {
    min += 1;
    max += 2;
  }
  if (featureIds.length >= 6) {
    min += 1;
    max += 2;
  }

  if (featureIds.includes('online-store') || featureIds.includes('member-area')) {
    min += 1;
    max += 2;
  }

  if (selections.extras?.designLevel === 'custom') {
    min += 1;
    max += 2;
  }

  if (Array.isArray(selections.extras?.addons) && selections.extras.addons.includes('rush-delivery')) {
    min = Math.max(2, Math.ceil(min * 0.65));
    max = Math.max(min + 1, Math.ceil(max * 0.7));
  }

  return {
    minWeeks: min,
    maxWeeks: max,
    label: `~${min}-${max} weeks`,
  };
}

export function getLineItemBreakdown(selections = {}) {
  const core = estimateCore(selections);
  const items = [];

  if (core.siteSize) {
    items.push({
      id: core.siteSize.id,
      label: core.siteSize.label,
      low: core.siteSize.low,
      high: core.siteSize.high,
      type: 'one-time',
    });
  }

  core.selectedFeatures.forEach((feature) => {
    items.push({
      id: feature.id,
      label: feature.label,
      low: feature.low,
      high: feature.high,
      type: 'one-time',
    });
  });

  if (core.designLevel) {
    items.push({
      id: core.designLevel.id,
      label: core.designLevel.label,
      low: core.designLevel.low,
      high: core.designLevel.high,
      type: 'one-time',
    });
  }

  core.fixedAddons.forEach((addon) => {
    items.push({
      id: addon.id,
      label: addon.label,
      low: addon.low,
      high: addon.high,
      type: 'one-time',
    });
  });

  if (core.hasRush) {
    items.push({
      id: 'rush-fee',
      label: 'Rush delivery fee (+30%)',
      low: core.rushAmount.low,
      high: core.rushAmount.high,
      type: 'one-time',
    });
  }

  if (core.hasMaintenance) {
    items.push({
      id: 'maintenance',
      label: 'Ongoing Maintenance',
      low: core.monthlyLow,
      high: core.monthlyHigh,
      type: 'monthly',
    });
  }

  return items;
}

export function getSelectionSummary(selections = {}) {
  const industry = getOptionById(INDUSTRY_OPTIONS, selections.industry);
  const siteSize = getOptionById(SITE_SIZE_OPTIONS, selections.siteSize);
  const features = getOptionsByIds(FEATURE_OPTIONS, selections.features);
  const designLevel = getOptionById(
    DESIGN_LEVEL_OPTIONS,
    selections.extras?.designLevel || 'template',
  );
  const addons = getOptionsByIds(ADDON_OPTIONS, selections.extras?.addons);

  const rows = [];
  if (industry) rows.push(`Industry: ${industry.label}`);
  if (siteSize) rows.push(`Site size: ${siteSize.label}`);
  rows.push(`Features: ${features.length > 0 ? features.map((item) => item.label).join(', ') : 'None selected'}`);
  if (designLevel) rows.push(`Design: ${designLevel.label}`);
  rows.push(`Add-ons: ${addons.length > 0 ? addons.map((item) => item.label).join(', ') : 'None selected'}`);

  return rows;
}

export function serializeSelections(selections = {}) {
  return {
    industry: selections.industry || '',
    siteSize: selections.siteSize || '',
    features: Array.isArray(selections.features) ? selections.features : [],
    extras: {
      designLevel: selections.extras?.designLevel || 'template',
      addons: Array.isArray(selections.extras?.addons) ? selections.extras.addons : [],
    },
  };
}
