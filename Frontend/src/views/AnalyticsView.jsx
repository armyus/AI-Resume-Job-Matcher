/* Previous compact analytics implementation retained for reference.
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export default function AnalyticsView() {
  const lineData = [
    { month: 'Apr', Applications: 35, Screened: 20, Hired: 4 },
    { month: 'May', Applications: 52, Screened: 31, Hired: 6 },
    { month: 'Jun', Applications: 48, Screened: 28, Hired: 5 },
    { month: 'Jul', Applications: 61, Screened: 38, Hired: 8 },
    { month: 'Aug', Applications: 80, Screened: 49, Hired: 10 },
    { month: 'Sep', Applications: 94, Screened: 58, Hired: 12 },
  ];

  const pieData = [
    { name: 'LinkedIn', value: 38, color: '#6366F1' },
    { name: 'Referral', value: 22, color: '#10B981' },
    { name: 'Direct', value: 18, color: '#3B82F6' },
    { name: 'Job Boards', value: 14, color: '#F59E0B' },
    { name: 'Other', value: 8, color: '#6B7280' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Analytics KPI Metric Cards * /}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total Applications', val: '371', change: '+23%', positive: true },
          { label: 'Avg. AI Match Score', val: '72.4%', change: '+4.1pt', positive: true },
          { label: 'Offer Acceptance Rate', val: '66.7%', change: '-5.2pt', positive: false },
          { label: 'Avg. Time to Hire', val: '36d', change: '-8d', positive: true },
          { label: 'Screening Pass Rate', val: '54.8%', change: '+2.3pt', positive: true },
          { label: 'AI Accuracy Rate', val: '91%', change: '+3pt', positive: true },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</p>
            <p className="text-xl font-black text-[var(--text-primary)] mt-1">{kpi.val}</p>
            <span className={`text-[10px] font-bold ${kpi.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {kpi.change} vs last quarter
            </span>
          </div>
        ))}
      </div>

      {/* Analytics Main Charts Grid * /}
      <div className="grid grid-cols-12 gap-5">
        {/* Application Volume Area Chart * /}
        <div className="col-span-12 lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Application Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="gradApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="Applications" stroke="#6366F1" fillOpacity={1} fill="url(#gradApp)" strokeWidth={2} />
                <Area type="monotone" dataKey="Screened" stroke="#10B981" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Sources Donut Chart * /}
        <div className="col-span-12 lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Candidate Sources</h3>
          <div className="h-48 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                  {p.name}
                </span>
                <span className="font-bold text-[var(--text-primary)]">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
*/
import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronDown, Download } from 'lucide-react';
import {
  Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const volumeData = [
  { month: 'Apr', applications: 38, screened: 22, hired: 2 },
  { month: 'May', applications: 51, screened: 30, hired: 3 },
  { month: 'Jun', applications: 60, screened: 38, hired: 4 },
  { month: 'Jul', applications: 47, screened: 28, hired: 2 },
  { month: 'Aug', applications: 79, screened: 48, hired: 5 },
  { month: 'Sep', applications: 95, screened: 58, hired: 6 },
];

const sources = [
  { name: 'LinkedIn', value: 38, color: '#6366F1' },
  { name: 'Referral', value: 22, color: '#10B981' },
  { name: 'Direct / Organic', value: 18, color: '#A78BFA' },
  { name: 'Job Boards', value: 14, color: '#F59E0B' },
  { name: 'Other', value: 8, color: '#64748B' },
];

const scoreDistribution = [
  { range: '0–40', candidates: 8, color: '#F45B5B' },
  { range: '41–55', candidates: 14, color: '#F8AD26' },
  { range: '56–70', candidates: 31, color: '#94A3B8' },
  { range: '71–85', candidates: 48, color: '#706FE6' },
  { range: '86–100', candidates: 22, color: '#35BF91' },
];

const departmentDays = [
  { department: 'Engineering', days: 42 }, { department: 'Product', days: 31 },
  { department: 'Design', days: 27 }, { department: 'AI/ML', days: 55 },
  { department: 'Revenue', days: 24 }, { department: 'Infra', days: 38 },
];

const funnel = [
  { label: 'Applied', note: '', amount: 270, percent: 100, color: '#DCE3EE' },
  { label: 'Screened', note: '55% pass', amount: 148, percent: 55, color: '#7374E9' },
  { label: 'Interview', note: '41% pass', amount: 61, percent: 23, color: '#A78BEE' },
  { label: 'Offer', note: '30% pass', amount: 18, percent: 7, color: '#2FC194' },
  { label: 'Hired', note: '67% pass', amount: 12, percent: 4, color: '#58D3AF' },
];

const gaps = [
  ['Kubernetes', 78], ['AWS ECS', 71], ['Docker', 65], ['System Design', 58], ['Go / Rust', 52], ['Terraform', 44],
];

function ChartTooltip({ active, payload, label, kind }) {
  if (!active || !payload?.length) return null;
  if (kind === 'department') return <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-xl"><b>{label}</b><p className="mt-2 text-[var(--text-muted)]"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />Days: <b className="text-[var(--text-primary)]">{payload[0].value}</b></p></div>;
  if (kind === 'score') return <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-xl"><b>{label}</b><p className="mt-2 text-[var(--text-muted)]">Candidates: <b className="text-[var(--text-primary)]">{payload[0].value}</b></p></div>;
  const uniquePoints = payload.filter((point, index, points) => points.findLastIndex((candidate) => candidate.dataKey === point.dataKey) === index);
  return <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-xl"><b>{label}</b>{uniquePoints.map((point) => <p key={point.dataKey} className="mt-1 text-[var(--text-muted)]"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: point.color }} />{point.name}: <b className="text-[var(--text-primary)]">{point.value}</b></p>)}</div>;
}

function Card({ title, subtitle, children, className = '' }) {
  return <section className={`rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-sm ${className}`}><h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>{subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}{children}</section>;
}

export default function AnalyticsView({ analyticsData, onExport }) {
  const [period, setPeriod] = useState('Last 6 months');
  const hasLiveData = analyticsData?.total_applications > 0;
  const totalApplications = hasLiveData ? analyticsData.total_applications : 371;
  const averageMatchScore = hasLiveData ? `${analyticsData.average_match_score}%` : '72.4%';
  const screeningPassRate = hasLiveData ? `${analyticsData.screening_pass_rate}%` : '54.8%';
  return <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-app)]">
    <div className="flex flex-col items-start justify-between gap-5 border-b border-[var(--border-card)] px-4 py-6 sm:flex-row sm:items-center sm:px-10 sm:py-9">
      <div><h1 className="text-2xl font-black text-[var(--text-primary)]">Analytics</h1><p className="mt-1 text-base text-[var(--text-muted)]">Recruiting performance and AI matching intelligence</p></div>
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] sm:flex-none"><CalendarDays className="h-4 w-4" /><select value={period} onChange={(event) => setPeriod(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none sm:flex-none"><option>Last 6 months</option><option>Last quarter</option><option>Last 12 months</option></select><ChevronDown className="h-3.5 w-3.5" /></label><button onClick={onExport} className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-600">Export Report</button></div>
    </div>

    <div className="space-y-7 p-4 sm:p-10">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Total Applications" value={totalApplications} trend={hasLiveData ? 'Live' : '+23%'} detail={hasLiveData ? 'from current AI session' : 'vs last quarter'} color="text-[#6366F1]" />
        <Metric label="Avg. AI Match Score" value={averageMatchScore} trend={hasLiveData ? 'Live' : '+4.1pt'} detail="across all roles" color="text-emerald-500" />
        <Metric label="Offer Acceptance Rate" value="66.7%" trend="-5.2pt" detail="12 of 18 offers" color="text-amber-500" negative direction="down" />
        <Metric label="Avg. Time to Hire" value="36d" trend="-8d" detail="vs 44d last quarter" color="text-violet-400" direction="down" />
        <Metric label="Screening Pass Rate" value={screeningPassRate} trend={hasLiveData ? 'Live' : '+2.3pt'} detail={hasLiveData ? 'scores at or above 60%' : '148 of 270 applicants'} color="text-blue-500" />
        <Metric label="AI Accuracy Rate" value="91%" trend="+3pt" detail="Verdicts confirmed" color="text-emerald-500" />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card title="Application Volume" subtitle="Applications, screenings, and hires over time" className="xl:col-span-2"><div className="mt-5 h-[330px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={volumeData} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border-card)" strokeDasharray="3 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13 }} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="applications" stroke="none" fill="url(#applicationFill)" /><Line type="monotone" dataKey="applications" name="Applications" stroke="#5B61F6" strokeWidth={2.5} dot={false} /><Area type="monotone" dataKey="screened" stroke="none" fill="url(#screenFill)" /><Line type="monotone" dataKey="screened" name="Screened" stroke="#00B980" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="hired" name="Hired" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-card)', strokeWidth: 2 }} /><defs><linearGradient id="applicationFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity=".2" /><stop offset="100%" stopColor="#6366F1" stopOpacity="0" /></linearGradient><linearGradient id="screenFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity=".16" /><stop offset="100%" stopColor="#10B981" stopOpacity="0" /></linearGradient></defs></ComposedChart></ResponsiveContainer></div><div className="flex justify-center gap-5 text-sm"><LegendDot color="#5B61F6" label="Applications" /><LegendDot color="#F59E0B" label="Hired" /><LegendDot color="#00B980" label="Screened" /></div></Card>
        <Card title="Candidate Sources" subtitle="Where applicants originate"><div className="mt-3 h-[205px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-xl"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: payload[0].payload.color }} />{payload[0].name}: <b>{payload[0].value}</b></div> : null} /><Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={87} paddingAngle={3} stroke="none">{sources.map((source) => <Cell key={source.name} fill={source.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-2">{sources.map((source) => <div key={source.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-[var(--text-primary)]"><i className="h-2.5 w-2.5 rounded-full" style={{ background: source.color }} />{source.name}</span><b style={{ color: source.color }}>{source.value}%</b></div>)}</div></Card>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="AI Score Distribution" subtitle="Candidate match score breakdown across all roles"><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={scoreDistribution} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border-card)" strokeDasharray="3 4" /><XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13 }} /><YAxis domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13 }} /><Tooltip content={<ChartTooltip kind="score" />} /><Bar dataKey="candidates" radius={[5, 5, 0, 0]}>{scoreDistribution.map((item) => <Cell key={item.range} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card title="Time to Hire by Department" subtitle="Average days from posting to offer accepted"><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={departmentDays} layout="vertical" margin={{ top: 6, right: 25, left: 20, bottom: 0 }}><CartesianGrid horizontal={false} stroke="var(--border-card)" strokeDasharray="3 4" /><XAxis type="number" domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13 }} /><YAxis type="category" dataKey="department" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-primary)', fontSize: 13 }} width={86} /><Tooltip content={<ChartTooltip kind="department" />} /><Bar dataKey="days" fill="#8587EB" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div></Card>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 pb-4">
        <Card title="Pipeline Conversion Funnel" subtitle="Candidate drop-off at each stage"><div className="mt-6 space-y-2.5">{funnel.map((stage) => <div key={stage.label}><div className="flex items-center justify-between text-sm"><span className="font-medium text-[var(--text-primary)]">{stage.label} {stage.note && <em className="ml-2 not-italic" style={{ color: stage.color }}>{stage.note}</em>}</span><b className="text-indigo-500">{stage.amount}</b></div><div className="mt-1 h-8 overflow-hidden rounded-xl bg-[var(--bg-input)]"><div className="flex h-full items-center rounded-xl px-3 text-sm font-bold text-white" style={{ width: `${stage.percent}%`, minWidth: stage.percent < 10 ? '60px' : undefined, background: stage.color }}>{stage.percent}%</div></div></div>)}</div></Card>
        <Card title="Top Skill Gaps" subtitle="Most common missing skills across candidates vs JDs"><div className="mt-6 space-y-3.5">{gaps.map(([skill, value]) => <div key={skill}><div className="flex justify-between text-sm"><span className="font-medium text-[var(--text-primary)]">{skill}</span><span className="font-mono text-red-500">{value}% lacking</span></div><div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--bg-input)]"><div className="h-full rounded-full bg-gradient-to-r from-[#F26363] to-[#F9B12E]" style={{ width: `${value}%` }} /></div></div>)}</div><div className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-slate-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-slate-300"><b className="block text-indigo-500">AI Insight</b>Cloud DevOps skills (Docker, Kubernetes, AWS) are missing in <span className="font-medium text-red-500">70%+</span> of engineering applicants. Consider adding a paid upskill assessment or relaxing the hard requirement to “nice to have” to widen the funnel.</div></Card>
      </section>
    </div>
  </main>;
}

function Metric({ label, value, trend, detail, color, negative = false, direction = 'up' }) {
  const TrendIcon = direction === 'down' ? ArrowDownRight : ArrowUpRight;
  return <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-sm"><p className="text-sm text-[var(--text-muted)]">{label}</p><p className={`mt-3 font-mono text-3xl font-medium ${color}`}>{value}</p><p className={`mt-2 flex items-center gap-1 text-sm font-medium ${negative ? 'text-red-500' : 'text-emerald-500'}`}><TrendIcon className="h-4 w-4" aria-hidden="true" />{trend}</p><p className="mt-1 text-sm text-[var(--text-muted)]">{detail}</p></section>;
}

function LegendDot({ color, label }) { return <span className="flex items-center gap-1.5" style={{ color }}><i className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{label}</span>; }
