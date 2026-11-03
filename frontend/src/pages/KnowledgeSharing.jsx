import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { discussionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Tag, 
  HelpCircle,
  FileText,
  Loader2
} from 'lucide-react';

export default function KnowledgeSharing() {
  const { isFaculty, user } = useAuth();
  
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New question form state
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Auto-Detect');
  const [submitting, setSubmitting] = useState(false);

  // Active expanded discussion for viewing answers
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [answering, setAnswering] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory]);

  const fetchDiscussions = async () => {
    try {
      const res = await discussionAPI.getDiscussions({
        category: selectedCategory === 'All' ? undefined : selectedCategory
      });
      setDiscussions(res.data);
    } catch (err) {
      console.error("Error fetching discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setSubmitting(true);

    try {
      await discussionAPI.createDiscussion({
        title: newTitle,
        content: newContent,
        category: newCategory === 'Auto-Detect' ? null : newCategory
      });
      setShowNew(false);
      setNewTitle('');
      setNewContent('');
      fetchDiscussions();
    } catch (err) {
      alert("Failed to post discussion topic.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent || !activeDiscussion) return;
    setAnswering(true);

    try {
      const res = await discussionAPI.postAnswer(activeDiscussion.id, {
        content: answerContent
      });
      // Update local state
      setActiveDiscussion({
        ...activeDiscussion,
        answers: [...(activeDiscussion.answers || []), res.data]
      });
      setAnswerContent('');
      fetchDiscussions();
    } catch (err) {
      alert("Failed to submit answer.");
    } finally {
      setAnswering(false);
    }
  };

  const handleSummarizeThread = async (id) => {
    setSummarizing(true);
    setSummary('');
    try {
      const res = await discussionAPI.getSummary(id);
      setSummary(res.data.summary);
    } catch (err) {
      alert("Summarization failed.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleToggleResolve = async (id) => {
    try {
      const res = await discussionAPI.toggleResolve(id);
      setActiveDiscussion((prev) => prev ? { ...prev, is_resolved: res.data.is_resolved } : null);
      fetchDiscussions();
    } catch (err) {
      alert("Could not toggle resolution status.");
    }
  };

  const categories = [
    'All',
    'Artificial Intelligence',
    'Programming',
    'Database Management',
    'Mathematics',
    'Computer Networks',
    'Operating Systems',
    'General Academics'
  ];

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="Student Knowledge Sharing Platform" 
        subtitle="Collaborative academic forum with automated topic categorization and faculty-verified answers" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Category Filter & New Topic Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === c
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Ask Academic Question</span>
          </button>
        </div>

        {/* Discussion Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Topics List Column */}
          <div className={`space-y-4 ${activeDiscussion ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
            {discussions.map((d) => (
              <div
                key={d.id}
                onClick={() => { setActiveDiscussion(d); setSummary(''); }}
                className={`p-6 rounded-2xl bg-white border cursor-pointer transition-all ${
                  activeDiscussion?.id === d.id
                    ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20'
                    : 'border-slate-200/80 hover:border-brand-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    {d.category}
                  </span>
                  <span className="text-slate-400">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base leading-snug">{d.title}</h4>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{d.content}</p>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Asked by {d.user_name} ({d.user_role})
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-brand-600">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{d.answers_count} Answers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Thread Detail Column */}
          {activeDiscussion && (
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purpleAccent-50 text-purpleAccent-700 border border-purpleAccent-200">
                      {activeDiscussion.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug pt-2">
                      {activeDiscussion.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Posted by {activeDiscussion.user_name} ({activeDiscussion.user_role}) • {new Date(activeDiscussion.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleResolve(activeDiscussion.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                        activeDiscussion.is_resolved
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{activeDiscussion.is_resolved ? 'Resolved' : 'Mark Resolved'}</span>
                    </button>
                    <button
                      onClick={() => handleSummarizeThread(activeDiscussion.id)}
                      disabled={summarizing}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold shrink-0 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                      <span>{summarizing ? 'Summarizing...' : 'NLP Thread Summary'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeDiscussion.content}
                </div>

                {/* NLP Extractive Summary Box */}
                {summary && (
                  <div className="p-4 rounded-xl bg-purpleAccent-50 border border-purpleAccent-200 text-xs space-y-1.5">
                    <span className="font-bold text-purpleAccent-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purpleAccent-600" />
                      Extractive Discussion Summary:
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">{summary}</p>
                  </div>
                )}

                {/* Answers List */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Answers ({activeDiscussion.answers?.length || 0})
                  </h4>

                  {activeDiscussion.answers?.length > 0 ? (
                    <div className="space-y-3">
                      {activeDiscussion.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                            ans.is_faculty_verified
                              ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{ans.user_name}</span>
                              {ans.is_faculty_verified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px]">
                                  <ShieldCheck className="h-3 w-3" />
                                  Faculty Verified Answer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(ans.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{ans.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No answers posted yet. Be the first to answer!</p>
                  )}
                </div>

                {/* Answer Submission Box */}
                <form onSubmit={handlePostAnswer} className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isFaculty ? 'Post Faculty Answer (Auto-Verified)' : 'Submit Answer'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="Provide a technically grounded response, code explanation, or textbook reference..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={answering || !answerContent.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50"
                    >
                      {answering ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>Post Answer</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* New Question Modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Ask an Academic Question</h3>
                <button onClick={() => setShowNew(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Question Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. How does backpropagation compute gradients through LSTM gates?"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Domain Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Auto-Detect">✨ NLP Auto-Detect Category</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Programming">Programming</option>
                    <option value="Database Management">Database Management</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="General Academics">General Academics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Details & Code Snippets
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Explain what you have tried, formulas, or specific code blocks..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Post to Forum</span>
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
