import { useState } from 'react';
import { Zap, User, Mail, Lock, Eye, EyeOff, BriefcaseBusiness, UserRound } from 'lucide-react';
import { registerUser } from '../services/api';

export default function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Recruiter');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser(name, email, password, role);

      onRegister(data.user);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Registration failed. Please try again.'
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
            <span className="font-black text-2xl">RMI</span>
            <span className="font-black text-2xl text-indigo-500">AI</span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Resume Matching Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111622] border border-[#1D2636] rounded-2xl p-6 shadow-2xl">

          <div className="mb-6">
            <h1 className="text-xl font-black">Create your account</h1>
            <p className="text-xs text-gray-400 mt-1">
              Start matching candidates with AI
            </p>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-gray-300">
                Full Name
              </label>

              <div className="relative mt-1.5">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jamie Collins"
                  className="w-full bg-[#131B2A] border border-[#1D2636] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

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
                  className="w-full bg-[#131B2A] border border-[#1D2636] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
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
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#131B2A] border border-[#1D2636] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs font-bold text-gray-300">
                Confirm Password
              </label>

              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-[#131B2A] border border-[#1D2636] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300">Register as</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          <div className="mt-5 pt-5 border-t border-[#1D2636] text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-indigo-400 font-bold hover:text-indigo-300"
              >
                Sign in
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}