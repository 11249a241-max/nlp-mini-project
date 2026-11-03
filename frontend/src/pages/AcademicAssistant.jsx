import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { assistantAPI } from '../services/api';
import { 
  Bot, 
  Send, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Paperclip
} from 'lucide-react';

export default function AcademicAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      content: 'Hello! I am your CampusMind AI Academic Assistant. You can upload academic PDFs (syllabi, course notes, university regulations) to ask questions with exact citations, or query core computer science and AI concepts.',
      citations: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploadError, setUploadError] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load previously uploaded documents
    assistantAPI.getHistory().then(res => {
      if (res.data && res.data.length > 0) {
        setUploadedDoc(res.data[0]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      content: query,
      citations: []
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await assistantAPI.chat(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: res.data.reply,
        isGrounded: res.data.is_grounded,
        citations: res.data.citations || []
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          content: 'Sorry, I encountered an issue querying the academic knowledge base. Please try again.',
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a valid PDF document.');
      return;
    }

    setUploadError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await assistantAPI.uploadDocument(formData);
      setUploadedDoc(res.data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'assistant',
          content: `📄 Successfully indexed **${res.data.title}** (${res.data.num_pages} pages). \n\n**Executive Summary:**\n${res.data.summary}\n\nYou can now ask any question grounded in this document!`,
          citations: []
        }
      ]);
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to extract and index PDF.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quickPrompts = [
    "Explain machine learning in simple words.",
    "What is the difference between NLP and deep learning?",
    "Summarize this PDF.",
    "What are the important topics in my syllabus?"
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header 
        title="AI Academic Assistant" 
        subtitle="RAG-powered conversational engine grounded on your uploaded coursework & syllabi" 
      />

      <div className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-4 overflow-hidden">
        {/* Upload Banner / File Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purpleAccent-50 text-purpleAccent-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Document Context (FAISS RAG)
              </h4>
              <p className="text-xs text-slate-500">
                {uploadedDoc 
                  ? `Active Document: ${uploadedDoc.title} (${uploadedDoc.num_pages} pages indexed)` 
                  : 'Upload an academic PDF or regulation sheet to ask questions with verified citations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors border border-brand-200"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  <span>Extracting PDF...</span>
                </>
              ) : (
                <>
                  <Paperclip className="h-4 w-4" />
                  <span>Upload Academic PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Chat Stream Window */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-purpleAccent-600 text-white shadow-md shadow-purpleAccent-500/20'
                }`}
              >
                {msg.sender === 'user' ? 'You' : <Bot className="h-4 w-4" />}
              </div>

              <div className="space-y-2 max-w-2xl">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Citations Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-purpleAccent-50/70 border border-purpleAccent-200 text-xs space-y-2">
                    <span className="font-bold text-purpleAccent-900 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Verified Source References:
                    </span>
                    <div className="space-y-1.5">
                      {msg.citations.map((cite, i) => (
                        <div key={i} className="pl-3 border-l-2 border-purpleAccent-400 text-slate-700">
                          <p className="font-semibold text-purpleAccent-800">
                            {cite.document_title} — Page {cite.page_number} (Match: {Math.round(cite.relevance_score * 100)}%)
                          </p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{cite.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-xl">
              <div className="h-8 w-8 rounded-xl bg-purpleAccent-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                <span>Searching indexed vectors and formulating grounded response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-700 text-xs font-semibold shadow-xs transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your syllabus, regulations, or uploaded PDFs..."
            className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-transparent"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-r from-brand-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
