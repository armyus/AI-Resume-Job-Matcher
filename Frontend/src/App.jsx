import React, { useState, useEffect } from 'react';
import { 
  Zap, Search, Sun, Moon, Bell, ChevronDown, Upload, Download, LogOut, 
  CheckCircle2, AlertTriangle, MapPin, Mail, Filter, Plus, Star, ChevronRight, FileText,
  X, Check, RefreshCw, Brain, Briefcase, Clock, DollarSign, Building, LayoutList, LayoutGrid
} from 'lucide-react';
import CandidatesView from './views/CandidatesView';
import Login from './components/Login';
import Register from './components/Register';
import { getCurrentUser } from './services/api';
import AnalyticsView from './views/AnalyticsView';
import RoleSelection from './components/RoleSelection';
import { analyzeResumeAndJD, createRole, fetchAnalyticsData, logoutUser } from './services/api';
import CandidateDashboard from './views/CandidateDashboard';

// ================= CANDIDATES DATASET (DASHBOARD WORKBENCH) =================
/* Legacy demo candidate fixtures removed from the active recruiter data path.
const CANDIDATES_DATA = [
  {
    id: 'alex',
    name: 'Alex Morgan',
    role: 'Senior Full Stack Engineer',
    reqId: '#402',
    location: 'San Francisco, CA',
    email: 'alex.morgan@email.com',
    initials: 'AM',
    date: 'Sep 5, 2026',
    baseScore: 87,
    statusText: 'Strong Match — High Fit',
    expYrs: '6.5 yrs',
    reqExpYrs: '5+ yrs',
    expPercent: 85,
    matchedSkills: ['React.js', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL', 'REST APIs', 'Git/CI-CD'],
    missingSkills: ['Docker', 'AWS ECS', 'Kubernetes'],
    adjacentSkills: ['GCP', 'Vue.js', 'MongoDB', 'Azure DevOps'],
    riskTitle: 'Risk: Cloud DevOps',
    verdictTitle: 'Proceed to Screening',
    strengths: [
      'Strong frontend ecosystem — React, TypeScript & GraphQL fully aligned',
      '6.5 yrs exceeds 5 yr requirement; high-velocity career trajectory',
      'Proven open-source contributions signal collaborative mindset'
    ],
    risks: [
      'Lacks direct Docker/Kubernetes experience — critical for DevOps rotation',
      'No AWS exposure; GCP background may require onboarding ramp'
    ],
    questions: [
      {
        topic: 'Cloud/DevOps Gap',
        text: 'How have you handled deployment pipelines without direct Docker experience? Can you walk us through a production deployment you owned?'
      },
      {
        topic: 'Infrastructure Gap',
        text: 'You\'ve worked with GCP — how would you map that knowledge to AWS ECS and Kubernetes if we required a 30-day ramp?'
      }
    ],
    scores: { tech: 91, exp: 84, edu: 78, cultural: 72 }
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Senior Full Stack Engineer',
    reqId: '#402',
    location: 'Austin, TX',
    email: 'priya.sharma@email.com',
    initials: 'PS',
    date: 'Sep 4, 2026',
    baseScore: 74,
    statusText: 'Good Fit — Review',
    expYrs: '4.0 yrs',
    reqExpYrs: '5+ yrs',
    expPercent: 65,
    matchedSkills: ['React.js', 'TypeScript', 'Node.js', 'Docker', 'REST APIs'],
    missingSkills: ['GraphQL', 'Kubernetes', 'PostgreSQL'],
    adjacentSkills: ['AWS Lambda', 'Express.js', 'MySQL'],
    riskTitle: 'Risk: Seniority Gap',
    verdictTitle: 'Technical Screen Recommended',
    strengths: ['Solid Docker and CI/CD deployment expertise', 'Clean modern React architecture code samples'],
    risks: ['4.0 years experience is below the 5+ year requirement for Senior rank'],
    questions: [{ topic: 'Experience Depth', text: 'Can you describe a system architecture project where you led technical decision-making end-to-end?' }],
    scores: { tech: 78, exp: 68, edu: 80, cultural: 82 }
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'ML Infrastructure Engineer',
    reqId: '#398',
    location: 'Seattle, WA',
    email: 'marcus.chen@email.com',
    initials: 'MC',
    date: 'Sep 3, 2026',
    baseScore: 61,
    statusText: 'Moderate Fit — Skill Gaps',
    expYrs: '3.5 yrs',
    reqExpYrs: '5+ yrs',
    expPercent: 50,
    matchedSkills: ['Node.js', 'PostgreSQL', 'REST APIs'],
    missingSkills: ['React.js', 'TypeScript', 'GraphQL', 'Docker', 'Kubernetes'],
    adjacentSkills: ['Angular', 'Python', 'Redis'],
    riskTitle: 'Risk: Stack Alignment',
    verdictTitle: 'Low Fit — Skill Gap High',
    strengths: ['Strong backend database design & SQL optimization'],
    risks: ['Lacks modern React & TypeScript experience requested in JD'],
    questions: [{ topic: 'Frontend Ramp-up', text: 'How quickly can you transition from Angular to modern React with TypeScript?' }],
    scores: { tech: 58, exp: 55, edu: 70, cultural: 65 }
  },
  {
    id: 'sofia',
    name: 'Sofia Reyes',
    role: 'Product Manager — Growth',
    reqId: '#391',
    location: 'New York, NY',
    email: 'sofia.reyes@email.com',
    initials: 'SR',
    date: 'Sep 2, 2026',
    baseScore: 91,
    statusText: 'Strong Match — High Fit',
    expYrs: '8.0 yrs',
    reqExpYrs: '5+ yrs',
    expPercent: 100,
    matchedSkills: ['React.js', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL', 'Docker', 'AWS ECS', 'Git/CI-CD'],
    missingSkills: ['Kubernetes'],
    adjacentSkills: ['Next.js', 'Serverless', 'Terraform'],
    riskTitle: 'Risk: Minimal',
    verdictTitle: 'Top Tier Candidate',
    strengths: ['8.0 yrs deep full stack leadership', 'Full match on core frontend, backend, and AWS deployment stack'],
    risks: ['May expect upper compensation band limit'],
    questions: [{ topic: 'Leadership & Architecture', text: 'Tell us about how you managed scaling PostgreSQL and GraphQL under high concurrency.' }],
    scores: { tech: 96, exp: 94, edu: 88, cultural: 89 }
  }
];

// ================= CANDIDATES PIPELINE DATASET (FULL 10 CANDIDATES + TOP SKILLS) =================
const CANDIDATES_PIPELINE_DATA = [
  {
    id: 'elena',
    name: 'Elena Vasquez',
    email: 'e.vasquez@ml.ai',
    initials: 'EV',
    starred: true,
    avatarColor: 'bg-indigo-600',
    role: 'ML Infrastructure Engineer',
    reqId: '#398',
    score: '94%',
    stage: 'Interview',
    stageColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    verdict: 'Strong Match',
    verdictColor: 'text-emerald-600 dark:text-emerald-400',
    date: 'Aug 25',
    expYrs: '8 yrs',
    topSkills: ['CUDA', 'PyTorch', 'Kubernetes']
  },
  {
    id: 'sofia',
    name: 'Sofia Reyes',
    email: 'sofia.reyes@pm.com',
    initials: 'SR',
    starred: true,
    avatarColor: 'bg-emerald-600',
    role: 'Product Manager — Growth',
    reqId: '#391',
    score: '91%',
    stage: 'Interview',
    stageColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    verdict: 'Strong Match',
    verdictColor: 'text-emerald-600 dark:text-emerald-400',
    date: 'Sep 2',
    expYrs: '7 yrs',
    topSkills: ['Roadmapping', 'SQL', 'Figma']
  },
  {
    id: 'alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    initials: 'AM',
    starred: true,
    avatarColor: 'bg-amber-500',
    role: 'Senior Full Stack Engineer',
    reqId: '#402',
    score: '88%',
    stage: 'Screening',
    stageColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    verdict: 'Strong Match',
    verdictColor: 'text-emerald-600 dark:text-emerald-400',
    date: 'Sep 5',
    expYrs: '6.5 yrs',
    topSkills: ['React', 'TypeScript', 'Node.js']
  },
  {
    id: 'iris',
    name: 'Iris Tanaka',
    email: 'iris.tanaka@data.jp',
    initials: 'IT',
    starred: false,
    avatarColor: 'bg-rose-500',
    role: 'Data Analyst — BI',
    reqId: '#361',
    score: '87%',
    stage: 'Hired',
    stageColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    verdict: 'Strong Match',
    verdictColor: 'text-emerald-600 dark:text-emerald-400',
    date: 'Aug 20',
    expYrs: '5 yrs',
    topSkills: ['dbt', 'Looker', 'SQL']
  },
  {
    id: 'daniel',
    name: 'Daniel Park',
    email: 'd.park@dev.io',
    initials: 'DP',
    starred: false,
    avatarColor: 'bg-blue-600',
    role: 'Senior Full Stack Engineer',
    reqId: '#402',
    score: '83%',
    stage: 'Interview',
    stageColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    verdict: 'Strong Match',
    verdictColor: 'text-emerald-600 dark:text-emerald-400',
    date: 'Aug 31',
    expYrs: '5 yrs',
    topSkills: ['React', 'Go', 'Docker']
  },
  {
    id: 'nadia',
    name: 'Nadia Osei',
    email: 'nadia.osei@design.co',
    initials: 'NO',
    starred: true,
    avatarColor: 'bg-pink-600',
    role: 'Senior UX Designer',
    reqId: '#385',
    score: '79%',
    stage: 'Offer',
    stageColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    verdict: 'Good Match',
    verdictColor: 'text-indigo-600 dark:text-indigo-400',
    date: 'Aug 29',
    expYrs: '6 yrs',
    topSkills: ['Figma', 'Research', 'Prototyping']
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    initials: 'PS',
    starred: false,
    avatarColor: 'bg-teal-600',
    role: 'Senior Full Stack Engineer',
    reqId: '#402',
    score: '74%',
    stage: 'Applied',
    stageColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    verdict: 'Good Match',
    verdictColor: 'text-indigo-600 dark:text-indigo-400',
    date: 'Sep 4',
    expYrs: '4 yrs',
    topSkills: ['Vue.js', 'Python', 'PostgreSQL']
  },
  {
    id: 'kwame',
    name: 'Kwame Asante',
    email: 'k.asante@cs.com',
    initials: 'KA',
    starred: false,
    avatarColor: 'bg-orange-500',
    role: 'Customer Success Manager',
    reqId: '#370',
    score: '70%',
    stage: 'Screening',
    stageColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    verdict: 'Good Match',
    verdictColor: 'text-indigo-600 dark:text-indigo-400',
    date: 'Aug 22',
    expYrs: '4.5 yrs',
    topSkills: ['Salesforce', 'Zendesk', 'SQL']
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    email: 'm.chen@email.com',
    initials: 'MC',
    starred: false,
    avatarColor: 'bg-[#8B5CF6]',
    role: 'ML Infrastructure Engineer',
    reqId: '#398',
    score: '61%',
    stage: 'Applied',
    stageColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    verdict: 'Weak Match',
    verdictColor: 'text-rose-600 dark:text-rose-400',
    date: 'Sep 3',
    expYrs: '3 yrs',
    topSkills: ['PyTorch', 'Kubernetes', 'Python']
  },
  {
    id: 'james',
    name: 'James Wu',
    email: 'james.wu@cloud.io',
    initials: 'JW',
    starred: false,
    avatarColor: 'bg-cyan-600',
    role: 'DevOps / Platform Engineer',
    reqId: '#377',
    score: '55%',
    stage: 'Rejected',
    stageColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    verdict: 'Weak Match',
    verdictColor: 'text-rose-600 dark:text-rose-400',
    date: 'Aug 16',
    expYrs: '2 yrs',
    topSkills: ['Terraform', 'AWS', 'Linux']
  }
];

*/
// ================= OPEN ROLES DATASET =================
const EMPTY_CANDIDATE = {
  id: 'empty',
  name: 'No candidate analyzed',
  role: 'Select a role and upload a resume',
  reqId: '',
  location: 'Location unavailable',
  email: 'Email unavailable',
  initials: '--',
  date: '',
  baseScore: 0,
  statusText: 'Awaiting resume analysis',
  expYrs: 'Not available',
  reqExpYrs: 'Not available',
  matchedSkills: [],
  missingSkills: [],
  adjacentSkills: [],
  riskTitle: 'No analysis yet',
  verdictTitle: 'No analysis yet',
  strengths: [],
  risks: [],
  questions: [],
  scores: { tech: 0, exp: 0, edu: 0, cultural: 0 },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [authScreen, setAuthScreen] = useState('login');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem('rmi_theme') === 'dark';
});
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeSubTab, setActiveSubTab] = useState('Skills Gap');
  const [viewMode, setViewMode] = useState('grid'); // Candidate gallery is the default reference view
  
  const [selectedCandidate, setSelectedCandidate] = useState(EMPTY_CANDIDATE);
  const [candidatesPipelineList, setCandidatesPipelineList] = useState([]);
  const [candidateAnalysesByJob, setCandidateAnalysesByJob] = useState({});
  const [weights, setWeights] = useState({ skills: 50, experience: 35, education: 15 });
  const [computedScore, setComputedScore] = useState(0);

  // Search & Filters for Candidates Page
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Score');

  // Search & Filters for Open Roles
  const [roleSearchQuery, setRoleFilterSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  // Modals & Upload State
  const [activeModal, setActiveModal] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleDepartment, setNewRoleDepartment] = useState('Engineering');
  const [newRoleLocation, setNewRoleLocation] = useState('Remote');

  // Dynamic Score Recalculation
useEffect(() => {
  localStorage.setItem('rmi_theme', darkMode ? 'dark' : 'light');
}, [darkMode]);

useEffect(() => {
  getCurrentUser()
    .then((data) => {
      setCurrentUser(data.user);
    })
    .catch(() => {})
    .finally(() => {
      setCheckingAuth(false);
    });
}, []);

useEffect(() => {
  if (!currentUser || currentUser.role !== 'Recruiter') return;

  fetch('/api/jobs', {
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((data) => {
      const jobs = data.jobs || [];

      setAvailableJobs(jobs);

      const activeJob =
        jobs.find((job) => job.id === selectedJobId) || jobs[0];

      if (activeJob) {
        setSelectedJobId(activeJob.id);
        setSelectedJob(activeJob);
      }
    })
    .catch((error) => {
      console.error('Failed to load jobs:', error);
    });
}, [currentUser]);

  useEffect(() => {
    if (selectedCandidate.id === 'empty') {
      setComputedScore(0);
      return;
    }
    const base = selectedCandidate.baseScore;
    const factor = (weights.skills * 0.50 + weights.experience * 0.35 + weights.education * 0.15) / 50;
    const recalculated = Math.min(99, Math.max(40, Math.round(base * factor)));
    setComputedScore(recalculated);
  }, [weights, selectedCandidate]);

  // Sync Theme Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!currentUser) return;
    fetchAnalyticsData().then(setAnalyticsData).catch(() => {});
  }, [currentUser]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Clear the local view even if the session endpoint is unavailable.
    } finally {
      setCurrentUser(null);
      setAuthScreen('login');
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleTitle.trim()) {
      triggerToast('Enter a job title first.');
      return;
    }
    try {
      await createRole({
        title: newRoleTitle,
        department: newRoleDepartment,
        location: newRoleLocation,
      });
      const response = await fetch('/api/jobs', { credentials: 'include' });
      const data = await response.json();
      setAvailableJobs(data.jobs || []);
      setNewRoleTitle('');
      setActiveModal(null);
      triggerToast('New role posted to the active pipeline.');
    } catch (error) {
      triggerToast(error.response?.data?.error || 'Unable to post the role.');
    }
  };

  const toggleStar = (id) => {
    setCandidatesPipelineList(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
  };

  const handleJobChange = (jobId) => {
  setSelectedJobId(jobId);

  const job = availableJobs.find((item) => item.id === jobId);

  if (job) {
    setSelectedJob(job);
    setSelectedCandidate(candidateAnalysesByJob[jobId] || EMPTY_CANDIDATE);
    triggerToast(`Active role changed to ${job.title}`);
  }
};
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
if (!file) return;

if (isUploading) return;

if (!selectedJobId) {
  triggerToast('Please select a job role first.');
  e.target.value = '';
  return;
}

try {
  setIsUploading(true);
    triggerToast('Analyzing resume against selected role...');

    const response = await analyzeResumeAndJD(file, selectedJobId);
      const candidate = response.candidate || {};
      const match = response.match || {};
      const recommendation = match.recommendation || {};
      const score = Math.round(match.overall_score || 0);
      const matchedSkills = match.skill_match?.matched_skills || [];
      const missingSkills = match.skill_match?.missing_skills || [];
      const realCandidate = {
        id: `api-${Date.now()}`,
        name: candidate.name || file.name.replace(/\.[^.]+$/, ''),
        role: selectedJob?.title || selectedJobId,
        reqId: selectedJobId,
        score: `${score}%`,
        stage: 'Analyzed',
        stageColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
        verdict: recommendation.recommendation || 'Review Match',
        verdictColor: score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        starred: false,
        avatarColor: 'bg-indigo-600',
        topSkills: matchedSkills.slice(0, 3),
        baseScore: score,
        statusText: recommendation.recommendation || 'AI Match Complete',
        matchedSkills,
        missingSkills,
        adjacentSkills: [],
        expYrs: Array.isArray(candidate.experience) && candidate.experience.length ? candidate.experience.join(', ') : 'Not available',
        reqExpYrs: response.job?.minimum_experience_years ? `${response.job.minimum_experience_years}+ yrs` : 'Not specified',
        location: candidate.location || 'Location unavailable',
        email: candidate.email || 'Email unavailable',
        initials: (candidate.name || file.name).split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        date: new Date().toLocaleDateString(),
        scores: {
          tech: Math.round(match.skill_match?.score || 0),
          exp: Math.round(match.experience_match?.score || 0),
          edu: Math.round(match.education_match?.score || 0),
          cultural: Math.round(match.semantic_similarity || 0),
        },
        verdictTitle: recommendation.recommendation || 'Review Match',
        strengths: recommendation.strengths || [],
        risks: recommendation.gaps || [],
        questions: Array.isArray(recommendation.questions) ? recommendation.questions : [],
      };
      setSelectedCandidate(realCandidate);
      setCandidateAnalysesByJob((previous) => ({ ...previous, [selectedJobId]: realCandidate }));
      setCandidatesPipelineList((previous) => [realCandidate, ...previous.filter((item) => item.id !== realCandidate.id)]);
      fetchAnalyticsData().then(setAnalyticsData).catch(() => {});
      setIsUploading(false);
      triggerToast(`AI Analysis Complete! Candidate matched at ${score}%.`);
    } catch (error) {
      triggerToast(error.response?.data?.error || 'Resume analysis failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Live Filtering for Roles
  const filteredRoles = availableJobs.filter((role) => {
    const matchesStatus = activeStatusFilter === 'All' || role.status === activeStatusFilter;
    const matchesDept = selectedDept === 'All Departments' || (role.department || role.dept) === selectedDept;
    const matchesSearch = role.title.toLowerCase().includes(roleSearchQuery.toLowerCase()) || 
                          role.id.toLowerCase().includes(roleSearchQuery.toLowerCase());
    return matchesStatus && matchesDept && matchesSearch;
  });

  // Live Filtering for Candidates Page
  const filteredCandidates = candidatesPipelineList.filter((c) => {
    const matchesStage = stageFilter === 'All' || c.stage === stageFilter;
    const matchesSearch = c.name.toLowerCase().includes(candidateSearchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(candidateSearchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

if (checkingAuth) {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <div className="text-center">
        <Zap className="w-7 h-7 text-indigo-500 fill-indigo-500 mx-auto animate-pulse" />
        <p className="text-xs text-gray-400 mt-2">
          Loading RMI AI...
        </p>
      </div>
    </div>
  );
}

if (!currentUser) {
  if (authScreen === 'register') {
    return (
      <Register
        onRegister={(user) => setCurrentUser(user)}
        onSwitchToLogin={() => setAuthScreen('login')}
      />
    );
  }

  return (
    <Login
      onLogin={(user) => {
        setCurrentUser(user);
        setActiveTab('Dashboard');
      }}
      onSwitchToRegister={() => setAuthScreen('register')}
    />
  );
}

if (currentUser.role === 'Candidate') {
  return (
    <CandidateDashboard
      user={currentUser}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onLogout={handleLogout}
    />
  );
}

  return (
    <div className={`h-screen min-h-0 flex flex-col overflow-x-hidden font-sans transition-colors duration-200 ${darkMode ? 'bg-[#0B0F17] text-[#F3F4F6]' : 'bg-[#EEF2F6] text-[#0F172A]'} ${activeTab === 'Candidates' ? 'candidate-screen' : ''}`}>
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300"/> {toastMessage}
        </div>
      )}

      {/* ================= FIXED HEADER ================= */}
      <header className={`flex-none flex flex-wrap items-center justify-between gap-y-2 border-b px-3 py-2.5 transition-colors sm:px-6 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Zap className="w-4 h-4 fill-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-base tracking-tight">RMI</span>
              <span className="font-black text-base text-indigo-500">AI</span>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-gray-400 font-medium -mt-1">Resume Matching Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`order-3 flex w-full items-center justify-center p-1 rounded-xl border md:order-none md:w-auto ${darkMode ? 'bg-[#0B0F17] border-[#1D2636]' : 'bg-slate-100 border-slate-200'}`}>
          {['Dashboard', 'Open Roles', 'Candidates', 'Analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates, roles."
              className={`w-40 border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 md:w-52 ${darkMode ? 'bg-[#131B2A] border-[#1D2636] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-100 border-slate-200'}`}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          <button className={`p-2 rounded-xl border relative text-slate-500 dark:text-gray-400 ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-100 border-slate-200'}`}>
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-700/40">
  <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
    {currentUser?.name?.charAt(0)?.toUpperCase() || 'J'}
  </div>

  <div className="text-left hidden md:block">
    <p className="text-xs font-bold leading-none">
      {currentUser?.name || 'Jamie Collins'}
    </p>
    <p className="text-[9px] text-slate-400 dark:text-gray-400">
      Recruiter
    </p>
  </div>

  <button
    onClick={handleLogout}
    title="Log out"
    className={`p-2 rounded-xl border transition ${
      darkMode
        ? 'bg-[#131B2A] border-[#1D2636] text-gray-400 hover:text-rose-400 hover:border-rose-500/40'
        : 'bg-white border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-300'
    }`}
  >
    <LogOut className="w-3.5 h-3.5" />
  </button>
</div>
        </div>
      </header>

      {/* ================= VIEW 1: DASHBOARD WORKBENCH (LOCKED EXACT VERSION) ================= */}
      {activeTab === 'Dashboard' && (
        <main className="dashboard-workbench grid min-h-0 min-w-0 flex-1 overflow-y-auto p-3 grid-cols-1 gap-4 max-w-[1700px] w-full mx-auto sm:p-4 xl:grid-cols-12 xl:grid-rows-1 xl:overflow-hidden">
          {/* Left Sidebar */}
          <div className="dashboard-sidebar col-span-12 min-w-0 space-y-3 pr-1 xl:col-span-3 xl:h-full xl:overflow-hidden">
            <div className={`border rounded-2xl p-3.5 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-500">ACTIVE ROLE</span>
              <select
  value={selectedJobId}
  onChange={(e) => handleJobChange(e.target.value)}
  className={`w-full mt-1.5 border rounded-xl p-2 text-xs font-bold focus:outline-none ${
    darkMode
      ? 'bg-[#131B2A] border-[#1D2636] text-white'
      : 'bg-slate-50 border-slate-200 text-slate-800'
  }`}
>
  {availableJobs.map((job) => (
    <option key={job.id} value={job.id}>
      {job.title} (Req {job.id})
    </option>
  ))}
</select>
            </div>

            <div className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition border-indigo-500/40 hover:border-indigo-500 ${darkMode ? 'bg-[#111622]' : 'bg-white'}`}>
              <input type="file" id="resume-input" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              <label htmlFor="resume-input" className="cursor-pointer block">
                {isUploading ? (
                  <div className="flex flex-col items-center py-1">
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin mb-1" />
                    <p className="text-xs font-bold text-indigo-500">AI Parsing Resume...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-1">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold">Drag & Drop or <span className="text-indigo-500">Browse</span></p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-400 mt-0.5">PDF or Word document</p>
                  </>
                )}
              </label>
            </div>

            <div className={`border rounded-2xl p-3.5 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-gray-400">CANDIDATE QUEUE</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500">{candidatesPipelineList.length}</span>
              </div>
              <div className="space-y-1.5">
                {candidatesPipelineList.length === 0 ? (
                  <p className="py-3 text-xs text-slate-500 dark:text-gray-400">No candidates analyzed yet.</p>
                ) : candidatesPipelineList.map((c) => {
                  const isSelected = selectedCandidate.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className={`w-full text-left flex items-center justify-between p-2 rounded-xl border transition ${
                        isSelected 
                          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-sm' 
                          : darkMode ? 'bg-[#131B2A] border-transparent hover:border-gray-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-600/80 text-white'}`}>
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{c.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-400 mt-0.5">{c.date}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.baseScore >= 85 ? 'bg-emerald-500/10 text-emerald-500' : c.baseScore >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {c.baseScore}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Workbench */}
          <div className="dashboard-profile col-span-12 min-h-0 min-w-0 space-y-3 pr-2 border-r border-slate-200 dark:border-gray-800/20 xl:col-span-6 xl:h-full xl:overflow-y-auto">
            <div className={`border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  {selectedCandidate.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold">{selectedCandidate.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500">New</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">{selectedCandidate.role}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 dark:text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {selectedCandidate.location}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {selectedCandidate.email}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => triggerToast(`Downloading PDF Resume for ${selectedCandidate.name}...`)} className="px-3 py-1.5 rounded-xl border border-indigo-500/30 text-indigo-500 font-bold text-xs hover:bg-indigo-500/10 flex items-center gap-1.5 transition">
                <Download className="w-3.5 h-3.5" /> Download Resume
              </button>
            </div>

            <div className={`border rounded-2xl p-4 grid grid-cols-1 gap-4 items-center xl:grid-cols-12 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="col-span-1 flex min-w-0 flex-col items-center border-b border-slate-200 pb-3 dark:border-gray-700/30 xl:col-span-5 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-3">
                <div className="relative flex h-[100px] w-44 shrink-0 flex-col items-center justify-center max-xl:overflow-hidden xl:h-auto xl:overflow-visible">
                  <svg className="h-[85px] w-44 overflow-visible" viewBox="0 0 160 85">
                    <path d="M 10 80 A 65 65 0 0 1 150 80" fill="none" stroke={darkMode ? "#1E2638" : "#E2E8F0"} strokeWidth="14" strokeLinecap="round" />
                    <path d="M 10 80 A 65 65 0 0 1 150 80" fill="none" stroke="#10B981" strokeWidth="14" strokeDasharray="210" strokeDashoffset={210 - (computedScore / 100) * 210} strokeLinecap="round" className="transition-all duration-700 ease-out" />
                  </svg>
                  <div className="absolute top-6 text-center">
                    <span className="text-3xl font-extrabold text-emerald-500 tracking-tight">{computedScore}%</span>
                    <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-gray-400 mt-0.5">MATCH SCORE</p>
                  </div>
                </div>
                <span className="mt-2 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-500 border border-emerald-500/30 bg-emerald-500/5">
                  {selectedCandidate.statusText}
                </span>
              </div>

              <div className="col-span-1 min-w-0 space-y-2.5 pl-1 xl:col-span-7">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">MATCH WEIGHTING</span>
                {[
                  { key: 'skills', label: 'Skills', val: weights.skills },
                  { key: 'experience', label: 'Experience', val: weights.experience },
                  { key: 'education', label: 'Education', val: weights.education }
                ].map((s) => (
                  <div key={s.key} className="space-y-0.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{s.label}</span>
                      <span className="text-indigo-500 font-bold">{s.val}%</span>
                    </div>
                    <input type="range" min="10" max="80" value={s.val} onChange={(e) => setWeights({ ...weights, [s.key]: parseInt(e.target.value) })} className="w-full h-1 bg-slate-200 dark:bg-gray-700 accent-indigo-500 rounded-lg cursor-pointer" />
                  </div>
                ))}

                <div className={`p-2.5 rounded-xl border space-y-2 ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">Experience Match</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-slate-500 dark:text-gray-400 font-medium text-[11px]">Candidate</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="font-bold text-[#10B981] text-[11px]">{selectedCandidate.expYrs}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-slate-500 dark:text-gray-400 font-medium text-[11px]">JD Requirement</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-slate-400 dark:bg-[#2A3447] rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="font-semibold text-slate-500 dark:text-gray-400 text-[11px]">{selectedCandidate.reqExpYrs}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`border rounded-2xl p-4 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-slate-200 pb-2.5 dark:border-gray-700/30 mb-3.5 xl:flex-nowrap">
                {['Skills Gap', 'Experience Timeline', 'Projects & Education'].map((tab) => (
                  <button key={tab} onClick={() => setActiveSubTab(tab)} className={`text-xs font-bold transition relative ${activeSubTab === tab ? 'text-indigo-500' : 'text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    {tab}
                    {activeSubTab === tab && <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></span>}
                  </button>
                ))}
              </div>

              {activeSubTab === 'Skills Gap' && (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                      <h4 className="text-xs font-bold">Matched Required Skills</h4>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981]">{selectedCandidate.matchedSkills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.matchedSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                        <h4 className="text-xs font-bold">Missing Required Skills</h4>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444]">{selectedCandidate.missingSkills.length}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#F59E0B] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {selectedCandidate.riskTitle}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.missingSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                      <h4 className="text-xs font-bold">Adjacent / Transferable Skills</h4>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#8B5CF6]/15 text-[#8B5CF6]">{selectedCandidate.adjacentSkills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.adjacentSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="dashboard-verdict col-span-12 min-h-0 min-w-0 space-y-3 pr-2 xl:col-span-3 xl:h-full xl:overflow-y-auto">
            <div className={`border rounded-2xl p-4 space-y-3 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-gray-700/30 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#10B981] tracking-wider block">AI VERDICT</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedCandidate.verdictTitle}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-[#10B981]">Key Strengths</p>
                <ul className="space-y-1.5 text-slate-700 dark:text-gray-300 pl-1">
                  {selectedCandidate.strengths.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#10B981] font-bold text-sm leading-none">•</span>
                      <span className="text-[11px] leading-snug font-medium">{st}</span>
                    </li>
                  ))}
                </ul>

                <p className="font-bold text-[#F59E0B] pt-1">Primary Risk Areas</p>
                <ul className="space-y-1.5 text-slate-700 dark:text-gray-300 pl-1">
                  {selectedCandidate.risks.map((rk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#F59E0B] font-bold text-sm leading-none">•</span>
                      <span className="text-[11px] leading-snug font-medium">{rk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`border rounded-2xl p-4 space-y-2.5 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className="flex items-center gap-2 text-indigo-500">
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-gray-400">AI INTERVIEW QUESTIONS</span>
              </div>

              {selectedCandidate.questions.map((q, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs space-y-1 ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                    <p className="font-bold text-[#F59E0B] text-[11px]">{q.topic}</p>
                  </div>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-[11px] pl-3 font-medium">"{q.text}"</p>
                </div>
              ))}
            </div>

            <div className={`border rounded-2xl p-4 space-y-2 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-gray-400">SCORE BREAKDOWN</span>
              {[
                { name: 'Technical Skills', val: selectedCandidate.scores.tech, color: 'bg-[#10B981]' },
                { name: 'Experience Depth', val: selectedCandidate.scores.exp, color: 'bg-indigo-500' },
                { name: 'Education Fit', val: selectedCandidate.scores.edu, color: 'bg-indigo-400' },
                { name: 'Cultural Signals', val: selectedCandidate.scores.cultural, color: 'bg-[#F59E0B]' }
              ].map((b) => (
                <div key={b.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-gray-400 text-[11px]">{b.name}</span>
                    <span className="font-bold text-[11px] text-slate-900 dark:text-white">{b.val}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-gray-800">
                    <div className={`h-full rounded-full ${b.color} transition-all duration-500`} style={{ width: `${b.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1 pb-4">
              <button onClick={() => setActiveModal('schedule')} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20 active:scale-95">Schedule Interview</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveModal('reject')} className="py-2 rounded-xl border border-slate-300 dark:border-gray-700/50 hover:bg-rose-500/10 hover:text-rose-500 text-xs font-bold transition active:scale-95">Reject</button>
                <button onClick={() => triggerToast(`Exporting ${selectedCandidate.name}'s Summary PDF...`)} className="py-2 rounded-xl border border-slate-300 dark:border-gray-700/50 text-xs font-bold transition active:scale-95">Export PDF</button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ================= VIEW 2: OPEN ROLES (LOCKED EXACT VERSION) ================= */}
      {activeTab === 'Open Roles' && (
        <main className="flex min-h-0 flex-1 overflow-y-auto p-3 max-w-[1700px] w-full mx-auto flex-col space-y-4 sm:p-6 lg:overflow-hidden">
          
          <div className="flex-none space-y-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Open Roles</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Manage your hiring pipeline and job requisitions</p>
              </div>
              <button 
                onClick={() => setActiveModal('newRole')} 
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4"/> Post New Role
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Open Roles', val: availableJobs.length, sub: 'From backend', color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Total Applicants', val: candidatesPipelineList.length, sub: 'Analyzed candidates', color: 'text-emerald-500' },
                { label: 'Avg. Match Score', val: candidatesPipelineList.length ? `${Math.round(candidatesPipelineList.reduce((total, candidate) => total + candidate.baseScore, 0) / candidatesPipelineList.length)}%` : '0%', sub: 'Analyzed candidates', color: 'text-purple-500' },
                { label: 'Avg. Time to Fill', val: '—', sub: 'No data available', color: 'text-amber-500' }
              ].map((s, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  <p className="text-xs font-bold mt-1 text-slate-900 dark:text-white">{s.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-gray-400" />
                  <input 
                    type="text" 
                    value={roleSearchQuery}
                    onChange={(e) => setRoleFilterSearchQuery(e.target.value)}
                    placeholder="Search roles..." 
                    className={`w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${darkMode ? 'bg-[#131B2A] border-[#1D2636] text-white' : 'bg-white border-slate-200 text-slate-800'}`} 
                  />
                </div>

                <button className={`p-2 rounded-xl border text-slate-400 dark:text-gray-400 ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-white border-slate-200'}`}>
                  <Filter className="w-3.5 h-3.5" />
                </button>
                
                <div className={`flex flex-wrap items-center p-1 rounded-xl border ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-white border-slate-200'}`}>
                  {['All', 'Active', 'Paused', 'Closed', 'Draft'].map((st) => (
                    <button 
                      key={st} 
                      onClick={() => setActiveStatusFilter(st)} 
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                        activeStatusFilter === st 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none ${darkMode ? 'bg-[#131B2A] border-[#1D2636] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>AI/ML</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Infrastructure</option>
                  <option>Revenue</option>
                  <option>Analytics</option>
                  <option>Security</option>
                </select>
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{filteredRoles.length} roles</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-visible pb-6 lg:overflow-y-auto lg:pr-1">
            {filteredRoles.map((role, idx) => (
              <div 
                key={idx} 
                onClick={() => { handleJobChange(role.id); setActiveTab('Dashboard'); }}
                className={`p-4 rounded-2xl border flex flex-col items-stretch justify-between gap-4 cursor-pointer transition sm:flex-row sm:items-center hover:border-indigo-500/50 ${darkMode ? 'bg-[#111622] border-[#1D2636] hover:bg-[#161D2D]' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${role.dotColor}`}></span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {role.title} <span className="text-indigo-500 font-bold">{role.id}</span>
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      role.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      role.status === 'Paused' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      role.status === 'Closed' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {role.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
                    <span className="flex items-center gap-1 font-medium"><Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400"/> {role.department || 'Department unavailable'}</span>
                    <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400"/> {role.location || 'Location unavailable'}</span>
                    <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400"/> {role.status || 'Open'}</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-200">{role.company || 'Company unavailable'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end sm:gap-8">
                  <div className="text-right">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {role.candidates} <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Candidates</span>
                    </p>
                    {role.newCandidates && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{role.newCandidates}</p>}
                  </div>

                  <div className="text-right min-w-[65px]">
                    <p className="font-extrabold text-sm text-emerald-600 dark:text-amber-500">{role.avgScore}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">Avg Score</p>
                  </div>

                  <div className="text-right text-xs min-w-[85px]">
                    <p className="font-bold text-slate-900 dark:text-gray-200">{role.manager}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">Hiring Mgr</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-400"/>
                </div>
              </div>
            ))}
          </div>

        </main>
      )}

      {/* ================= VIEW 3: CANDIDATES PIPELINE ================= */}
      {activeTab === 'Candidates' && (
        <CandidatesView
          darkMode={darkMode}
          candidates={filteredCandidates}
          searchQuery={candidateSearchQuery}
          setSearchQuery={setCandidateSearchQuery}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onToggleStar={toggleStar}
          onExport={() => triggerToast('Exporting Candidate Pipeline CSV...')}
          onViewProfile={(candidate) => {
            setSelectedCandidate(candidatesPipelineList.find((item) => item.id === candidate.id) || EMPTY_CANDIDATE);
            setActiveTab('Dashboard');
            triggerToast(`Viewing ${candidate.name}'s Profile`);
          }}
        />
      )}

      {/* Previous inline implementation retained temporarily below for reference only. */}
      {false && activeTab === 'Candidates' && (
        <main className="candidate-page flex-1 overflow-y-auto w-full space-y-6">
          
          {/* Header */}
          <div className="candidate-intro flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Candidates</h1>
              <p className="text-base text-slate-500 dark:text-gray-400 mt-0.5">10 total candidates across all active roles</p>
            </div>
            <button 
              onClick={() => triggerToast('Exporting Candidate Pipeline CSV...')} 
              className={`px-5 py-3 rounded-xl border text-sm font-bold transition flex items-center gap-2 ${darkMode ? 'bg-[#111622] border-[#1D2636] text-white hover:bg-[#161D2D]' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* HIRING PIPELINE — All Roles Graph Card */}
          <div className={`candidate-pipeline p-5 rounded-2xl border ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0]'}`}>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-gray-400">HIRING PIPELINE — All Roles</span>
            
            <div className="grid grid-cols-5 gap-2 pt-5">
              {[
                { label: 'Applied', count: 2, color: 'bg-[#475569]', numColor: 'text-slate-400' },
                { label: 'Screening', count: 2, color: 'bg-[#6366F1]', numColor: 'text-indigo-400' },
                { label: 'Interview', count: 3, color: 'bg-[#D97706]', numColor: 'text-amber-500' },
                { label: 'Offer', count: 1, color: 'bg-[#10B981]', numColor: 'text-emerald-500' },
                { label: 'Hired', count: 1, color: 'bg-[#059669]', numColor: 'text-emerald-400' }
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col text-center">
                  <div className="h-[98px] flex flex-col justify-end">
                    <span className={`font-black text-base block mb-3 ${s.numColor}`}>{s.count}</span>
                    <div className={`candidate-pipeline-bar ${s.count === 3 ? 'h-[75px]' : s.count === 2 ? 'h-[50px]' : 'h-[25px]'} rounded-t-lg ${s.color} opacity-85`} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400 block mt-3">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter & View Mode Toolbar */}
          <div className="candidate-toolbar flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-[480px]">
                <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 dark:text-gray-400" />
                <input 
                  type="text" 
                  value={candidateSearchQuery}
                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
                  placeholder="Search candidates, roles, skills..." 
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-base focus:outline-none focus:border-indigo-500 ${darkMode ? 'bg-[#131B2A] border-[#1D2636] text-white' : 'bg-white border-slate-200 text-slate-800'}`} 
                />
              </div>

              <button className="p-2 text-slate-400 dark:text-gray-400">
                <Filter className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map((st) => (
                  <button 
                    key={st} 
                    onClick={() => setStageFilter(st)} 
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition ${
                      stageFilter === st 
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-500 shadow-sm' 
                        : 'border-[#1D2636] bg-[#111622] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Controls (Sort & List / Grid Toggle) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400">
                <span>Sort:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`border-0 bg-transparent px-1 py-1 text-sm font-medium focus:outline-none ${darkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  <option>Score</option>
                  <option>Name</option>
                  <option>Date Applied</option>
                </select>
              </div>

              {/* Working View Toggle Buttons */}
              <div className={`flex items-center p-1 rounded-xl border ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-white border-slate-200'}`}>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-600/15 text-indigo-500' : 'text-slate-400 dark:text-gray-400'}`}
                  title="List View"
                >
                  <LayoutList className="w-3.5 h-3.5"/>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600/15 text-indigo-500' : 'text-slate-400 dark:text-gray-400'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          </div>

          {/* ================= CANDIDATES CONTENT VIEW ================= */}

          {/* MODE 1: LIST VIEW (HORIZONTAL CARDS) */}
          {viewMode === 'list' && (
            <div className="space-y-2.5 pb-8">
              {filteredCandidates.map((cand) => (
                <div 
                  key={cand.id} 
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition hover:border-indigo-500/50 ${darkMode ? 'bg-[#111622] border-[#1D2636] hover:bg-[#161D2D]' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'}`}
                >
                  {/* Candidate Name & Avatar */}
                  <div className="flex items-center gap-3 min-w-[280px]">
                    <button onClick={() => toggleStar(cand.id)}>
                      <Star className={`w-4 h-4 ${cand.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-gray-600'}`} />
                    </button>
                    <div className={`w-8 h-8 rounded-xl ${cand.avatarColor} font-bold text-white text-xs flex items-center justify-center shadow-sm`}>
                      {cand.initials}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-900 dark:text-white">{cand.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">{cand.email}</p>
                    </div>
                  </div>

                  {/* Target Role & Req ID */}
                  <div className="min-w-[220px]">
                    <p className="font-bold text-xs text-slate-800 dark:text-gray-200">{cand.role}</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{cand.reqId}</p>
                  </div>

                  {/* Match Score */}
                  <div className="min-w-[60px]">
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {cand.score}
                    </span>
                  </div>

                  {/* Stage Badge */}
                  <div className="min-w-[90px]">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cand.stageColor}`}>
                      {cand.stage}
                    </span>
                  </div>

                  {/* AI Verdict */}
                  <div className={`min-w-[110px] font-extrabold text-xs ${cand.verdictColor}`}>
                    {cand.verdict}
                  </div>

                  {/* Date Applied */}
                  <div className="min-w-[70px] text-slate-500 dark:text-gray-400 text-[11px] font-medium">
                    {cand.date}
                  </div>

                  {/* View Action Button */}
                  <div>
                    <button 
                      onClick={() => { setSelectedCandidate(cand); setActiveTab('Dashboard'); triggerToast(`Viewing ${cand.name}'s Dashboard Workbench`); }} 
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODE 2: GRID VIEW (5-COLUMN CARDS MATCHING TARGET IMAGES 4 & 5) */}
          {viewMode === 'grid' && (
            <div className="candidate-grid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 pb-8">
              {filteredCandidates.map((cand) => (
                <div 
                  key={cand.id} 
                  className={`candidate-card p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition hover:border-indigo-500/50 ${darkMode ? 'bg-[#111622] border-[#1D2636]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-12 h-12 rounded-full ${cand.avatarColor} text-white font-bold text-base flex items-center justify-center shadow-sm`}>
                        {cand.initials}
                      </div>
                      <div>
                        <p className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">{cand.name}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">{cand.expYrs} experience</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded-full text-sm font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {cand.score}
                      </span>
                      <button onClick={() => toggleStar(cand.id)}>
                        <Star className={`w-4 h-4 ${cand.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-gray-600'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Role Name */}
                  <div>
                    <p className="font-medium text-base text-slate-800 dark:text-gray-200 leading-snug">{cand.role}</p>
                  </div>

                  {/* Stage & Verdict Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${cand.stageColor}`}>
                      {cand.stage}
                    </span>
                    <span className={`text-sm font-extrabold ${cand.verdictColor}`}>
                      {cand.verdict.replace(' Match', '')}
                    </span>
                  </div>

                  {/* Top 3 Skills Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cand.topSkills.map((sk) => (
                      <span key={sk} className={`px-3 py-1 rounded-md text-sm font-medium ${darkMode ? 'bg-[#131B2A] text-gray-300 border border-gray-700/40' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* View Profile Action Button */}
                  <button 
                    onClick={() => { setSelectedCandidate(cand); setActiveTab('Dashboard'); triggerToast(`Viewing ${cand.name}'s Profile`); }}
                    className="w-full py-2.5 rounded-xl border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-medium text-sm transition shadow-sm mt-1"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}

        </main>
      )}

      {/* ================= VIEW 4: ANALYTICS ================= */}
      {activeTab === 'Analytics' && (
        <AnalyticsView analyticsData={analyticsData} onExport={() => triggerToast('Exporting analytics report...')} />
      )}

      {/* ================= MODALS ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${darkMode ? 'bg-[#111622] border-[#1D2636] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-700/30 pb-3">
              <h3 className="font-extrabold text-sm">
                {activeModal === 'schedule' && `Schedule Interview: ${selectedCandidate.name}`}
                {activeModal === 'reject' && `Confirm Rejection: ${selectedCandidate.name}`}
                {activeModal === 'newRole' && 'Post New Job Requisition'}
              </h3>
              <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400 dark:text-gray-400"/></button>
            </div>

            {activeModal === 'schedule' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 dark:text-gray-400">Select interview date and invite hiring manager:</p>
                <input type="date" defaultValue="2026-09-10" className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-50 border-slate-200'}`} />
                <button onClick={() => { setActiveModal(null); triggerToast(`Interview Invite sent to ${selectedCandidate.name}!`); }} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl">Confirm & Send Invite</button>
              </div>
            )}

            {activeModal === 'reject' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 dark:text-gray-400">Send automated polite rejection email with feedback?</p>
                <button onClick={() => { setActiveModal(null); triggerToast(`Candidate ${selectedCandidate.name} moved to Rejected.`); }} className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-xl">Confirm Rejection</button>
              </div>
            )}

            {activeModal === 'newRole' && (
              <div className="space-y-3 text-xs">
                <input type="text" value={newRoleTitle} onChange={(event) => setNewRoleTitle(event.target.value)} placeholder="Job Title (e.g. Senior DevOps Engineer)" className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-50 border-slate-200'}`} />
                <input type="text" value={newRoleDepartment} onChange={(event) => setNewRoleDepartment(event.target.value)} placeholder="Department" className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-50 border-slate-200'}`} />
                <input type="text" value={newRoleLocation} onChange={(event) => setNewRoleLocation(event.target.value)} placeholder="Location" className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-[#131B2A] border-[#1D2636]' : 'bg-slate-50 border-slate-200'}`} />
                <button onClick={handleCreateRole} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl">Create Role</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
