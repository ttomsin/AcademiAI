import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppProvider';
import { Calendar, User, Mail, Lock, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const { login, signup } = useAppStore();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('Alex Student');
  const [email, setEmail] = useState('alex@university.edu');
  const [password, setPassword] = useState('password123');
  const [major, setMajor] = useState('Computer Science');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password);
    } else {
      signup(name, email, password, major);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-lg shadow-indigo-200">
            <Calendar className="w-12 h-12" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
          Welcome to AcademiAI
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
          Your Intelligent Academic Assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 sm:rounded-3xl sm:px-10">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              type="button"
              className={cn("flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-colors", isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={cn("flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-colors", !isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-colors"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Course of Study / Major
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-colors"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6"
            >
              {isLogin ? 'Sign In to Start' : 'Create Account'}
            </button>
            
            <p className="text-[10px] font-bold uppercase text-center text-slate-400 mt-4 tracking-wider">
              {isLogin ? "Mock prototype: Any email/password will work" : "Mock prototype: Feel free to use fake data"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
