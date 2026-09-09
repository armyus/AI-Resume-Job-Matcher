import React from 'react';
import { Briefcase, UserRound, Zap } from 'lucide-react';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4">
            <Zap className="w-7 h-7 fill-indigo-500" />
          </div>

          <div className="flex items-center gap-1">
            <span className="font-black text-2xl tracking-tight">RMI</span>
            <span className="font-black text-2xl text-indigo-500">AI</span>
          </div>

          <p className="text-sm text-slate-400 mt-1">
            Resume Matching Intelligence
          </p>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">
            Welcome to RMI AI
          </h1>

          <p className="text-slate-400">
            Choose how you want to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Recruiter */}
          <button
            onClick={() => onSelectRole('recruiter')}
            className="group text-left p-7 rounded-2xl border border-[#1D2636]
                       bg-[#111622] hover:border-indigo-500/60
                       hover:bg-[#151C2B] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10
                            border border-indigo-500/20
                            flex items-center justify-center
                            text-indigo-400 mb-5
                            group-hover:bg-indigo-600 group-hover:text-white
                            transition">
              <Briefcase className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black mb-2">
              Recruiter
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Manage job roles, analyze resumes, compare candidates,
              and review detailed AI matching insights.
            </p>

            <span className="text-sm font-bold text-indigo-400">
              Continue as Recruiter →
            </span>
          </button>

          {/* Candidate */}
          <button
            onClick={() => onSelectRole('candidate')}
            className="group text-left p-7 rounded-2xl border border-[#1D2636]
                       bg-[#111622] hover:border-indigo-500/60
                       hover:bg-[#151C2B] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10
                            border border-emerald-500/20
                            flex items-center justify-center
                            text-emerald-400 mb-5
                            group-hover:bg-emerald-600 group-hover:text-white
                            transition">
              <UserRound className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black mb-2">
              Candidate
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Track your application, view your match score,
              understand skill gaps, and prepare for your interview.
            </p>

            <span className="text-sm font-bold text-emerald-400">
              Continue as Candidate →
            </span>
          </button>

        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          AI-powered resume and job matching
        </p>

      </div>
    </div>
  );
};

export default RoleSelection;