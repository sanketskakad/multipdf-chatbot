import React from 'react';
import { ShieldAlert, X, Clock } from 'lucide-react';
import { getTimeUntilResetString } from '../utils/quotaHelpers';

export default function QuotaModal({ showQuotaModal, setShowQuotaModal, quotaData }) {
  if (!showQuotaModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowQuotaModal(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldAlert color="var(--accent-groq)" size={22} />
            <span className="modal-title">Daily Token Usage Quota Limit</span>
          </div>
          <button className="close-btn" onClick={() => setShowQuotaModal(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="meta-item">
              <span className="meta-key">Queries Used</span>
              <span className="meta-val" style={{ color: 'var(--accent-groq)' }}>3 / 3 Max</span>
            </div>
            <div className="meta-item">
              <span className="meta-key">Quota Status</span>
              <span className="meta-val" style={{ color: 'var(--accent-groq)' }}>Exceeded</span>
            </div>
            <div className="meta-item">
              <span className="meta-key">Resets In</span>
              <span className="meta-val" style={{ color: 'var(--accent-green)' }}>
                {getTimeUntilResetString(quotaData.resetTimestamp)}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            To manage API token usage costs and optimize compute allocation, query submission is strictly capped at <strong>3 questions per 24 hours</strong>.
          </p>

          <div className="modal-footer-note">
            <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Your HTTP Cookie quota reset timer started on your 1st query and will automatically expire and reset in <strong>{getTimeUntilResetString(quotaData.resetTimestamp)}</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
