import React, { useRef, useEffect } from 'react';
import { Bot, Sparkles, ChevronRight, Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { STARTER_PROMPTS } from '../constants/mockData.jsx';
import { getTimeUntilResetString } from '../utils/quotaHelpers';

export default function ChatArea({
  messages,
  isLoading,
  input,
  setInput,
  handleSend,
  isQuotaExceeded,
  remainingQueries,
  quotaData,
  setShowQuotaModal,
  setSelectedCitation
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  return (
    <main className="chat-main">
      {/* Chat Header */}
      <header className="chat-header">
        <div className="header-title-group">
          <Bot size={20} color="var(--accent-groq)" />
          <span className="header-title">PDF Document Q&A Assistant</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className="model-tag"
            style={{
              background: isQuotaExceeded ? 'rgba(245, 80, 54, 0.2)' : undefined,
              color: isQuotaExceeded ? 'var(--accent-groq)' : undefined,
              cursor: isQuotaExceeded ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (isQuotaExceeded) setShowQuotaModal(true);
            }}
          >
            {isQuotaExceeded
              ? `⚠️ Quota Exceeded (Reset in ${getTimeUntilResetString(quotaData.resetTimestamp)})`
              : `⚡ Quota: ${remainingQueries} / 3 Queries Left`}
          </span>
        </div>
      </header>

      {/* Conversation Feed */}
      <div className="chat-feed">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Sparkles size={32} />
            </div>
            <h2 className="empty-title">Ask anything about your documents</h2>
            <p className="empty-subtitle">
              Powered by Groq Llama 3.1 8B Instant with Page-Aware Chunking, BM25 + Dense Hybrid Retrieval, and FlashRank Reranking.
            </p>

            <div className="starter-grid">
              {STARTER_PROMPTS.map((sp, idx) => (
                <div
                  key={idx}
                  className="starter-card"
                  style={{ opacity: isQuotaExceeded ? 0.7 : 1 }}
                  onClick={() => {
                    if (isQuotaExceeded) {
                      setShowQuotaModal(true);
                    } else {
                      handleSend(sp.prompt);
                    }
                  }}
                >
                  <div>
                    <div style={{ marginBottom: '6px' }}>{sp.icon}</div>
                    <div className="starter-card-text">
                      {sp.prompt}
                    </div>
                  </div>
                  <ChevronRight size={16} className="starter-card-arrow" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg} setSelectedCitation={setSelectedCitation} />
          ))
        )}

        {isLoading && (
          <div className="chat-row assistant">
            <div className="chat-avatar avatar-assistant">
              <Bot size={16} />
            </div>
            <div className="chat-bubble" style={{ color: 'var(--text-muted)' }}>
              ⚡ Searching vectors & generating answer via Groq...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="chat-input-area">
        <div className="input-box-wrapper" style={{ borderColor: isQuotaExceeded ? 'var(--accent-groq)' : undefined }}>
          <textarea
            ref={textareaRef}
            className="chat-input"
            rows={1}
            disabled={isQuotaExceeded}
            placeholder={
              isQuotaExceeded
                ? `⚠️ Daily quota limit reached (3/3 queries used). Resets in ${getTimeUntilResetString(quotaData.resetTimestamp)}.`
                : `Ask a question about the pre-indexed PDF documents (${remainingQueries} remaining)...`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (isQuotaExceeded) {
                  setShowQuotaModal(true);
                } else {
                  handleSend();
                }
              }
            }}
          />
          <button
            className="send-btn"
            disabled={(!input.trim() && !isQuotaExceeded) || isLoading}
            onClick={() => {
              if (isQuotaExceeded) {
                setShowQuotaModal(true);
              } else {
                handleSend();
              }
            }}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="input-footer-note">
          {isQuotaExceeded
            ? `🛑 Quota 0/3 Remaining • HTTP Cookie 24-Hour Expiry Window • Resets in ${getTimeUntilResetString(quotaData.resetTimestamp)}`
            : `Groq Llama-3.1-8b-instant • Token Quota: ${remainingQueries}/3 Remaining Today • Sub-500ms Response`}
        </div>
      </div>
    </main>
  );
}
