import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clipboard,
  FileText,
  FileSpreadsheet,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  analyzeInvoiceExport,
  fetchInvoiceDocuments,
  fetchInvoiceQueue,
  generateInvoiceDrafts,
  logInvoiceAction,
} from '@/services/openai';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import './InvoiceChaserApp.css';

const tones = ['friendly', 'firm', 'final'];

const toneLabels = {
  friendly: 'Friendly',
  firm: 'Firm',
  final: 'Final',
};

function formatMoney(amount = 0, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
}

function riskClassName(riskTier = 'low') {
  if (riskTier === 'high') return 'high';
  if (riskTier === 'medium') return 'medium';
  return 'low';
}

function documentStatusClassName(status = 'pending') {
  return status === 'paid' ? 'paid' : 'pending';
}

function formatDateLabel(dateInput) {
  if (!dateInput) return 'No activity';
  try {
    return new Date(dateInput).toLocaleDateString();
  } catch {
    return 'No activity';
  }
}

const InvoiceChaserApp = () => {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [queueId, setQueueId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [summary, setSummary] = useState(null);
  const [queue, setQueue] = useState([]);
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState('');
  const [drafts, setDrafts] = useState(null);
  const [editedDrafts, setEditedDrafts] = useState(null);
  const [activeTone, setActiveTone] = useState('friendly');
  const [recentActions, setRecentActions] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingDocumentDetails, setIsLoadingDocumentDetails] = useState(false);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState(false);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSignInRequiredModal, setShowSignInRequiredModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const selectedInvoice = useMemo(
    () => queue.find((invoice) => invoice.invoiceKey === selectedInvoiceKey) || null,
    [queue, selectedInvoiceKey]
  );

  const currentDraft = editedDrafts?.[activeTone] || null;

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setFile(null);
      setFileName('');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUploadClick = (event) => {
    if (isAuthenticated) return;
    event.preventDefault();
    event.stopPropagation();
    setShowSignInRequiredModal(true);
  };

  const openAuthModal = () => {
    setShowSignInRequiredModal(false);
    setShowAuthModal(true);
  };

  const refreshDocuments = useCallback(
    async (preferredQueueId = '') => {
      if (!isAuthenticated) {
        setDocuments([]);
        setSelectedDocumentId('');
        return;
      }

      const applyDocumentResponse = (response) => {
        const nextDocuments = response?.documents || [];
        setDocuments(nextDocuments);
        setSelectedDocumentId((previousSelectedDocumentId) => (
          preferredQueueId ||
          (nextDocuments.some((doc) => doc.queueId === previousSelectedDocumentId)
            ? previousSelectedDocumentId
            : (nextDocuments[0]?.queueId || ''))
        ));

        setError((previousError) => (
          previousError === 'Sign in to view your uploaded invoice documents' ? '' : previousError
        ));
      };

      setIsLoadingDocuments(true);
      try {
        const response = await fetchInvoiceDocuments();
        applyDocumentResponse(response);
      } catch (err) {
        const message = err?.message || 'Failed to load uploaded documents.';
        const isAuthValidationError = message === 'Sign in to view your uploaded invoice documents';

        // Supabase session can briefly lag right after sign-in; retry once.
        if (isAuthValidationError) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 450));
            const retryResponse = await fetchInvoiceDocuments();
            applyDocumentResponse(retryResponse);
            return;
          } catch {
            setError(
              'Signed in locally, but API auth could not be verified. Check Netlify SUPABASE_URL and SUPABASE_SERVICE_KEY.'
            );
            return;
          }
        }

        setError(message);
      } finally {
        setIsLoadingDocuments(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const loadDrafts = async (invoiceKey, forcedQueueId = queueId) => {
    if (!invoiceKey || !forcedQueueId) return;

    setIsGeneratingDrafts(true);
    setError('');
    setSuccess('');
    setActiveTone('friendly');

    try {
      const response = await generateInvoiceDrafts(forcedQueueId, invoiceKey);
      const generatedDrafts = response?.drafts || null;

      setDrafts(generatedDrafts);
      setEditedDrafts(generatedDrafts);
      setSelectedInvoiceKey(invoiceKey);
    } catch (err) {
      setError(err.message || 'Failed to generate drafts. Please try again.');
      setDrafts(null);
      setEditedDrafts(null);
    } finally {
      setIsGeneratingDrafts(false);
    }
  };

  const refreshQueue = async () => {
    if (!queueId) return;

    setIsRefreshingQueue(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetchInvoiceQueue(queueId);
      const nextQueue = response?.queue || [];

      setQueueId(response?.queueId || queueId);
      setSelectedDocumentId(response?.queueId || queueId);
      setQueue(nextQueue);
      setSummary(response?.summary || null);
      setRecentActions(response?.recentActions || []);

      if (selectedInvoiceKey && !nextQueue.some((inv) => inv.invoiceKey === selectedInvoiceKey)) {
        const fallback = nextQueue[0]?.invoiceKey || '';
        setSelectedInvoiceKey(fallback);
        setDrafts(null);
        setEditedDrafts(null);
        if (fallback) {
          await loadDrafts(fallback, response?.queueId || queueId);
        }
      }

      if (isAuthenticated) {
        await refreshDocuments(response?.queueId || queueId);
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh queue.');
    } finally {
      setIsRefreshingQueue(false);
    }
  };

  const handleSelectDocument = async (document) => {
    if (!document?.queueId) return;

    setIsLoadingDocumentDetails(true);
    setError('');
    setSuccess('');
    setSelectedDocumentId(document.queueId);
    setQueueId(document.queueId);
    setQueue([]);
    setSummary(null);
    setSelectedInvoiceKey('');
    setDrafts(null);
    setEditedDrafts(null);
    setRecentActions([]);

    try {
      const response = await fetchInvoiceQueue(document.queueId);
      const nextQueueId = response?.queueId || document.queueId;
      const nextQueue = response?.queue || [];

      setQueueId(nextQueueId);
      setSelectedDocumentId(nextQueueId);
      setQueue(nextQueue);
      setSummary(response?.summary || null);
      setRecentActions(response?.recentActions || []);

      if (nextQueue.length > 0) {
        await loadDrafts(nextQueue[0].invoiceKey, nextQueueId);
      }

      setSuccess(`Loaded ${document.sourceFileName || 'invoice document'}.`);
      if (isAuthenticated) {
        await refreshDocuments(nextQueueId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load document details.');
    } finally {
      setIsLoadingDocumentDetails(false);
    }
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      setShowSignInRequiredModal(true);
      return;
    }

    if (!file) {
      setError('Upload an invoice export first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');
    setQueue([]);
    setSummary(null);
    setSelectedInvoiceKey('');
    setDrafts(null);
    setEditedDrafts(null);
    setRecentActions([]);

    try {
      const response = await analyzeInvoiceExport(file);
      const nextQueueId = response?.queueId || '';
      const nextQueue = response?.queue || [];

      setQueueId(nextQueueId);
      setSelectedDocumentId(nextQueueId);
      setQueue(nextQueue);
      setSummary(response?.summary || null);
      setRecentActions(response?.recentActions || []);

      if (nextQueue.length > 0) {
        await loadDrafts(nextQueue[0].invoiceKey, nextQueueId);
      }

      if (isAuthenticated) {
        await refreshDocuments(nextQueueId);
      }

      setSuccess('Overdue queue generated. Priority updates daily based on overdue age and follow-up history.');
    } catch (err) {
      setError(err.message || 'Unable to analyze invoice export right now.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectInvoice = async (invoice) => {
    if (!invoice?.invoiceKey) return;
    await loadDrafts(invoice.invoiceKey);
  };

  const handleDraftChange = (tone, field, value) => {
    setEditedDrafts((prev) => ({
      ...prev,
      [tone]: {
        ...(prev?.[tone] || {}),
        [field]: value,
      },
    }));
  };

  const persistAction = async (payload, successMessage) => {
    if (!queueId || !selectedInvoiceKey) return;

    setIsSavingAction(true);
    setError('');
    setSuccess('');

    try {
      const response = await logInvoiceAction({
        queueId,
        invoiceKey: selectedInvoiceKey,
        ...payload,
      });

      const nextQueue = response?.queue || [];
      const nextQueueId = response?.queueId || queueId;

      setQueueId(nextQueueId);
      setSelectedDocumentId(nextQueueId);
      setQueue(nextQueue);
      setSummary(response?.summary || null);
      setRecentActions(response?.recentActions || []);
      setSuccess(successMessage);

      if (!nextQueue.some((inv) => inv.invoiceKey === selectedInvoiceKey)) {
        const fallbackInvoiceKey = nextQueue[0]?.invoiceKey || '';
        setSelectedInvoiceKey(fallbackInvoiceKey);
        setDrafts(null);
        setEditedDrafts(null);

        if (fallbackInvoiceKey) {
          await loadDrafts(fallbackInvoiceKey, nextQueueId);
        }
      }

      if (isAuthenticated) {
        await refreshDocuments(nextQueueId);
      }
    } catch (err) {
      setError(err.message || 'Unable to save action log.');
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleCopyAndLog = async () => {
    if (!currentDraft || !selectedInvoice) return;

    const copyPayload = `Subject: ${currentDraft.subject}\n\n${currentDraft.body}`;

    try {
      await navigator.clipboard.writeText(copyPayload);
    } catch {
      setError('Could not copy to clipboard.');
      return;
    }

    await persistAction(
      {
        actionType: 'copied',
        tone: activeTone,
        channel: 'email',
        subject: currentDraft.subject,
        body: currentDraft.body,
      },
      'Draft copied and activity log saved.'
    );
  };

  const handleSendAndLog = async () => {
    if (!currentDraft || !selectedInvoice) return;

    const recipient = selectedInvoice.customerEmail || '';
    if (!recipient) {
      setError('This invoice has no billing email. Copy the draft and send manually.');
      return;
    }

    const mailtoUrl =
      `mailto:${encodeURIComponent(recipient)}` +
      `?subject=${encodeURIComponent(currentDraft.subject)}` +
      `&body=${encodeURIComponent(currentDraft.body)}`;

    window.open(mailtoUrl, '_blank', 'noopener,noreferrer');

    await persistAction(
      {
        actionType: 'sent',
        tone: activeTone,
        channel: 'email',
        subject: currentDraft.subject,
        body: currentDraft.body,
      },
      'Email draft sent to your mail app and log saved.'
    );
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;

    await persistAction(
      {
        actionType: 'paid',
        channel: 'system',
        notes: 'Marked paid from InvoiceChaser',
      },
      'Invoice marked as paid and queue reprioritized.'
    );
  };

  return (
    <div className="invoicechaser-app">
      <header className="invoicechaser-header">
        <div className="invoicechaser-icon">
          <FileSpreadsheet size={22} />
        </div>
        <div>
          <h2>InvoiceChaser</h2>
          <p>Upload invoice exports, prioritize overdue accounts, and send AI-assisted follow-ups.</p>
        </div>
      </header>

      <section className="invoicechaser-upload-card">
        <label className={`invoicechaser-upload ${!isAuthenticated ? 'disabled' : ''}`} onClick={handleUploadClick}>
          <input
            type="file"
            accept=".csv,.json,.xlsx,.xls,.pdf,application/pdf"
            onChange={(event) => handleFileSelect(event.target.files?.[0])}
            disabled={isUploading || !isAuthenticated}
          />
          <Sparkles size={16} />
          <span>{fileName || 'Upload invoice export (CSV, JSON, Excel, PDF)'}</span>
        </label>

        <div className="invoicechaser-upload-actions">
          <button
            className="invoicechaser-primary-btn"
            onClick={handleAnalyze}
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="spinning" />
                Building queue...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Build Overdue Queue
              </>
            )}
          </button>

          <button
            className="invoicechaser-secondary-btn"
            onClick={refreshQueue}
            disabled={!queueId || isRefreshingQueue || isUploading}
          >
            {isRefreshingQueue ? <Loader2 size={16} className="spinning" /> : <RefreshCw size={16} />}
            Refresh Priority
          </button>
        </div>

        {queueId && (
          <p className="invoicechaser-meta">
            Queue ID: <code>{queueId}</code>
          </p>
        )}
      </section>

      {(error || success) && (
        <div className="invoicechaser-notices">
          {error && (
            <div className="invoicechaser-notice error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="invoicechaser-notice success">
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {summary && (
        <section className="invoicechaser-summary-grid">
          <article>
            <p>Total Overdue</p>
            <h3>{summary.totalOverdueInvoices || 0}</h3>
          </article>
          <article>
            <p>High Risk</p>
            <h3>{summary.totalsByTier?.high || 0}</h3>
          </article>
          <article>
            <p>Medium Risk</p>
            <h3>{summary.totalsByTier?.medium || 0}</h3>
          </article>
          <article>
            <p>Total Due</p>
            <h3>{formatMoney(summary.totalAmountDue || 0)}</h3>
          </article>
        </section>
      )}

      <section className="invoicechaser-main-grid">
        <div className="invoicechaser-side-stack">
          {isAuthenticated && (
            <aside className="invoicechaser-documents-panel">
              <div className="invoicechaser-panel-header">
                <h3>Uploaded Documents</h3>
                <span>{documents.length} files</span>
              </div>

              {isLoadingDocuments && (
                <div className="invoicechaser-loading">
                  <Loader2 size={16} className="spinning" />
                  <span>Loading documents...</span>
                </div>
              )}

              {!isLoadingDocuments && documents.length === 0 && (
                <p className="invoicechaser-empty">Upload an invoice file to save and track it here.</p>
              )}

              {!isLoadingDocuments && documents.length > 0 && (
                <div className="invoicechaser-document-list">
                  {documents.map((document) => (
                    <button
                      key={document.queueId}
                      className={`invoicechaser-document-item ${selectedDocumentId === document.queueId ? 'active' : ''}`}
                      onClick={() => handleSelectDocument(document)}
                      disabled={isLoadingDocumentDetails}
                    >
                      <div className="invoicechaser-document-header">
                        <div className="invoicechaser-document-title">
                          <FileText size={14} />
                          <strong>{document.sourceFileName || 'invoice-export'}</strong>
                        </div>
                        <span
                          className={`invoicechaser-document-status ${documentStatusClassName(document.status)}`}
                        >
                          {document.status || 'pending'}
                        </span>
                      </div>
                      <div className="invoicechaser-document-meta">
                        <span>{document.summary?.totalOverdueInvoices || 0} overdue</span>
                        <span>{formatMoney(document.summary?.totalAmountDue || 0)}</span>
                        <span>Updated {formatDateLabel(document.updatedAt || document.createdAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>
          )}

          <aside className="invoicechaser-queue-panel">
            <div className="invoicechaser-panel-header">
              <h3>Overdue Queue</h3>
              <span>{queue.length} invoices</span>
            </div>

            {queue.length === 0 && (
              <p className="invoicechaser-empty">Upload an export to generate your prioritized queue.</p>
            )}

            {queue.length > 0 && (
              <div className="invoicechaser-queue-list">
                {queue.map((invoice) => (
                  <button
                    key={invoice.invoiceKey}
                    className={`invoicechaser-queue-item ${selectedInvoiceKey === invoice.invoiceKey ? 'active' : ''}`}
                    onClick={() => handleSelectInvoice(invoice)}
                  >
                    <div className="invoicechaser-queue-top">
                      <strong>{invoice.invoiceId}</strong>
                      <span className={`invoicechaser-risk-pill ${riskClassName(invoice.riskTier)}`}>
                        {invoice.riskTier}
                      </span>
                    </div>
                    <p className="invoicechaser-customer">{invoice.customerName}</p>
                    <div className="invoicechaser-queue-bottom">
                      <span>{invoice.daysOverdue}d overdue</span>
                      <span>{formatMoney(invoice.amountDue, invoice.currency)}</span>
                      <span>Score {invoice.priorityScore}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="invoicechaser-draft-panel">
          {isLoadingDocumentDetails && (
            <div className="invoicechaser-loading">
              <Loader2 size={18} className="spinning" />
              <span>Loading document details...</span>
            </div>
          )}

          {!isLoadingDocumentDetails && !selectedInvoice && (
            <p className="invoicechaser-empty">Select an invoice to generate follow-up drafts.</p>
          )}

          {selectedInvoice && (
            <>
              <div className="invoicechaser-panel-header">
                <div>
                  <h3>{selectedInvoice.invoiceId}</h3>
                  <p>
                    {selectedInvoice.customerName} • {selectedInvoice.customerEmail || 'No billing email'}
                  </p>
                </div>
                <div className={`invoicechaser-risk-pill ${riskClassName(selectedInvoice.riskTier)}`}>
                  {selectedInvoice.riskTier}
                </div>
              </div>

              <div className="invoicechaser-invoice-meta">
                <span>{selectedInvoice.daysOverdue} days overdue</span>
                <span>{formatMoney(selectedInvoice.amountDue, selectedInvoice.currency)}</span>
                <span>Priority {selectedInvoice.priorityScore}</span>
              </div>

              <p className="invoicechaser-next-action">Next action: {selectedInvoice.nextAction}</p>

              {isGeneratingDrafts && (
                <div className="invoicechaser-loading">
                  <Loader2 size={18} className="spinning" />
                  <span>Generating friendly, firm, and final drafts...</span>
                </div>
              )}

              {!isGeneratingDrafts && drafts && (
                <>
                  <div className="invoicechaser-tone-tabs">
                    {tones.map((tone) => (
                      <button
                        key={tone}
                        className={activeTone === tone ? 'active' : ''}
                        onClick={() => setActiveTone(tone)}
                      >
                        {toneLabels[tone]}
                      </button>
                    ))}
                  </div>

                  <label className="invoicechaser-field">
                    <span>Subject</span>
                    <input
                      type="text"
                      value={currentDraft?.subject || ''}
                      onChange={(event) => handleDraftChange(activeTone, 'subject', event.target.value)}
                    />
                  </label>

                  <label className="invoicechaser-field">
                    <span>Draft Body</span>
                    <textarea
                      rows={10}
                      value={currentDraft?.body || ''}
                      onChange={(event) => handleDraftChange(activeTone, 'body', event.target.value)}
                    />
                  </label>

                  <div className="invoicechaser-draft-actions">
                    <button
                      className="invoicechaser-secondary-btn"
                      onClick={handleCopyAndLog}
                      disabled={isSavingAction}
                    >
                      {isSavingAction ? <Loader2 size={16} className="spinning" /> : <Clipboard size={16} />}
                      Approve + Copy
                    </button>

                    <button
                      className="invoicechaser-primary-btn"
                      onClick={handleSendAndLog}
                      disabled={isSavingAction}
                    >
                      {isSavingAction ? <Loader2 size={16} className="spinning" /> : <Mail size={16} />}
                      Approve + Send
                    </button>

                    <button
                      className="invoicechaser-mark-paid"
                      onClick={handleMarkPaid}
                      disabled={isSavingAction}
                    >
                      Mark Paid
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {recentActions.length > 0 && (
        <section className="invoicechaser-log-panel">
          <div className="invoicechaser-panel-header">
            <h3>Recent Activity</h3>
            <span>{recentActions.length} events</span>
          </div>

          <div className="invoicechaser-log-list">
            {recentActions.slice(0, 10).map((action) => (
              <div key={action.id} className="invoicechaser-log-item">
                <div>
                  <strong>{action.invoiceId}</strong>
                  <p>
                    {action.actionType.replaceAll('_', ' ')}
                    {action.tone ? ` • ${action.tone}` : ''}
                  </p>
                </div>
                <time>{new Date(action.timestamp).toLocaleString()}</time>
              </div>
            ))}
          </div>
        </section>
      )}

      {showSignInRequiredModal && (
        <div className="invoicechaser-gate-modal-overlay" onClick={() => setShowSignInRequiredModal(false)}>
          <div className="invoicechaser-gate-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Sign in required</h3>
            <p>This app requires you to sign in before using uploads.</p>
            <div className="invoicechaser-gate-modal-actions">
              <button
                className="invoicechaser-secondary-btn"
                onClick={() => setShowSignInRequiredModal(false)}
              >
                Cancel
              </button>
              <button className="invoicechaser-primary-btn" onClick={openAuthModal}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default InvoiceChaserApp;
