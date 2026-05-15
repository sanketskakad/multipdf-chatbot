import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, FileText } from 'lucide-react';

export default function ChatMessage({ msg, setSelectedCitation }) {
  return (
    <div className={`chat-row ${msg.role}`}>
      <div className={`chat-avatar avatar-${msg.role}`}>
        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="chat-bubble">
        <div className="message-text">
          {msg.role === 'assistant' ? (
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          )}
        </div>

        {/* Citations Box */}
        {msg.citations && msg.citations.length > 0 && (
          <div className="citations-box">
            <div className="citations-header">
              <FileText size={14} />
              <span>Source References & Citations ({msg.citations.length})</span>
            </div>
            <div className="citation-pills">
              {msg.citations.map((cite, cIdx) => (
                <button
                  key={cIdx}
                  className="citation-pill"
                  onClick={() => setSelectedCitation(cite)}
                >
                  <span>📌 {cite.source} (Page {cite.page})</span>
                  {cite.rerank_score !== undefined && (
                    <span className="citation-score">
                      Score: {cite.rerank_score}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
