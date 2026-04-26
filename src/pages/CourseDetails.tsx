import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Upload, FileText, BrainCircuit, Wand2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Course } from '../types';

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [syllabusText, setSyllabusText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const [studyPath, setStudyPath] = useState<any>(null);
  const [generatingPath, setGeneratingPath] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getCourse(id);
      setCourse(res.data);
      
      // Auto fetch study path
      const pathRes = await api.getStudyPath(id).catch(() => null);
      if (pathRes && pathRes.data) {
        setStudyPath(pathRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleParseSyllabus = async () => {
    if (!syllabusText.trim()) return;
    setParsing(true);
    try {
      const res = await api.parseSyllabus({ course_id: Number(id), syllabus_text: syllabusText });
      setParsedData(res.data);
      setSyllabusText(''); // clear on success
      alert("Syllabus parsed! AI will incorporate this into your schedule.");
    } catch (error) {
      console.error(error);
      alert("Failed to parse syllabus");
    } finally {
       setParsing(false);
    }
  };

  const handleGenerateStudyPath = async () => {
    if (!id) return;
    setGeneratingPath(true);
    try {
      const res = await api.generateStudyPath(id);
      setStudyPath(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate study path.");
    } finally {
      setGeneratingPath(false);
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
  }

  if (!course) {
     return (
       <div className="text-center py-20">
         <h2 className="text-xl font-bold text-slate-800">Course not found</h2>
         <button onClick={() => navigate('/courses')} className="mt-4 text-indigo-600 font-medium hover:underline">Return to Courses</button>
       </div>
     );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/courses')} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{course.code}</h2>
          <p className="text-slate-500 font-medium text-sm">{course.name}</p>
        </div>
      </div>

      {/* Syllabus Section */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 sm:p-6">
         <div className="flex items-center gap-2 mb-4">
           <FileText className="w-5 h-5 text-indigo-500" />
           <h3 className="text-lg font-bold text-slate-900">AI Syllabus Analyzer</h3>
         </div>
         
         {!parsedData ? (
           <div className="space-y-4">
             <p className="text-xs text-slate-500 leading-relaxed">
               Paste your course syllabus here. Our AI will automatically extract assessments, deadlines, and weekly topics and schedule them for you.
             </p>
             <textarea 
               rows={5}
               value={syllabusText}
               onChange={(e) => setSyllabusText(e.target.value)}
               placeholder="Paste syllabus content here..."
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
             />
             <button 
               onClick={handleParseSyllabus}
               disabled={parsing || !syllabusText.trim()}
               className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
             >
               {parsing ? <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <BrainCircuit className="w-4 h-4" />}
               Parse & Integrate
             </button>
           </div>
         ) : (
           <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <h4 className="font-bold text-emerald-900">Syllabus Analyzed!</h4>
              <p className="text-xs text-emerald-700 mt-1">Assessments and topics have been processed and integrated.</p>
              {parsedData.assessments && (
                 <p className="text-[10px] uppercase font-bold text-emerald-600 mt-4 tracking-wider">
                   {parsedData.assessments.length} Assessments Found
                 </p>
              )}
           </div>
         )}
      </div>

      {/* Study Path Section */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 sm:p-6 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
         
         <div className="flex items-center gap-2 mb-4 relative z-10">
           <Wand2 className="w-5 h-5 text-indigo-500" />
           <h3 className="text-lg font-bold text-slate-900">Personalized Study Path</h3>
         </div>

         {!studyPath ? (
           <div className="text-center py-6 relative z-10">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
               <Wand2 className="w-6 h-6" />
             </div>
             <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
               Generate a tailored, week-by-week study progression based on your syllabus and learning style.
             </p>
             <button 
               onClick={handleGenerateStudyPath}
               disabled={generatingPath}
               className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2"
             >
               {generatingPath ? <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : null}
               {generatingPath ? 'Generating...' : 'Generate Study Path'}
             </button>
           </div>
         ) : (
           <div className="relative z-10 space-y-4">
               {/* Just showing generated path as text since it might vary, or preformatting it */}
               <div className="bg-slate-50 rounded-xl p-4 prose prose-sm max-w-none text-slate-700">
                  <pre className="whitespace-pre-wrap font-sans text-xs">{studyPath.generated_path || JSON.stringify(studyPath, null, 2)}</pre>
               </div>
           </div>
         )}
      </div>

    </div>
  );
}
