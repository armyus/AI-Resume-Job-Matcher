import React, { useState } from 'react';
import ScoreGauge from '../components/ScoreGauge';
import { Upload, Download, CheckCircle2, AlertTriangle, HelpCircle, Calendar, Mail, MapPin } from 'lucide-react';

export default function DashboardView({ candidateData, onFileUpload }) {
  const [activeSubTab, setActiveSubTab] = useState('Skills Gap');

  // Sliders state for dynamic weighting recalculation
  const [weights, setWeights] = useState({ skills: 50, experience: 35, education: 15 });

  return (
    <div className="p-6 grid grid-cols-12 gap-5 max-w-[1700px] mx-auto">
      
      {/* ================= LEFT SIDEBAR (25% / 3 cols) ================= */}
      <div className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-32px)] lg:overflow-y-auto lg:pr-1">
        {/* Active Role Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4">
          <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-500">Active Role</span>
          <select className="w-full mt-2 bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl p-2.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none">
            <option>Senior Full Stack Engineer (Req #402)</option>
            <option>ML Infrastructure Engineer (Req #398)</option>
            <option>Product Manager — Growth (Req #391)</option>
          </select>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="bg-[var(--bg-card)] border border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition">
          <input type="file" onChange={onFileUpload} className="hidden" id="resume-upload" />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              Drag & Drop or <span className="text-indigo-500">Browse</span>
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">PDF or Word document</p>
          </label>
        </div>

        {/* Candidate Queue */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)]">Candidate Queue</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500">4</span>
          </div>

          <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {candidateData ? [candidateData].map((c, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  c.active
                    ? 'bg-indigo-600/10 border-indigo-500/40'
                    : 'bg-[var(--bg-input)] border-transparent hover:border-[var(--border-card)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {c.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{c.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{c.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.color || 'bg-emerald-500/10 text-emerald-500'}`}>
                  {c.score}
                </span>
              </div>
            )) : <p className="py-3 text-xs text-[var(--text-muted)]">No candidates analyzed yet.</p>}
          </div>
        </div>
      </div>

      {/* ================= CENTER WORKBENCH (50% / 6 cols) ================= */}
      <div className="col-span-12 lg:col-span-6 space-y-4">
        
        {/* Candidate Profile Header Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">{candidateData?.name || 'No candidate analyzed'}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500">New</span>
              </div>
              <p className="text-xs font-semibold text-[var(--text-muted)]">{candidateData?.role || 'Select a role and upload a resume'}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {candidateData?.location || 'Location unavailable'}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {candidateData?.email || 'Email unavailable'}</span>
              </div>
            </div>
          </div>

          <button className="px-3.5 py-2 rounded-xl border border-indigo-500/30 text-indigo-500 font-bold text-xs hover:bg-indigo-500/10 flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" /> Download Resume
          </button>
        </div>

        {/* Score & Weighting Controls Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5 flex justify-center border-r border-[var(--border-card)] pr-4">
            <ScoreGauge score={candidateData?.baseScore || 0} />
          </div>

          {/* Auto-Sliding Match Breakdown Meters */}
          <div className="col-span-7 space-y-3 pl-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                MATCH WEIGHTING
              </span>
              <span className="text-[10px] font-bold text-indigo-500">
                AI Evaluated
              </span>
            </div>

            {(() => {
              // 1. Automatically calculate unique scores for each candidate:
              
              // Skills: Matched vs Missing ratio
              const matchedCount = selectedCandidate?.matchedSkills?.length || 0;
              const missingCount = selectedCandidate?.missingSkills?.length || 0;
              const totalSkills = matchedCount + missingCount;
              const autoSkills = totalSkills > 0 
                ? Math.round((matchedCount / totalSkills) * 100) 
                : (selectedCandidate?.scores?.tech || 50);

              // Experience: Candidate years vs JD requirement (e.g. 1.0 yr / 5 yrs = 20%)
              const candYrs = parseFloat(selectedCandidate?.expYrs) || 1.0;
              const reqYrs = parseFloat(selectedCandidate?.reqExpYrs) || 5.0;
              const autoExperience = Math.min(100, Math.max(10, Math.round((candYrs / reqYrs) * 100)));

              // Education: degree verification score
              const hasEdu = selectedCandidate?.education && selectedCandidate.education.length > 0;
              const autoEducation = hasEdu ? (selectedCandidate?.scores?.edu || 85) : 40;

              const metricItems = [
                { label: 'Skills', val: autoSkills },
                { label: 'Experience', val: autoExperience },
                { label: 'Education', val: autoEducation }
              ];

              return metricItems.map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{s.label}</span>
                    <span className="text-indigo-500 font-bold">{s.val}%</span>
                  </div>

                  {/* Self-Sliding Animated Track with Knob */}
                  <div className="relative w-full h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-visible">
                    {/* Animated Filled Bar */}
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${s.val}%` }}
                    />
                    {/* Animated Knob that automatically slides itself to the value */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-indigo-600 border-2 border-white dark:border-[#111622] rounded-full shadow-md transition-all duration-700 ease-out pointer-events-none"
                      style={{ left: `calc(${s.val}% - 7px)` }}
                    />
                  </div>
                </div>
              ));
            })()}

            {/* Experience Match Bar */}
            <div className="pt-2 border-t border-[var(--border-card)] space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-[var(--text-muted)]">Candidate Experience: {candidateData?.expYrs || 'Not available'}</span>
                <span className="text-emerald-500 font-bold">JD Req: {candidateData?.reqExpYrs || 'Not specified'}</span>
              </div>
              <div 
  className="h-full bg-[#10B981] rounded-full transition-all duration-500" 
  style={{ 
    width: `${Math.min(100, Math.max(15, (parseFloat(selectedCandidate?.expYrs || 1) / 5) * 100))}%` 
  }}
></div>
            </div>
          </div>
        </div>

        {/* Detailed Skills & Matrix Tabs */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5">
          {/* Sub Navigation */}
          <div className="flex gap-6 border-b border-[var(--border-card)] pb-3 mb-4">
            {['Skills Gap', 'Experience Timeline', 'Projects & Education'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-xs font-bold transition relative ${
                  activeSubTab === tab ? 'text-indigo-500' : 'text-[var(--text-muted)]'
                }`}
              >
                {tab}
                {activeSubTab === tab && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Matched Required Skills */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Matched Required Skills</h4>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">7</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(candidateData?.matchedSkills || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Missing Required Skills</h4>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">3</span>
                </div>
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Risk: Cloud DevOps
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(candidateData?.missingSkills || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Adjacent / Transferable Skills */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Adjacent / Transferable Skills</h4>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500">4</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['GCP', 'Vue.js', 'MongoDB', 'Azure DevOps'].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT INTELLIGENCE PANEL (25% / 3 cols) ================= */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        
        {/* AI Verdict Box */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> AI Verdict: {candidateData?.verdictTitle || 'No analysis yet'}
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-indigo-500">Key Strengths</p>
            <ul className="list-disc pl-4 text-[var(--text-muted)] space-y-1">
              {(candidateData?.strengths || []).map((strength) => <li key={strength}>{strength}</li>)}
            </ul>

            <p className="font-bold text-amber-500 pt-1">Primary Risk Areas</p>
            <ul className="list-disc pl-4 text-[var(--text-muted)] space-y-1">
              {(candidateData?.risks || []).map((risk) => <li key={risk}>{risk}</li>)}
            </ul>
          </div>
        </div>

        {/* AI Generated Interview Questions */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-500">AI Interview Questions</span>
          
          {(candidateData?.questions || []).map((question) => <div key={question.text} className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-xs space-y-1"><p className="font-bold text-amber-500">{question.topic}</p><p className="text-[var(--text-muted)] leading-relaxed">{question.text}</p></div>)}
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20">
            Schedule Interview
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 rounded-xl border border-[var(--border-card)] hover:bg-rose-500/10 hover:text-rose-500 text-xs font-bold transition">
              Reject
            </button>
            <button className="py-2 rounded-xl border border-[var(--border-card)] text-xs font-bold transition">
              Export PDF
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}