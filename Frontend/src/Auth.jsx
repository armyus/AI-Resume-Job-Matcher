import { useState } from 'react';
import { BriefcaseBusiness, UserRound } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Recruiter');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('rmi_users') || '[]');

    if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      const exists = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (exists) {
        setError('An account with this email already exists.');
        return;
      }

      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      localStorage.setItem(
        'rmi_users',
        JSON.stringify([...users, newUser])
      );

      localStorage.setItem(
        'rmi_current_user',
        JSON.stringify(newUser)
      );

      onLogin(newUser);
      return;
    }

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        (u.role || 'Recruiter') === role
    );

    if (!user) {
      setError('Invalid email or password.');
      return;
    }

    const authenticatedUser = { ...user, role: user.role || 'Recruiter' };
    localStorage.setItem(
      'rmi_current_user',
      JSON.stringify(authenticatedUser)
    );

    onLogin(authenticatedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="text-white font-black text-xl">R</span>
          </div>

          <h1 className="mt-4 text-2xl font-black text-slate-900">
            RMI<span className="text-indigo-600">AI</span>
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Resume Matching Intelligence
          </p>

        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">

          <div className="mb-6">

            <h2 className="text-lg font-extrabold text-slate-900">
              {mode === 'login'
                ? 'Welcome back'
                : 'Create your account'}
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your recruitment workspace.'
                : 'Set up your recruiter account to get started.'}
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            {mode === 'signup' && (
              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jamie Collins"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />

              </div>
            )}

            {/* Email */}
            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />

            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {mode === 'login' ? 'Sign in as' : 'I am signing up as'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'Recruiter', label: 'Recruiter', icon: BriefcaseBusiness },
                  { value: 'Candidate', label: 'Candidate', icon: UserRound },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${role === value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300'}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20"
            >
              {mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </button>

          </form>

          {/* Switch */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">

            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
            </p>

            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === 'login'
                    ? 'signup'
                    : 'login'
                );
                setError('');
              }}
              className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              {mode === 'login'
                ? 'Create an account'
                : 'Sign in instead'}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}