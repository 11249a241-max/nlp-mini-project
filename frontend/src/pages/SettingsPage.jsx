import React, { useState } from 'react';
import Header from '../components/Header';
import { Settings, Cpu, Database, Bell, Shield, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [modelType, setModelType] = useState(() => localStorage.getItem('campusmind_nlp_model') || 'all-MiniLM-L6-v2');
  const [similarityThreshold, setSimilarityThreshold] = useState(() => Number(localStorage.getItem('campusmind_sim_threshold')) || 60);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(() => localStorage.getItem('campusmind_alerts') !== 'false');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('campusmind_nlp_model', modelType);
    localStorage.setItem('campusmind_sim_threshold', similarityThreshold);
    localStorage.setItem('campusmind_alerts', enableEmailAlerts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 pb-16">
      <Header 
        title="Application Settings & NLP Configuration" 
        subtitle="Manage vector embedding models, similarity sensitivity, and alert preferences" 
      />

      <div className="max-w-4xl mx-auto px-8 pt-8 space-y-8">
        <form onSubmit={handleSave} className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-brand-600" />
              <span>NLP & Vector Engine Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuning parameters for dense embedding pipelines and FAISS vector indexing
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Active Sentence-BERT Embedding Model
              </label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (384 Dimensions — Fast & Accurate)</option>
                <option value="paraphrase-MiniLM-L3-v2">paraphrase-MiniLM-L3-v2 (Ultra Lightweight)</option>
                <option value="multi-qa-MiniLM-L6-cos-v1">multi-qa-MiniLM-L6-cos-v1 (QA Optimized)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Project Overlap Warning Threshold ({similarityThreshold}%)
                </label>
                <span className="text-xs font-bold text-brand-600">{similarityThreshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Submissions exceeding this hybrid cosine score trigger faculty review flagging.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Notification Alerts</p>
                <p className="text-xs text-slate-500">Receive alerts when faculty reviews your project or comments</p>
              </div>
              <input
                type="checkbox"
                checked={enableEmailAlerts}
                onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Preferences updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
