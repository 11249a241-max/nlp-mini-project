import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { researchAPI } from '../services/api';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  Lightbulb, 
  ArrowUpRight, 
  Tag, 
  Loader2, 
  ShieldAlert,
  Compass
} from 'lucide-react';

export default function ResearchDiscovery() {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomainsAndPapers();
  }, [selectedDomain]);

  const loadDomainsAndPapers = async () => {
    try {
      const [domRes, recRes] = await Promise.all([
        researchAPI.getDomains(),
        researchAPI.getRecommendations({
          domain: selectedDomain === 'All' ? undefined : selectedDomain
        })
      ]);
      setDomains(['All', ...domRes.data]);
      setPapers(recRes.data);
    } catch (err) {
      console.error("Error loading research papers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) {
      loadDomainsAndPapers();
      return;
    }

    setLoading(true);
    try {
      const res = await researchAPI.searchTopics({
        query,
        domain: selectedDomain === 'All' ? undefined : selectedDomain
      });
      setPapers(res.data);
    } catch (err) {
      alert("Research query failed.");
    } finally {
      setLoading(false);
    }
  };

  const sampleSearchTerms = [
    "Transformer clinical reasoning",
    "Vision Transformer crop leaf",
    "Adversarial prompt injection in RAG",
    "Bilingual educational chatbots"
  ];

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="AI Research Topic Discovery" 
        subtitle="Explore verified state-of-the-art research abstracts, semantic trends, and emerging project extensions" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Search Hero */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-900 via-purpleAccent-950 to-slate-900 text-white shadow-xl shadow-brand-900/10 space-y-5">
          <div className="flex items-center gap-2 text-brand-300">
            <Compass className="h-6 w-6 text-brand-400" />
            <span className="font-extrabold uppercase text-xs tracking-wider">Semantic Research Explorer</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight max-w-2xl leading-snug">
            Discover Your Next Undergraduate or Capstone Research Direction
          </h2>

          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1.5 max-w-3xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across AI, Healthcare, Agriculture, Cybersecurity, NLP..."
              className="flex-1 px-4 py-2.5 text-sm bg-transparent text-white placeholder-slate-300 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Search Abstracts</span>
            </button>
          </form>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Try exploring:</span>
            {sampleSearchTerms.map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setQuery(term); handleSearch(); }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Gap Disclaimer */}
        <div className="p-4 rounded-xl bg-purpleAccent-50 border border-purpleAccent-200 flex items-start gap-3 text-xs text-purpleAccent-900">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-purpleAccent-700" />
          <span>
            <strong>Academic Research Notice:</strong> Suggested extensions represent algorithmic extrapolations and possible novel directions for academic investigation. They do not claim that a research gap is entirely unexplored in global scientific literature; student researchers must conduct formal literature reviews to verify uniqueness.
          </span>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDomain === dom
                  ? 'bg-purpleAccent-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md hover:border-purpleAccent-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-purpleAccent-50 text-purpleAccent-700 border border-purpleAccent-200">
                    {p.domain}
                  </span>
                  <span className="text-slate-400 font-semibold">{p.publication_year}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-base leading-snug">{p.title}</h4>
                <p className="text-xs text-slate-500 font-medium">By {p.authors}</p>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">{p.abstract}</p>

                {/* Keywords */}
                {p.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {p.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Potential Innovation Extensions */}
              {p.potential_extensions?.length > 0 && (
                <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-200/70 text-xs space-y-2 mt-4">
                  <span className="font-bold text-brand-900 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-brand-600" />
                    Potential Student Project Extensions:
                  </span>
                  <div className="space-y-1">
                    {p.potential_extensions.map((ext, idx) => (
                      <p key={idx} className="text-slate-700 leading-relaxed font-medium">
                        • {ext}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
