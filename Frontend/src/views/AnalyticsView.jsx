import React from 'react';
import { BarChart3, BriefcaseBusiness, CheckCircle2, FileText } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function EmptyChart({ message = 'No data returned by the backend.' }) {
  return <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">{message}</div>;
}

export default function AnalyticsView({ analyticsData, onExport }) {
  const metrics = [
    ['Total Applications', analyticsData?.total_applications, '', FileText],
    ['Average Match Score', analyticsData?.average_match_score, '%', BarChart3],
    ['Screening Pass Rate', analyticsData?.screening_pass_rate, '%', CheckCircle2],
    ['Open Roles', analyticsData?.roles, '', BriefcaseBusiness],
  ];
  const hasData = Boolean(analyticsData);
  const totalApplications = analyticsData?.total_applications || 0;
  const screeningPassRate = analyticsData?.screening_pass_rate;
  const chartData = hasData ? [{ period: 'Current', applications: totalApplications, screened: screeningPassRate === undefined ? null : Math.round(totalApplications * screeningPassRate / 100) }] : [];
  const scoreDistribution = analyticsData?.score_distribution || [];
  const departmentBreakdown = analyticsData?.department_breakdown || [];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-app)]">
      <div className="flex flex-col items-start justify-between gap-5 border-b border-[var(--border-card)] px-4 py-6 sm:flex-row sm:items-center sm:px-10 sm:py-9">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Analytics</h1>
          <p className="mt-1 text-base text-[var(--text-muted)]">Live recruiting metrics from the backend</p>
        </div>
        <button onClick={onExport} className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-600">Export Report</button>
      </div>

      <div className="space-y-6 p-4 sm:p-10">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, suffix, Icon]) => (
            <section key={label} className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">{label}</p>
                <Icon className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-3 font-mono text-3xl font-medium text-[var(--text-primary)]">
                {value === undefined || value === null ? 'Not available' : `${value}${suffix}`}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {value === undefined || value === null ? 'Not returned by the backend' : 'Current backend value'}
              </p>
            </section>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5">
          <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-sm xl:col-span-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Application Volume</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Current values returned by the backend</p>
            <div className="mt-5 h-[260px]">
              {chartData.length ? <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData}><CartesianGrid vertical={false} stroke="var(--border-card)" strokeDasharray="3 4" /><XAxis dataKey="period" tick={{ fill: 'var(--text-muted)' }} /><YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} /><Tooltip /><Area dataKey="applications" name="Applications" fill="#6366F1" fillOpacity={0.15} stroke="none" /><Line dataKey="applications" name="Applications" stroke="#6366F1" strokeWidth={2.5} /><Line dataKey="screened" name="Screened" stroke="#10B981" strokeWidth={2.5} connectNulls={false} /></ComposedChart></ResponsiveContainer> : <EmptyChart />}
            </div>
          </section>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Pipeline Conversion Funnel</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Candidate drop-off at each recorded stage</p>
            <div className="mt-5 space-y-3">
              {analyticsData?.pipeline_conversion?.length ? analyticsData.pipeline_conversion.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm"><span className="font-medium text-[var(--text-primary)]">{stage.stage}</span><b className="text-indigo-500">{stage.count}</b></div>
                  <div className="mt-1 h-8 overflow-hidden rounded-xl bg-[var(--bg-input)]"><div className="flex h-full items-center rounded-xl px-3 text-xs font-bold text-white" style={{ width: `${stage.percentage}%`, minWidth: stage.count ? '42px' : 0, background: stage.stage === 'Applications' ? '#DCE3EE' : '#7374E9' }}>{stage.percentage}%</div></div>
                </div>
              )) : <EmptyChart message="No pipeline data returned by the backend." />}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Top Skill Gaps</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Most common missing skills from analyzed matches</p>
            <div className="mt-5 space-y-3">
              {analyticsData?.top_skill_gaps?.length ? analyticsData.top_skill_gaps.map((gap) => (
                <div key={gap.skill}><div className="flex justify-between text-sm"><span className="font-medium text-[var(--text-primary)]">{gap.skill}</span><span className="font-mono text-red-500">{gap.percentage}% lacking</span></div><div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--bg-input)]"><div className="h-full rounded-full bg-gradient-to-r from-[#F26363] to-[#F9B12E]" style={{ width: `${gap.percentage}%` }} /></div></div>
              )) : <EmptyChart message="No skill-gap data returned by the backend." />}
            </div>
          </section>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-sm"><h2 className="text-base font-bold text-[var(--text-primary)]">Score Distribution</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Recorded match scores by range</p><div className="mt-5 h-[220px]">{scoreDistribution.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={scoreDistribution}><CartesianGrid vertical={false} stroke="var(--border-card)" strokeDasharray="3 4" /><XAxis dataKey="range" tick={{ fill: 'var(--text-muted)' }} /><YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} /><Tooltip /><Bar dataKey="count" name="Matches" fill="#7374E9" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart message="No score data returned by the backend." />}</div></section>
          <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-sm"><h2 className="text-base font-bold text-[var(--text-primary)]">Department Breakdown</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Recorded matches by job department</p><div className="mt-5 h-[220px]">{departmentBreakdown.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={departmentBreakdown} layout="vertical"><CartesianGrid horizontal={false} stroke="var(--border-card)" strokeDasharray="3 4" /><XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} /><YAxis type="category" dataKey="department" width={90} tick={{ fill: 'var(--text-primary)' }} /><Tooltip /><Bar dataKey="matches" name="Matches" fill="#10B981" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart message="No department data returned by the backend." />}</div></section>
        </section>
      </div>
    </main>
  );
}
