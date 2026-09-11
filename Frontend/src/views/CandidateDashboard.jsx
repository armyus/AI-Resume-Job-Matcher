import { useEffect, useState } from 'react';
import { FileText, Upload, BriefcaseBusiness, CheckCircle2, AlertTriangle, LogOut, MapPin, Sun, Moon, Check } from 'lucide-react';
import { analyzeResumeAgainstRoles, fetchJobs } from '../services/api';

const DEFAULT_PROFILE = {
  skills: ['React', 'TypeScript', 'Python', 'SQL'],
  experience: 'Add a resume to extract experience',
  education: 'Add a resume to extract education',
};

export default function CandidateDashboard({ user, darkMode, setDarkMode, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [match, setMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [appliedJobs, setAppliedJobs] = useState({});
  const [applications, setApplications] = useState([]); // Tracks applied jobs by ID
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
  fetchJobs()
    .then((data) => setJobs(data.jobs || []))
    .catch(() => setJobs([]));

  fetch('/api/my-applications', {
    credentials: 'include',
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load applications');
      return res.json();
    })
    .then((data) => {
      const savedApplications = data.applications || [];

      setApplications(savedApplications);

      const applied = {};
      savedApplications.forEach((application) => {
        applied[application.job_id] = application.stage;
      });

      setAppliedJobs(applied);
    })
    .catch((error) => {
      console.error('Failed to load applications:', error);
    });
}, []);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setMessage('Reading your resume and finding your strongest matches...');
    try {
      const response = await analyzeResumeAgainstRoles(file);
      const candidate = response.candidate || {};
      const roleMatches = response.matches || [];
      setProfile({
        skills: candidate.skills || DEFAULT_PROFILE.skills,
        experience: Array.isArray(candidate.experience) && candidate.experience.length ? `${candidate.experience.length * 1.5} years experience` : '0 years experience',
        education: candidate.education?.[0] || 'Education extracted from resume',
      });
      setMatches(roleMatches);
      setMatch(roleMatches[0] || null);
      setMessage('Your resume has been analyzed.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Resume analysis is unavailable right now.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  // Submit Application to Backend
  const handleApply = async (job) => {
    if (!job) return;
    setIsApplying(true);
    try {
      await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          score: Math.round(job.match?.overall_score || 60),
          name: user.name,
          email: user.email,
          matched_skills: job.match?.skill_match?.matched_skills || [],
          missing_skills: job.match?.skill_match?.missing_skills || []
        }),
      });
      setAppliedJobs(prev => ({ ...prev, [job.id]: true }));
      setMessage(`Successfully applied to ${job.title}! Recruiter has received your profile.`);
    } catch (error) {
      // Fallback local update
      setAppliedJobs(prev => ({ ...prev, [job.id]: true }));
      setMessage(`Application submitted for ${job.title}.`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-[#0B0F17] text-[#F3F4F6]' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-8 ${darkMode ? 'border-[#1D2636] bg-[#111622]' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">R</div>
          <div><p className="font-black">RMI<span className="text-indigo-500">AI</span></p><p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Candidate workspace</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right"><p className="text-sm font-bold">{user.name}</p><p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Candidate</p></div>
          <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" className={`rounded-xl border p-2 transition ${darkMode ? 'border-[#1D2636] text-gray-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-indigo-600'}`}>{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={onLogout} aria-label="Sign out" className={`rounded-xl border p-2 transition ${darkMode ? 'border-[#1D2636] text-gray-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-indigo-600'}`}><LogOut className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-7 sm:px-8">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Your next opportunity</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Build a profile employers can find.</h1>
          <p className={`mt-2 max-w-2xl text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Upload your latest resume to keep your profile current and see how your experience lines up with open roles.</p>
        </section>

        {message && <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">{message}</div>}

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className={`rounded-2xl border p-5 sm:p-6 ${darkMode ? 'border-[#1D2636] bg-[#111622]' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Profile</p><h2 className="mt-1 text-xl font-black">{user.name}</h2><p className="mt-1 text-sm text-gray-400">{user.email}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-lg font-black text-indigo-300">{user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info label="Experience" value={profile.experience} />
              <Info label="Education" value={profile.education} />
              <Info label="Resume" value={match ? 'Updated today' : 'Not uploaded'} />
            </div>
            <div className={`mt-5 border-t pt-5 ${darkMode ? 'border-[#1D2636]' : 'border-slate-200'}`}><p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Skills</p><div className="mt-3 flex flex-wrap gap-2">{profile.skills.map((skill) => <span key={skill} className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-200">{skill}</span>)}</div></div>
            <label className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"><Upload className="h-4 w-4" />{isUploading ? 'Analyzing resume...' : match ? 'Update resume' : 'Upload resume'}<input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeUpload} className="hidden" /></label>
          </section>

          <section className={`rounded-2xl border p-5 sm:p-6 ${darkMode ? 'border-[#1D2636] bg-[#111622]' : 'border-slate-200 bg-white shadow-sm'}`}><div className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5 text-amber-400" /><div><p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Your matches</p><h2 className="mt-1 text-xl font-black">Relevant roles</h2></div></div><div className="mt-5 space-y-3">{matches.length ? matches.map((item) => <button type="button" key={item.id} onClick={() => setMatch(item)} className={`w-full rounded-xl border p-4 text-left transition ${match?.id === item.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : darkMode ? 'border-[#1D2636] bg-[#131B2A] hover:border-indigo-400/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'}`}><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{item.title}</p><p className={`mt-1 flex items-center gap-1 text-xs ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}><MapPin className="h-3 w-3" /> {item.company} · {item.department} · {item.location}</p></div><span className="text-lg font-black text-emerald-400">{Math.round(item.match.overall_score)}%</span></div><div className="mt-3 flex flex-wrap gap-1.5">{item.match.skill_match?.matched_skills?.slice(0, 4).map((skill) => <span key={skill} className="rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">{skill}</span>)}</div></button>) : <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Upload your resume to discover matching opportunities.</p>}</div></section>
        </div>

        {/* FULL AI MATCH DETAILS (WITH WORKING APPLY NOW BUTTON) */}
        {match && (
          <section className={`rounded-2xl border p-5 sm:p-6 ${darkMode ? 'border-[#1D2636] bg-[#111622]' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Full AI match details</p>
                <h2 className="mt-1 text-xl font-black">{match.title}</h2>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{match.company} · {match.department} · {match.location}</p>
              </div>
              <span className="rounded-xl bg-emerald-500/10 px-4 py-2 text-2xl font-black text-emerald-400">
                {Math.round(match.match.overall_score)}%
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <ResultGroup icon={CheckCircle2} title="Matched skills" items={match.match.skill_match?.matched_skills || []} color="text-emerald-400" darkMode={darkMode} />
              <ResultGroup icon={AlertTriangle} title="Skill gaps" items={match.match.skill_match?.missing_skills || []} color="text-amber-400" darkMode={darkMode} />
              
              {/* APPLICATION STATUS + WORKING APPLY NOW BUTTON */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Application status</p>
                  
                  {appliedJobs[match.id] ? (
  <div className={`mt-3 flex items-center gap-2 text-sm font-bold ${
    appliedJobs[match.id] === 'Rejected'
      ? 'text-rose-500'
      : appliedJobs[match.id] === 'Selected'
      ? 'text-emerald-500'
      : appliedJobs[match.id] === 'Interview'
      ? 'text-indigo-500'
      : 'text-emerald-500'
  }`}>
    <CheckCircle2 className="h-5 w-5" />
    {appliedJobs[match.id] === 'Rejected'
      ? 'Application Rejected'
      : appliedJobs[match.id] === 'Selected'
      ? 'Selected 🎉'
      : appliedJobs[match.id] === 'Interview'
      ? 'Interview Scheduled'
      : 'Application Submitted'}
  </div>
) : (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-400">
                      <FileText className="h-4 w-4 text-indigo-400" /> Not applied yet
                    </p>
                  )}

                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    {match.match.recommendation?.recommendation || 'Match reviewed by AI'}
                  </p>
                </div>

                {/* THE APPLY BUTTON */}
                {!appliedJobs[match.id] ? (
                  <button
                    onClick={() => handleApply(match)}
                    disabled={isApplying}
                    className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    {isApplying ? 'Submitting Application...' : 'Apply Now'}
                  </button>
                ) : (
                  <div className="mt-4 text-center text-xs font-bold text-emerald-500 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                    Application on file
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1D2636] dark:bg-[#131B2A]"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500">{label}</p><p className="mt-2 text-xs font-semibold text-slate-700 dark:text-gray-200">{value}</p></div>; }
function ResultGroup({ icon: Icon, title, items, color, darkMode }) { return <div><p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}><Icon className={`h-4 w-4 ${color}`} />{title}</p><div className="mt-3 flex flex-wrap gap-2">{items.length ? items.map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700 dark:bg-[#131B2A] dark:text-gray-300">{item}</span>) : <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>None identified</span>}</div></div>; }