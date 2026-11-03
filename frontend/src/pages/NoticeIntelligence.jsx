import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { noticeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BellRing, 
  Search, 
  UploadCloud, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Building, 
  DollarSign, 
  Loader2, 
  HelpCircle, 
  Send,
  BookOpen,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function NoticeIntelligence() {
  const { isFaculty } = useAuth();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Natural language query state
  const [question, setQuestion] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Examination');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const fetchNotices = async () => {
    try {
      const res = await noticeAPI.getNotices({
        category: selectedCategory === 'All' ? undefined : selectedCategory
      });
      setNotices(res.data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (preset) => {
    const q = preset || question;
    if (!q.trim()) return;

    setQueryLoading(true);
    setQueryResult(null);

    try {
      const res = await noticeAPI.askNotice(q);
      setQueryResult(res.data);
    } catch (err) {
      alert("Failed to query notice intelligence.");
    } finally {
      setQueryLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('category', uploadCategory);
    formData.append('description', uploadDesc);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      await noticeAPI.uploadNotice(formData);
      setShowUpload(false);
      setUploadTitle('');
      setUploadDesc('');
      setSelectedFile(null);
      fetchNotices();
    } catch (err) {
      alert(err.response?.data?.detail || "Notice upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const sampleQueries = [
    "What is the last date for examination registration?",
    "Are there any internship announcements?",
    "What are the fees for examination hall tickets?"
  ];

  const categories = ['All', 'Examination', 'Internship', 'Circular', 'Event', 'Academic Regulations'];

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="AI University Notice & Circular Intelligence" 
        subtitle="Automated PDF summarization, deadline extraction, and grounded natural-language queries" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Natural Language Query Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-slate-900 to-purpleAccent-950 text-white shadow-xl shadow-brand-900/10 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-400" />
            <h3 className="font-bold text-sm tracking-wide uppercase text-brand-200">
              Query Official University Circulars
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1.5">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="e.g. What is the last date for examination registration?"
              className="flex-1 px-4 py-2 text-sm bg-transparent text-white placeholder-slate-300 focus:outline-none"
            />
            <button
              onClick={() => handleAskQuestion()}
              disabled={queryLoading || !question.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {queryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Ask Engine</span>
            </button>
          </div>

          {/* Preset Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Try asking:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(sq); handleAskQuestion(sq); }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Grounded Query Answer Box */}
          {queryResult && (
            <div className="mt-4 p-5 rounded-xl bg-white/95 text-slate-900 border border-white/40 shadow-lg space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-700 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-brand-600" />
                  Grounded Notice Synthesis
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Verified Citation
                </span>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {queryResult.answer}
              </p>

              {queryResult.citations?.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-500 space-y-1">
                  <span className="font-bold text-slate-700">Source References:</span>
                  {queryResult.citations.map((c, idx) => (
                    <div key={idx} className="text-slate-600">
                      • <strong>{c.document_title}</strong> (Page {c.page_number})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls: Filter & Faculty Upload */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isFaculty && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purpleAccent-600 hover:bg-purpleAccent-700 text-white text-xs font-bold shadow-md shadow-purpleAccent-500/20 transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Publish Circular / Notice</span>
            </button>
          )}
        </div>

        {/* Notices Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((n) => (
            <div
              key={n.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md hover:border-brand-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {n.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(n.publication_date).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base leading-snug">{n.title}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  {n.department_name || 'All Departments'} • Issued by {n.faculty_name}
                </p>
              </div>

              {/* Automatic NLP Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Executive Summary:</span>
                {n.summary}
              </div>

              {/* Extracted Deadlines */}
              {n.important_deadlines?.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Important Deadlines (NLP Extracted)
                  </span>
                  {n.important_deadlines.map((dl, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-xs flex items-center justify-between text-rose-800"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span className="font-bold">{dl.date}</span>
                      </div>
                      <span className="text-[11px] text-rose-700 truncate max-w-[200px]">
                        {dl.context}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Entities */}
              {n.extracted_entities && (
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  {n.extracted_entities.fees?.map((fee, fi) => (
                    <span key={fi} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Fee: {fee}
                    </span>
                  ))}
                  {n.extracted_entities.circular_refs?.map((ref, ri) => (
                    <span key={ri} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upload Modal (Faculty Only) */}
        {showUpload && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Upload Official Circular / Notice</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Schedule for Spring 2026 Practical Examinations"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Examination">Examination</option>
                    <option value="Internship">Internship</option>
                    <option value="Circular">Circular</option>
                    <option value="Event">Event</option>
                    <option value="Academic Regulations">Academic Regulations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Announcement Text
                  </label>
                  <textarea
                    rows={4}
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Full announcement body, dates, regulations, and instructions..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Attach Circular PDF (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 rounded-xl bg-purpleAccent-600 hover:bg-purpleAccent-700 text-white text-xs font-bold flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing with NLP...</span>
                      </>
                    ) : (
                      <span>Publish & Index</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
