import React, { useState } from 'react';
import { useAppStore } from '../store/AppProvider';
import { BookOpen, Plus, Book, Trash2 } from 'lucide-react';

export function Courses() {
  const { courses, addCourse, removeCourse } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    
    addCourse({ code, name });
    setCode('');
    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Courses</h2>
          <p className="text-slate-500 mt-1">Manage your academic load.</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white p-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Add Course</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border text-left border-slate-100 shadow-sm rounded-2xl p-5 sm:p-6 mb-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">New Course</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Code</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CSC 101"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-bold uppercase"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Course Name</label>
                <div className="relative">
                  <Book className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Intro to Programming"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold uppercase text-[11px] tracking-wider shadow-sm active:scale-[0.98] transition-all"
              >
                Save Course
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Your Enrolled Courses</h3>
        {courses.length === 0 ? (
          <p className="text-slate-500 text-[10px] text-center p-4 bg-slate-50 font-bold uppercase rounded-2xl border border-slate-100">No courses listed yet. Add one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex gap-4 transition-all hover:shadow-md items-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 truncate tracking-tight">{course.code}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{course.name}</p>
                </div>
                <button 
                  onClick={() => removeCourse(course.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors rounded-lg"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
