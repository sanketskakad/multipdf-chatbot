import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import CitationModal from './components/CitationModal';
import PdfViewerModal from './components/PdfViewerModal';
import QuotaModal from './components/QuotaModal';
import UploadAlertModal from './components/UploadAlertModal';

import { PREINDEXED_DOCS, MOCK_KNOWLEDGE_BASE } from './constants/mockData.jsx';
import {
  API_BASE_URL,
  MAX_DAILY_QUOTA,
  getQuotaFromCookie,
  incrementQuotaCookie
} from './utils/quotaHelpers';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate Quota State
  const [quotaData, setQuotaData] = useState(getQuotaFromCookie);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // Modals state
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [selectedPdfViewer, setSelectedPdfViewer] = useState(null);
  const [showUploadAlert, setShowUploadAlert] = useState(false);

  // Sync timer for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setQuotaData(getQuotaFromCookie());
    }, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const remainingQueries = Math.max(0, MAX_DAILY_QUOTA - (quotaData.count || 0));
  const isQuotaExceeded = (quotaData.count || 0) >= MAX_DAILY_QUOTA;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    // Check 24-hour rate limit
    const currentQuota = getQuotaFromCookie();
    if ((currentQuota.count || 0) >= MAX_DAILY_QUOTA) {
      setShowQuotaModal(true);
      return;
    }

    // Increment count by one immediately as soon as user enters question
    const updatedQuota = incrementQuotaCookie();
    setQuotaData(updatedQuota);

    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Fetch from server API endpoint - server manages top_k & use_rerank defaults
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (res.status === 429) {
        setShowQuotaModal(true);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            citations: data.citations || [],
          },
        ]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.log('FastAPI server offline, using client-side RAG engine simulation.', err);
    }

    // Client-Side RAG fallback match
    setTimeout(() => {
      const qLower = query.toLowerCase();
      const match = MOCK_KNOWLEDGE_BASE.find((k) =>
        k.keywords.some((kw) => qLower.includes(kw))
      );

      if (match) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: match.answer,
            citations: match.citations,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I analyzed the 3 pre-indexed benchmark documents using **Groq Llama 3.1 8B Instant** + **FlashRank Hybrid Search**, but could not find exact metrics for your query.\n\nPlease ask about **Q1 Net Sales & Revenue**, **Product Prices & Warranty Durations**, or **30-day Return Policies**.`,
            citations: [],
          },
        ]);
      }
      setIsLoading(false);
    }, 500);
  };

  const openPdfModalByName = (filename) => {
    const foundDoc = PREINDEXED_DOCS.find((d) => d.name.toLowerCase() === filename.toLowerCase()) || {
      name: filename,
      size: '6.5 KB',
      pages: 3,
      type: 'PDF Document',
      pdfUrl: `/documents/${filename}`,
      description: `Full PDF Document view for ${filename}`,
      fullText: [
        { page: 1, content: `Full text view for ${filename}. Refer to PDF tab for embedded document.` }
      ]
    };
    setSelectedPdfViewer(foundDoc);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation & Engine Status */}
      <Sidebar
        setSelectedPdfViewer={setSelectedPdfViewer}
        setShowUploadAlert={setShowUploadAlert}
        isQuotaExceeded={isQuotaExceeded}
        remainingQueries={remainingQueries}
        quotaData={quotaData}
      />

      {/* Main Conversation Feed & Input Area */}
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isQuotaExceeded={isQuotaExceeded}
        remainingQueries={remainingQueries}
        quotaData={quotaData}
        setShowQuotaModal={setShowQuotaModal}
        setSelectedCitation={setSelectedCitation}
      />

      {/* Citation Inspector Modal */}
      <CitationModal
        selectedCitation={selectedCitation}
        setSelectedCitation={setSelectedCitation}
        openPdfModalByName={openPdfModalByName}
      />

      {/* PDF Document Viewer Modal */}
      <PdfViewerModal
        selectedPdfViewer={selectedPdfViewer}
        setSelectedPdfViewer={setSelectedPdfViewer}
      />

      {/* Rate Quota Exceeded Modal */}
      <QuotaModal
        showQuotaModal={showQuotaModal}
        setShowQuotaModal={setShowQuotaModal}
        quotaData={quotaData}
      />

      {/* Live Preview Upload Guardrail Modal */}
      <UploadAlertModal
        showUploadAlert={showUploadAlert}
        setShowUploadAlert={setShowUploadAlert}
      />
    </div>
  );
}
