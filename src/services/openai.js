import { supabase } from '@/lib/supabase';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function apiUrl(path) {
  return API_ORIGIN ? `${API_ORIGIN}${path}` : path;
}

const API_BASE = apiUrl('/api/content');
const DOC_API_BASE = apiUrl('/api/doc-analyzer');
const TONE_API_BASE = apiUrl('/api/tone');
const DATA_INSIGHTS_API_BASE = apiUrl('/api/data-insights');
const INVOICE_CHASER_API_BASE = apiUrl('/api/invoice-chaser');
const VIDEO_ANALYZER_API_BASE = apiUrl('/api/video-analyzer');
const BILLING_API_BASE = apiUrl('/api/billing');
const LEADFLOW_API_BASE = apiUrl('/api/leadflow');
const USAGE_UPDATED_EVENT = 'usage:updated';

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseTextAsJsonSafe(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Continue without auth when session lookup fails.
  }

  return headers;
}

function emitUsageUpdate(usage) {
  if (!usage || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(USAGE_UPDATED_EVENT, { detail: usage }));
}

function parseUsageHeaders(response) {
  const limitHeader = response.headers.get('X-RateLimit-Limit');
  const remainingHeader = response.headers.get('X-RateLimit-Remaining');
  const resetHeader = response.headers.get('X-RateLimit-Reset');

  if (limitHeader === null || remainingHeader === null) return null;

  const limit = Number.parseInt(limitHeader, 10);
  const remaining = Number.parseInt(remainingHeader, 10);
  const resetAtMs = resetHeader ? Number.parseInt(resetHeader, 10) : null;

  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) return null;

  return {
    used: Math.max(0, limit - remaining),
    limit,
    remaining: Math.max(0, remaining),
    resetsAt:
      Number.isFinite(resetAtMs) && resetAtMs > 0
        ? new Date(resetAtMs).toISOString()
        : undefined,
  };
}

function syncUsageFromResponse(response, data) {
  if (data?.usage && typeof data.usage === 'object') {
    emitUsageUpdate(data.usage);
    return;
  }

  const usageFromHeaders = parseUsageHeaders(response);
  if (usageFromHeaders) {
    emitUsageUpdate(usageFromHeaders);
  }
}

export async function generateContent(content, formats, sourceType = 'text') {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, formats, sourceType }),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to generate content');
  }

  return data || {};
}

export async function analyzeDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const authHeaders = await getAuthHeaders();
  delete authHeaders['Content-Type'];

  const response = await fetch(`${DOC_API_BASE}/analyze`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to analyze document');
  }

  return data || {};
}

export async function analyzeData(file) {
  const formData = new FormData();
  formData.append('file', file);

  const authHeaders = await getAuthHeaders();
  delete authHeaders['Content-Type'];

  const response = await fetch(`${DATA_INSIGHTS_API_BASE}/analyze`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to analyze data');
  }

  return data || {};
}

export async function convertTone(text, tone) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${TONE_API_BASE}/convert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, tone }),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to convert tone');
  }

  return data?.convertedText || '';
}

export async function analyzeInvoiceExport(file) {
  const formData = new FormData();
  formData.append('file', file);

  const authHeaders = await getAuthHeaders();
  delete authHeaders['Content-Type'];

  const response = await fetch(`${INVOICE_CHASER_API_BASE}/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to build invoice queue');
  }

  return data || {};
}

export async function generateInvoiceDrafts(queueId, invoiceKey) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INVOICE_CHASER_API_BASE}/drafts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ queueId, invoiceKey }),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to generate invoice drafts');
  }

  return data || {};
}

export async function logInvoiceAction(payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INVOICE_CHASER_API_BASE}/actions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to save invoice action');
  }

  return data || {};
}

export async function fetchInvoiceQueue(queueId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INVOICE_CHASER_API_BASE}/queue/${encodeURIComponent(queueId)}`, {
    method: 'GET',
    headers,
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to fetch invoice queue');
  }

  return data || {};
}

export async function fetchInvoiceDocuments() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INVOICE_CHASER_API_BASE}/documents`, {
    method: 'GET',
    headers,
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to fetch invoice documents');
  }

  return data || { documents: [] };
}

export async function createInvoiceChaserCheckout() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BILLING_API_BASE}/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plan: 'invoice_chaser_unlimited' }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to start checkout');
  }

  return data || {};
}

export async function createBillingPortalSession() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BILLING_API_BASE}/portal`, {
    method: 'POST',
    headers,
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to open billing portal');
  }

  return data || {};
}

export async function extractLead(text, sourceType) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${LEADFLOW_API_BASE}/extract`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, sourceType }),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to extract lead data');
  }

  return data?.lead || {};
}

export async function analyzeVideoFrames(frames, generateContent = true, youtubeMetadata = null) {
  const headers = await getAuthHeaders();
  const payload = { frames, generateContent };
  if (youtubeMetadata) payload.youtubeMetadata = youtubeMetadata;

  const response = await fetch(`${VIDEO_ANALYZER_API_BASE}/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to analyze video');
  }

  return data || {};
}

export async function analyzeUploadedVideo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const authHeaders = await getAuthHeaders();
  delete authHeaders['Content-Type'];

  const response = await fetch(`${VIDEO_ANALYZER_API_BASE}/analyze-upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const rawBody = await response.text();
  const data = parseTextAsJsonSafe(rawBody);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    const textSnippet = rawBody ? rawBody.trim().slice(0, 400) : '';
    throw new Error(
      data?.message ||
        data?.error ||
        textSnippet ||
        `Failed to analyze uploaded video (HTTP ${response.status})`
    );
  }

  return data || {};
}

export async function fetchYouTubeFrames(youtubeUrl) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${VIDEO_ANALYZER_API_BASE}/youtube-frames`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ youtubeUrl }),
  });

  const data = await parseJsonSafe(response);
  syncUsageFromResponse(response, data);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to fetch YouTube frames');
  }

  return data || {};
}
