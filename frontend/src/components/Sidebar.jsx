import React from 'react';
import { Sparkles, FileText, Upload, Eye } from 'lucide-react';
import { PREINDEXED_DOCS } from '../constants/mockData.jsx';
import { getTimeUntilResetString } from '../utils/quotaHelpers';

export default function Sidebar({
  setSelectedPdfViewer,
  setShowUploadAlert,
  isQuotaExceeded,
  remainingQueries,
  quotaData
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-title">Groq Multi-PDF RAG</div>
          <div className="brand-subtitle">Llama 3.1 8B Instant</div>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Documents Section */}
        <div>
          <div className="section-label">
            <span>Indexed Documents</span>
            <span className="doc-count-badge">3 Files</span>
          </div>

          <div className="doc-list">
            {PREINDEXED_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="doc-card"
                onClick={() => setSelectedPdfViewer(doc)}
                title="Click to view full PDF document"
              >
                <FileText size={18} className="doc-icon" />
                <div className="doc-info">
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-meta">
                    {doc.pages} Pages • {doc.size}
                  </div>
                </div>
                <Eye size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Upload Button with Hover Tooltip */}
        <div>
          <div className="section-label">Actions</div>
          <div className="upload-btn-wrapper">
            <button
              className="upload-btn"
              onClick={() => setShowUploadAlert(true)}
            >
              <Upload size={16} />
              <span>Upload New PDF</span>
            </button>

            <div className="upload-tooltip">
              ⚠️ Document processing is temporarily restricted in live preview mode due to serverless compute limits. Please explore our 3 pre-indexed benchmark documents.
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Engine Status Footer */}
      <div className="sidebar-footer">
        <div className="status-box">
          <div className="status-row">
            <span className="status-label">LLM Engine</span>
            <span className="status-val">Groq Llama-3.1 8B</span>
          </div>
          <div className="status-row">
            <span className="status-label">24h Query Quota</span>
            <span
              className="status-val"
              style={{ color: isQuotaExceeded ? 'var(--accent-groq)' : 'var(--accent-green)', fontWeight: 700 }}
            >
              {remainingQueries} / 3 Remaining
            </span>
          </div>
          {isQuotaExceeded && (
            <div className="status-row" style={{ fontSize: '0.7rem', color: 'var(--accent-groq)' }}>
              <span>Quota Reset In</span>
              <span>{getTimeUntilResetString(quotaData.resetTimestamp)}</span>
            </div>
          )}
          <div className="status-row">
            <span className="status-label">Search Mode</span>
            <span className="status-val">Hybrid (BM25 + Dense)</span>
          </div>
          <div className="status-row">
            <span className="status-label">Re-ranker</span>
            <span className="status-val">FlashRank</span>
          </div>
          <div className="status-row" style={{ marginTop: '4px' }}>
            <span className="status-label">System Status</span>
            <span className="status-val" style={{ color: 'var(--accent-green)' }}>
              <span className="status-indicator"></span>Active & Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
