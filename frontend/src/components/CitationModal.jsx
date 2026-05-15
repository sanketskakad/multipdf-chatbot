import React from 'react';
import { FileText, X, BookOpen, Info } from 'lucide-react';

export default function CitationModal({ selectedCitation, setSelectedCitation, openPdfModalByName }) {
  if (!selectedCitation) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedCitation(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileText color="var(--accent-groq)" size={20} />
            <span className="modal-title">Citation Reference Inspector</span>
          </div>
          <button className="close-btn" onClick={() => setSelectedCitation(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="meta-item">
              <span className="meta-key">Document</span>
              <span className="meta-val">{selectedCitation.source}</span>
            </div>
            <div className="meta-item">
              <span className="meta-key">Page Number</span>
              <span className="meta-val">Page {selectedCitation.page}</span>
            </div>
            <div className="meta-item">
              <span className="meta-key">FlashRank Score</span>
              <span className="meta-val" style={{ color: 'var(--accent-green)' }}>
                {selectedCitation.rerank_score || 'N/A'}
              </span>
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: '6px' }}>
              Extracted Context Excerpt
            </div>
            <div className="snippet-box">
              "{selectedCitation.content_snippet}"
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="upload-btn"
              style={{ borderStyle: 'solid', borderColor: 'var(--accent-groq)', color: 'var(--text-main)', background: 'rgba(245,80,54,0.1)' }}
              onClick={() => {
                const src = selectedCitation.source;
                setSelectedCitation(null);
                openPdfModalByName(src);
              }}
            >
              <BookOpen size={16} color="var(--accent-groq)" />
              <span>📖 Read Whole PDF Document</span>
            </button>
          </div>

          <div className="modal-footer-note">
            <Info size={14} style={{ display: 'inline', marginRight: '6px' }} />
            This text passage was retrieved via <strong>Hybrid Dense-Sparse Fusion</strong> and verified by the <strong>FlashRank Cross-Encoder</strong> re-ranker before being fed into Groq Llama 3.1 8B Instant.
          </div>
        </div>
      </div>
    </div>
  );
}
