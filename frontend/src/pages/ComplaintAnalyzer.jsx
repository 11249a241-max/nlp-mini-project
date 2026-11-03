import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquareWarning, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Tag, 
  TrendingUp, 
  Loader2, 
  Filter,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Neutral: '#64748b',
  Negative: '#f43f5e'
};

const PRIORITY_BADGES = {
  Critical: 'bg-rose-100 text-rose-700 border-rose-300 font-black animate-pulse',
  High: 'bg-amber-100 text-amber-700 border-amber-300 font-bold',
  Medium: 'bg-blue-100 text-blue-700 border-blue-300 font-semibold',
  Low: 'bg-slate-100 text-slate-700 border-slate-300'
};

export default function ComplaintAnalyzer() {
  const { isFaculty, user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submission form state
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'submit', 'analytics'

  // Faculty resolution state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [facultyResponse, setFacultyResponse] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');

  useEffect(() => {
    loadComplaints();
    if (isFaculty) {
      loadAnalytics();
    }
  }, [isFaculty]);

  const loadComplaints = async () => {
    try {
      const res = await complaintAPI.getComplaints();
      setComplaints(res.data);
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await complaintAPI.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !rawText) return;
    setSubmitting(true);

    try {
      await complaintAPI.submitComplaint({
        title,
        raw_text: rawText
      });
      setTitle('');
      setRawText('');
      setActiveTab('list');
      loadComplaints();
      if (isFaculty) loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id) => {
    try {
      await complaintAPI.updateStatus(id, {
        status: newStatus,
        faculty_response: facultyResponse
      });
      setSelectedComplaint(null);
      setFacultyResponse('');
      loadComplaints();
      if (isFaculty) loadAnalytics();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleFillExample = () => {
    setTitle('Insufficient practical sessions for programming concepts');
    setRawText('The practical sessions are insufficient, and students cannot understand programming concepts properly. We need more hands-on lab hours and guidance from teaching assistants in the compiler laboratory.');
  };

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="Student Feedback & Complaint Intelligence" 
        subtitle="Automated categorization, sentiment extraction, and grievance resolution tracking" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isFaculty ? 'All University Grievances' : 'My Grievance Tracking'} ({complaints.length})
            </button>

            {!isFaculty && (
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'submit'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Submit New Grievance
              </button>
            )}

            {isFaculty && (
              <button
                onClick={() => { setActiveTab('analytics'); loadAnalytics(); }}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Department Grievance Analytics</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab: Submit Form */}
        {activeTab === 'submit' && (
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Academic Grievance or Feedback</h3>
                <p className="text-xs text-slate-500">
                  Write in natural language. Our NLP engine will automatically categorize, tag aspects, and assign priority.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillExample}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
              >
                ✨ Example: Programming Lab
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brief Title / Subject
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Insufficient practical sessions for programming concepts"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Natural Language Description
                </label>
                <textarea
                  rows={5}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Describe the issue in detail. Example: The practical sessions are insufficient, and students cannot understand programming concepts properly..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Classifying with NLP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Grievance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Analytics (Faculty View) */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Filed</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">{analytics.total_complaints}</div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Under Investigation</span>
                <div className="text-3xl font-extrabold text-amber-600 mt-2">{analytics.pending_complaints}</div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Resolved</span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">{analytics.resolved_complaints}</div>
              </div>
            </div>

            {/* Recharts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Grievances by Category</h3>
                <p className="text-xs text-slate-500 mb-6">NLP text classification distribution</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.category_distribution}>
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4361eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Sentiment Polarity</h3>
                <p className="text-xs text-slate-500 mb-6">Analyzed via lexicon and syntactic scoring</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.sentiment_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.sentiment_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#6382f2'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recurring Keywords */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">Frequently Reported Problem Keywords</h3>
              <p className="text-xs text-slate-500 mb-4">Extracted prominent terms across all submitted complaints</p>
              <div className="flex flex-wrap gap-2">
                {analytics.recurring_keywords?.map((k, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5"
                  >
                    <span>#{k.keyword}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                      {k.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Complaints List */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {c.analysis?.category || 'General'}
                      </span>
                      {c.analysis?.subcategory && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                          {c.analysis.subcategory}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-md text-xs border ${
                        PRIORITY_BADGES[c.analysis?.priority_level || 'Medium']
                      }`}>
                        Priority: {c.analysis?.priority_level || 'Medium'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        c.analysis?.sentiment === 'Positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.analysis?.sentiment === 'Negative'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {c.analysis?.sentiment || 'Neutral'} ({c.analysis?.sentiment_score ?? 0})
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{c.title}</h4>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center ${
                    c.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : c.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    Status: {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  "{c.raw_text}"
                </p>

                {/* Aspect Sentiments */}
                {c.analysis?.aspect_sentiments?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Aspects:</span>
                    {c.analysis.aspect_sentiments.map((asp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs"
                      >
                        {asp.aspect}: {asp.sentiment}
                      </span>
                    ))}
                  </div>
                )}

                {/* Faculty Resolution Response */}
                {c.faculty_response && (
                  <div className="p-3.5 rounded-xl bg-purpleAccent-50 border border-purpleAccent-200 text-xs text-purpleAccent-900 space-y-1">
                    <span className="font-bold">Faculty Action Response:</span>
                    <p>{c.faculty_response}</p>
                  </div>
                )}

                {/* Faculty Update Control */}
                {isFaculty && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 font-semibold">
                      Student: {c.student?.full_name || 'Alex Rivera'} ({c.student?.identifier || 'Student'})
                    </span>

                    {selectedComplaint === c.id ? (
                      <div className="w-full space-y-3 pt-2">
                        <textarea
                          rows={2}
                          value={facultyResponse}
                          onChange={(e) => setFacultyResponse(e.target.value)}
                          placeholder="Type departmental resolution / action taken..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="Under Review">Under Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <button
                            onClick={() => handleUpdateStatus(c.id)}
                            className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                          >
                            Save Update
                          </button>
                          <button
                            onClick={() => setSelectedComplaint(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedComplaint(c.id);
                          setNewStatus(c.status);
                          setFacultyResponse(c.faculty_response || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                      >
                        Update Grievance Status
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
