import React, { useState } from 'react';
import { FileText, ExternalLink, X, Eye, BookOpen } from 'lucide-react';

export default function PdfViewerModal({ selectedPdfViewer, setSelectedPdfViewer }) {
  const [pdfViewTab, setPdfViewTab] = useState('embed'); // 'embed' or 'text'

  if (!selectedPdfViewer) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedPdfViewer(null)}>
      <div className="modal-card pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileText color="var(--accent-groq)" size={20} />
            <span className="modal-title">{selectedPdfViewer.name}</span>
            <span className="doc-count-badge">{selectedPdfViewer.pages} Pages</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <a
              href={selectedPdfViewer.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="close-btn"
              title="Open PDF in new tab"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={18} />
            </a>
            <button className="close-btn" onClick={() => setSelectedPdfViewer(null)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 1.5rem', background: 'var(--bg-sidebar)' }}>
          <button
            onClick={() => setPdfViewTab('embed')}
            style={{
              padding: '0.6rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: pdfViewTab === 'embed' ? '2px solid var(--accent-groq)' : '2px solid transparent',
              color: pdfViewTab === 'embed' ? 'var(--accent-groq)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Eye size={16} />
            <span>PDF Document View</span>
          </button>
          <button
            onClick={() => setPdfViewTab('text')}
            style={{
              padding: '0.6rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: pdfViewTab === 'text' ? '2px solid var(--accent-groq)' : '2px solid transparent',
              color: pdfViewTab === 'text' ? 'var(--accent-groq)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <BookOpen size={16} />
            <span>Extracted Text Reader</span>
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, padding: '1rem', overflow: 'hidden' }}>
          {pdfViewTab === 'embed' ? (
            <div className="pdf-iframe-container">
              <iframe
                src={selectedPdfViewer.pdfUrl}
                className="pdf-iframe"
                title={selectedPdfViewer.name}
              />
            </div>
          ) : (
            <div style={{ height: '100%', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedPdfViewer.fullText ? (
                selectedPdfViewer.fullText.map((pageItem) => (
                  <div key={pageItem.page} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-groq)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📄 Page {pageItem.page}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{selectedPdfViewer.name}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>
                      {pageItem.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="snippet-box">{selectedPdfViewer.description}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
