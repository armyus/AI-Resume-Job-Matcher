import { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, BriefcaseBusiness, UserRound } from 'lucide-react';
import { loginUser } from '../services/api';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Recruiter');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password, role);

      onLogin(data.user);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F3F4F6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto mb-3">
            <Zap className="w-6 h-6 fill-indigo-500" />
          </div>

          <div className="flex items-center justify-center gap-1">
            <span className="font-black text-2xl tracking-tight">RMI</span>
            <span className="font-black text-2xl text-indigo-500">AI</span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Resume Matching Intelligence
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111622] border border-[#1D2636] rounded-2xl p-6 shadow-2xl">

          <div className="mb-6">
            <h1 className="text-xl font-black">Welcome back</h1>
            <p className="text-xs text-gray-400 mt-1">
              Sign in to your recruiter workspace
            </p>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-300">
                Email
              </label>

              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#131B2A] border border-[#1D2636] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-300">
                Password
              </label>

              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#131B2A] border border-[#1D2636] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300">Sign in as</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {[
                  { value: 'Recruiter', label: 'Recruiter', icon: BriefcaseBusiness },
                  { value: 'Candidate', label: 'Candidate', icon: UserRound },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setRole(value)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${role === value ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300' : 'border-[#1D2636] bg-[#131B2A] text-gray-500 hover:border-indigo-500/50'}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <div className="mt-5 pt-5 border-t border-[#1D2636] text-center">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-indigo-400 font-bold hover:text-indigo-300"
              >
                Create one
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}