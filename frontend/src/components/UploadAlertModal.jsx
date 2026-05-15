import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function UploadAlertModal({ showUploadAlert, setShowUploadAlert }) {
  if (!showUploadAlert) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowUploadAlert(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldAlert color="var(--accent-groq)" size={22} />
            <span className="modal-title">Upload Restricted in Live Demo</span>
          </div>
          <button className="close-btn" onClick={() => setShowUploadAlert(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            Document processing and vector embedding generation are temporarily restricted in this live preview deployment due to serverless compute rate limits.
          </p>
          <div className="modal-footer-note">
            💡 Please test the chatbot's Q&A capabilities using our 3 pre-indexed benchmark documents available in the sidebar.
          </div>
        </div>
      </div>
    </div>
  );
}
