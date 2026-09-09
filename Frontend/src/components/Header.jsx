import React from 'react';
import { Zap, Search, Sun, Moon, Bell, ChevronDown } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const navTabs = ['Dashboard', 'Open Roles', 'Candidates', 'Analytics'];

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-card)] border-b border-[var(--border-card)] px-6 py-3 flex items-center justify-between transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
          <Zap className="w-5 h-5 fill-indigo-500" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-black text-lg tracking-tight">RMI</span>
            <span className="font-black text-lg text-indigo-500">AI</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-medium -mt-1">
            Resume Matching Intelligence
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-card)]">
        {navTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-[var(--bg-card)] text-indigo-500 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search candidates, roles."
            className="w-64 bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-indigo-500 transition"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-muted)]">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-card)]">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
            J
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold leading-none">Jamie Collins</p>
            <p className="text-[10px] text-[var(--text-muted)]">Recruiter</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </div>
      </div>
    </header>
  );
}