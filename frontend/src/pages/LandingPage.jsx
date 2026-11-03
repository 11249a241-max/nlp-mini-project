import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  GitCompare, 
  Bot, 
  MessageSquareWarning, 
  BellRing, 
  Users, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (role) => {
    try {
      if (role === 'STUDENT') {
        await login('student@campusmind.edu', 'password123');
        navigate('/student/dashboard');
      } else {
        await login('faculty@campusmind.edu', 'password123');
        navigate('/faculty/dashboard');
      }
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-brand-600 via-purpleAccent-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">CampusMind AI</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purpleAccent-50 text-purpleAccent-700 border border-purpleAccent-200 uppercase">
                University SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 bg-gradient-to-b from-white via-brand-50/30 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purpleAccent-50 border border-purpleAccent-200 text-purpleAccent-700 text-xs font-bold mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-purpleAccent-600" />
            <span>Next-Generation Natural Language Processing for Higher Education</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
            Making University Life Smarter with <span className="bg-gradient-to-r from-brand-600 via-purpleAccent-600 to-indigo-600 bg-clip-text text-transparent">Artificial Intelligence</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            CampusMind AI empowers students and faculty with intelligent project originality detection, automated circular analysis, sentiment analytics, and context-aware academic reasoning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => handleQuickLogin('STUDENT')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5"
            >
              <span>Demo Student Portal</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleQuickLogin('FACULTY')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <ShieldCheck className="h-4 w-4 text-purpleAccent-600" />
              <span>Demo Faculty Portal</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Sentence-BERT & FAISS Vector Search</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Grounded Document Citations (RAG)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Aspect-Based Sentiment Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Six Specialized Academic NLP Engines
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every module combines classical computational linguistics with modern dense embeddings to solve actual university workflow bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Module 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Academic Assistant</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload course PDFs and query regulations or engineering concepts. Uses FAISS retrieval-augmented generation to provide verified citations with exact page numbers.
            </p>
          </div>

          {/* Module 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purpleAccent-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-purpleAccent-50 text-purpleAccent-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GitCompare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Project Similarity Detector</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hybrid TF-IDF + Sentence-BERT similarity engine comparing student abstracts against past university projects, identifying overlap, and proposing innovation directions.
            </p>
          </div>

          {/* Module 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Feedback & Complaint Analyzer</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automatically parses unstructured student grievances into 9 categories, extracts aspect sentiments, computes urgency priority, and presents real-time analytics to faculty.
            </p>
          </div>

          {/* Module 4 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BellRing className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Notice Intelligence</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              PDF circular extraction with automated extractive summarization, Named Entity Recognition for examination fees, and explicit deadline extraction with natural language search.
            </p>
          </div>

          {/* Module 5 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Knowledge Sharing Platform</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Peer-to-peer discussion forum with automated subject domain classification, duplicate question detection, thread summarization, and faculty-verified solution pins.
            </p>
          </div>

          {/* Module 6 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Research Topic Discovery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore state-of-the-art research abstracts across AI, Healthcare, Agriculture, and Cybersecurity with semantic matching and promising investigative research directions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-brand-400" />
            <span className="text-white font-bold">CampusMind AI</span>
            <span>— Making University Life Smarter with Artificial Intelligence</span>
          </div>
          <p>© 2026 CampusMind AI Platform. Designed for Academic Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
