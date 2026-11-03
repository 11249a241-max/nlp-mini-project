import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  GitCompare, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Layers, 
  Search, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  FileCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function ProjectSimilarity() {
  const { isFaculty } = useAuth();
  
  // Submission Form State
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState(['Python', 'PyTorch', 'OpenCV']);
  const [objectives, setObjectives] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [submittedProject, setSubmittedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'history', 'review'
  
  const [projectsList, setProjectsList] = useState([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.getProjects();
      setProjectsList(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleAddTech = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!technologies.includes(techInput.trim())) {
        setTechnologies([...technologies, techInput.trim()]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (t) => {
    setTechnologies(technologies.filter((item) => item !== t));
  };

  const handleFillPlantDiseaseExample = () => {
    setTitle('AI-Based Plant Disease Detection');
    setAbstract('An intelligent computer vision system utilizing deep convolutional neural networks to classify and diagnose crop leaf foliar pathologies in tomato, potato, and maize crops, aiming to reduce yield loss for rural farmers.');
    setDescription('The application takes field photographs captured via mobile cameras, preprocesses the image using color balancing and contour extraction, and passes feature maps into a trained ResNet model for pathogen classification.');
    setTechnologies(['Python', 'PyTorch', 'OpenCV', 'CNN', 'ResNet50', 'FastAPI']);
    setObjectives('1. Identify foliar diseases with >90% validation accuracy.\n2. Provide real-time classification on crop leaf images.\n3. Assist farmers with actionable intervention advice.');
  };

  const handleRunAnalysis = async (isFinalSubmission = false) => {
    if (!title || !abstract || !description || !objectives) {
      alert('Please fill out all required project fields.');
      return;
    }

    setAnalyzing(true);
    setReport(null);

    const payload = {
      title,
      abstract,
      description,
      technologies,
      main_objectives: objectives
    };

    try {
      if (isFinalSubmission) {
        const res = await projectAPI.submitProject(payload);
        setSubmittedProject(res.data);
        setReport(res.data.similarity_result);
        fetchProjects();
      } else {
        const res = await projectAPI.analyzeDraft(payload);
        setReport(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Analysis failed. Please check inputs.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFacultyReview = async (projectId, status) => {
    try {
      await projectAPI.reviewProject(projectId, {
        faculty_status: status,
        faculty_review_notes: reviewNotes || `Faculty evaluated project: marked as ${status}.`
      });
      setReviewingId(null);
      setReviewNotes('');
      fetchProjects();
    } catch (err) {
      alert('Failed to update review status.');
    }
  };

  const chartData = report?.top_matches?.map((m) => ({
    name: m.title.length > 25 ? m.title.substring(0, 22) + '...' : m.title,
    similarity: m.overall_similarity
  })) || [];

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="Smart Project Similarity & Innovation Detector" 
        subtitle="Signature NLP original work validator combining TF-IDF lexical overlap and Sentence-BERT semantic embeddings" 
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'new'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            New Project Originality Check
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchProjects(); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isFaculty ? 'Department Project Review Queue' : 'My Submission History'} ({projectsList.length})
          </button>
        </div>

        {activeTab === 'new' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Layers className="h-5 w-5 text-brand-600" />
                    <span>Project Submission Details</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleFillPlantDiseaseExample}
                    className="text-xs font-bold text-purpleAccent-600 hover:text-purpleAccent-700 bg-purpleAccent-50 px-3 py-1.5 rounded-lg border border-purpleAccent-200 transition-colors"
                  >
                    ✨ Fill Example (Plant Disease)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI-Based Plant Disease Detection"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Abstract
                  </label>
                  <textarea
                    rows={4}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Provide a formal summary of the research motivation and methodology..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Technical Description & Architecture
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe frameworks, neural architectures, data pipelines..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Technologies & Tools (Press Enter)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {technologies.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(t)}
                          className="hover:text-rose-600 text-slate-400 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    placeholder="Type technology (e.g. PyTorch, React, OpenCV) and hit Enter"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Main Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="Key deliverables and measurable goals..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleRunAnalysis(false)}
                    disabled={analyzing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-brand-600" />
                    )}
                    <span>Run Live Similarity Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunAnalysis(true)}
                    disabled={analyzing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit to University Repository</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-6 space-y-6">
              {analyzing ? (
                <div className="p-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">Processing NLP Similarity Pipelines...</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Tokenizing text, calculating TF-IDF n-gram vectors, generating 384-dimensional Sentence-BERT embeddings, and searching university archives.
                  </p>
                </div>
              ) : report ? (
                <div className="space-y-6">
                  {/* Score Hero Card */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Originality & Overlap Matrix
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.overall_similarity_score > 60
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : report.overall_similarity_score > 35
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}>
                        {report.overall_similarity_score > 60 
                          ? 'High Prior Work Overlap' 
                          : report.overall_similarity_score > 35 
                          ? 'Moderate Overlap' 
                          : 'High Novelty Detected'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Textual (TF-IDF)</span>
                        <div className="text-2xl font-black text-slate-800 mt-1">
                          {report.textual_similarity_score}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-purpleAccent-50 border border-purpleAccent-200 text-center">
                        <span className="text-[11px] font-bold text-purpleAccent-700 uppercase">Semantic (S-BERT)</span>
                        <div className="text-2xl font-black text-purpleAccent-900 mt-1">
                          {report.semantic_similarity_score}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-center">
                        <span className="text-[11px] font-bold text-brand-700 uppercase">Overall Hybrid</span>
                        <div className="text-2xl font-black text-brand-900 mt-1">
                          {report.overall_similarity_score}%
                        </div>
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-1 pt-2">
                      {report.similarity_explanations?.map((exp, i) => (
                        <p key={i} className="text-xs text-slate-600 leading-relaxed font-medium">
                          • {exp}
                        </p>
                      ))}
                    </div>

                    {/* Academic Disclaimer */}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Academic Indicator Notice:</strong> Similarity scores are algorithmic indicators for faculty review and do not automatically prove plagiarism or bad intent.
                      </span>
                    </div>
                  </div>

                  {/* Top 5 Similar Projects Comparison */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Top 5 Similar Archive Projects
                    </h4>

                    {report.top_matches?.length > 0 ? (
                      <div className="space-y-3">
                        {report.top_matches.map((match, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-slate-900 text-xs">{match.title}</h5>
                              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-brand-100 text-brand-800 shrink-0">
                                {match.overall_similarity}% match
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{match.abstract}</p>

                            {match.matching_keywords?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Overlap:</span>
                                {match.matching_keywords.map((kw, ki) => (
                                  <span key={ki} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No overlapping projects in archive.</p>
                    )}
                  </div>

                  {/* AI Innovation Directions Recommendations */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purpleAccent-50 via-white to-brand-50 border border-purpleAccent-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-purpleAccent-800">
                      <Lightbulb className="h-5 w-5 text-purpleAccent-600" />
                      <h4 className="font-bold text-sm">Recommended Innovation Directions</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      To differentiate your project from prior university work and maximize technical novelty, consider integrating these enhancements:
                    </p>

                    <div className="space-y-2.5">
                      {report.innovation_suggestions?.map((sug, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white border border-purpleAccent-100 shadow-xs flex items-start gap-2.5">
                          <Sparkles className="h-4 w-4 text-purpleAccent-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
                  <GitCompare className="h-10 w-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Similarity Engine Ready</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Fill out the project form on the left or use the plant disease example to test cosine similarity against department project archives.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History / Faculty Review Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isFaculty ? 'All Submitted Projects for Faculty Review' : 'Your Submitted Projects'}
            </h3>

            <div className="space-y-4">
              {projectsList.map((p) => (
                <div key={p.id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                      <p className="text-xs text-slate-500">
                        Submitted by: <span className="font-semibold text-slate-700">{p.student?.full_name || 'Alex Rivera'}</span> • {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (p.similarity_result?.overall_similarity_score ?? 0) > 60
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.similarity_result?.overall_similarity_score ?? 0}% Similarity
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {p.similarity_result?.faculty_status || 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{p.abstract}</p>

                  {/* Innovation directions badge preview */}
                  {p.similarity_result?.innovation_suggestions?.length > 0 && (
                    <div className="p-3 rounded-xl bg-purpleAccent-50/50 border border-purpleAccent-200/60 text-xs">
                      <span className="font-bold text-purpleAccent-900">Suggested Innovation Direction:</span>
                      <p className="text-slate-700 mt-0.5">{p.similarity_result.innovation_suggestions[0]}</p>
                    </div>
                  )}

                  {/* Faculty Review Action */}
                  {isFaculty && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500">Faculty Action:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFacultyReview(p.id, 'Approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Project</span>
                        </button>
                        <button
                          onClick={() => handleFacultyReview(p.id, 'Revision Needed')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-xs font-bold"
                        >
                          <span>Request Revision</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
