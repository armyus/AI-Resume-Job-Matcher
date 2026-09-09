import React from 'react';
import { Download, Filter, LayoutGrid, LayoutList, Search, Star } from 'lucide-react';

export default function CandidatesView({
  darkMode,
  candidates,
  searchQuery,
  setSearchQuery,
  stageFilter,
  setStageFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onToggleStar,
  onExport,
  onViewProfile,
}) {
  const pipeline = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map((label) => ({
    label,
    count: candidates.filter((candidate) => candidate.stage === label).length,
    color: { Applied: 'bg-[#475569]', Screening: 'bg-[#6366F1]', Interview: 'bg-[#D97706]', Offer: 'bg-[#10B981]', Hired: 'bg-[#059669]' }[label],
    numberColor: { Applied: 'text-slate-400', Screening: 'text-indigo-400', Interview: 'text-amber-500', Offer: 'text-emerald-500', Hired: 'text-emerald-400' }[label],
  }));
  return (
    <main className="candidate-page flex flex-1 min-h-0 w-full flex-col overflow-hidden">
      <div className="candidate-summary flex-none space-y-5">
      <div className="candidate-intro flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Candidates</h1>
          <p className="mt-0.5 text-base text-slate-500 dark:text-gray-400">{candidates.length} analyzed candidates</p>
        </div>
        <button onClick={onExport} className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${darkMode ? 'bg-[#111622] border-[#1D2636] text-white hover:bg-[#161D2D]' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <section className={`candidate-pipeline rounded-2xl border p-5 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400">Hiring pipeline <span className="normal-case font-medium">— All Roles</span></p>
        <div className="grid grid-cols-2 gap-2 pt-5 sm:grid-cols-5">
          {pipeline.map((item) => (
            <div key={item.label} className="flex flex-col text-center">
              <div className="flex h-[98px] flex-col justify-end">
                <span className={`mb-3 block text-base font-black ${item.numberColor}`}>{item.count}</span>
                <div className={`candidate-pipeline-bar ${item.count === 3 ? 'h-[75px]' : item.count === 2 ? 'h-[50px]' : 'h-[25px]'} rounded-t-lg ${item.color} opacity-85`} />
              </div>
              <span className="mt-3 block text-sm font-medium text-slate-500 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
      </div>

      <div className="candidate-toolbar flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-[480px]">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-gray-400" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search candidates, roles, skills..." className={`w-full rounded-xl border py-3 pl-11 pr-4 text-base focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-[#131B2A] border-[#1D2636] text-white' : 'bg-white border-slate-200 text-slate-800'}`} />
          </div>
          <button className="p-2 text-slate-400 dark:text-gray-400" aria-label="Filter candidates"><Filter className="h-5 w-5" /></button>
          <div className="flex flex-wrap items-center gap-1">
            {['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map((stage) => (
              <button key={stage} onClick={() => setStageFilter(stage)} className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${stageFilter === stage ? 'border-indigo-500/50 bg-indigo-600/15 text-indigo-500 shadow-sm' : darkMode ? 'border-[#1D2636] bg-[#111622] text-slate-500 dark:text-gray-400' : 'border-[#D9E2EF] bg-white text-[#49658A] hover:bg-slate-50'}`}>
                {stage}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400">Sort:
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={`border-0 bg-transparent px-1 py-1 text-sm font-medium focus:outline-none ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <option>Score</option><option>Name</option><option>Date Applied</option>
            </select>
          </label>
          <div className={`flex items-center rounded-xl border p-1 ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setViewMode('list')} className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-indigo-600/15 text-indigo-500' : 'text-slate-400 dark:text-gray-400'}`} aria-label="List view"><LayoutList className="h-3.5 w-3.5" /></button>
            <button onClick={() => setViewMode('grid')} className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-indigo-600/15 text-indigo-500' : 'text-slate-400 dark:text-gray-400'}`} aria-label="Grid view"><LayoutGrid className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <div className="candidate-results min-h-0 flex-1 overflow-y-auto">
      {!candidates.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-[#1D2636] dark:text-gray-400">No candidates analyzed yet.</div>
      ) : viewMode === 'grid' ? (
        <div className="candidate-grid grid grid-cols-1 gap-5 pb-8 md:grid-cols-3 lg:grid-cols-5">
          {candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} darkMode={darkMode} onToggleStar={onToggleStar} onViewProfile={onViewProfile} />)}
        </div>
      ) : (
        <div className="candidate-grid space-y-3 pb-8">
          {candidates.map((candidate) => (
            <div key={candidate.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="flex min-w-0 items-center gap-3"><Avatar candidate={candidate} /><div className="min-w-0"><p className="truncate font-bold">{candidate.name}</p><p className="truncate text-sm text-slate-500">{candidate.role}</p></div></div>
              <div className="flex items-center gap-3 sm:gap-5"><span className="font-bold text-emerald-500">{candidate.score}</span><Stage candidate={candidate} /><button onClick={() => onViewProfile(candidate)} className="rounded-lg border border-indigo-500/30 px-4 py-2 text-sm text-indigo-500">View</button></div>
            </div>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}

function Avatar({ candidate }) {
  return <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white ${candidate.avatarColor}`}>{candidate.initials}</div>;
}

function Stage({ candidate }) {
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${candidate.stageColor}`}>{candidate.stage}</span>;
}

function CandidateCard({ candidate, darkMode, onToggleStar, onViewProfile }) {
  return (
    <article className={`candidate-card flex min-h-[283px] flex-col justify-between space-y-4 rounded-2xl border p-6 transition hover:border-indigo-500/50 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
      <div className="flex items-start justify-between"><div className="flex items-center gap-2.5"><Avatar candidate={candidate} /><div><p className="text-base font-extrabold leading-tight text-slate-900 dark:text-white">{candidate.name}</p><p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-400">{candidate.expYrs} experience</p></div></div><div className="flex items-center gap-1.5"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{candidate.score}</span><button onClick={() => onToggleStar(candidate.id)} aria-label={`Toggle ${candidate.name} favorite`}><Star className={`h-4 w-4 ${candidate.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-gray-600'}`} /></button></div></div>
      <p className="text-base font-medium leading-snug text-slate-800 dark:text-gray-200">{candidate.role}</p>
      <div className="flex items-center gap-2"><Stage candidate={candidate} /><span className={`text-sm font-extrabold ${candidate.verdictColor}`}>{candidate.verdict.replace(' Match', '')}</span></div>
      <div className="flex flex-wrap gap-1 pt-1">{candidate.topSkills.map((skill) => <span key={skill} className={`rounded-md px-3 py-1 text-sm font-medium ${darkMode ? 'border border-gray-700/40 bg-[#131B2A] text-gray-300' : 'border border-slate-200 bg-slate-100 text-slate-700'}`}>{skill}</span>)}</div>
      <button onClick={() => onViewProfile(candidate)} className="mt-1 w-full rounded-xl border border-indigo-500/30 py-2.5 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-600 hover:text-white dark:text-indigo-400">View Profile</button>
    </article>
  );
}
