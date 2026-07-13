import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Download, 
  Github, 
  MessageSquare, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  AlertCircle,
  Check,
  User as UserIcon,
  Loader2
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Faculty review states
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      
      // Seed review states with existing database values if present
      setReviewStatus(data.status === 'Pending' ? 'Approved' : data.status);
      setReviewFeedback(data.feedback || '');
      setReviewGrade(data.grade || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewStatus) {
      setReviewError('Please select a review status.');
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);

    try {
      await api.put(`/admin/projects/${id}/review`, {
        status: reviewStatus,
        feedback: reviewFeedback,
        grade: reviewGrade
      });
      setReviewSuccess('Review and grading updated successfully!');
      
      // Re-fetch project details to update UI state
      await fetchProjectDetails();
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Error Loading Project</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isStudent = user?.role === 'student';
  const studentInfo = project.studentId || {};
  const deadlineInfo = project.deadlineId || {};
  
  // Status styling configurations
  const isApproved = project.status === 'Approved';
  const isRejected = project.status === 'Rejected';
  
  const statusColor = isApproved 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
    : isRejected 
    ? 'bg-rose-50 text-rose-700 border-rose-100' 
    : 'bg-amber-50 text-amber-700 border-amber-100';

  const downloadUrl = `http://localhost:5000${project.fileUrl}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Back navigation */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Project Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              {project.status}
            </span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-semibold">
              {studentInfo.department || 'N/A'}
            </span>
            {project.grade && (
              <span className="bg-brand-50 border border-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded font-bold">
                Grade: {project.grade}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              {studentInfo.name || 'Unknown'} ({studentInfo.email})
            </span>
            <span>&bull;</span>
            <span>Submitted: {new Date(project.submittedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* GitHub link button */}
        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition shadow-sm w-full sm:w-auto justify-center"
          >
            <Github className="w-4 h-4" />
            GitHub Repository
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Project Description & Documents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Project Overview</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
            
            {/* Tech Stack */}
            <div className="pt-4 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Technologies Used</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech, idx) => (
                  <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 text-xs px-3 py-1 rounded-lg font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Document download box */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submitted Document</h2>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{project.fileName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click download to inspect files</p>
                </div>
              </div>
              
              <a
                href={downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-brand-600/10 shrink-0"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback or Faculty Review Form */}
        <div className="space-y-6">
          
          {/* Review Panel for Students */}
          {isStudent && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Award className="w-5 h-5 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800">Faculty Review & Grade</h2>
              </div>

              {project.status === 'Pending' ? (
                <div className="text-center py-6 space-y-3">
                  <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
                  <h3 className="font-semibold text-slate-700 text-sm">Review Pending</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Faculty has not graded your project submission yet. You will receive an in-app notification once updated.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grade report card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Grade</span>
                    <span className="text-3xl font-extrabold text-brand-600 mt-1 block">
                      {project.grade || 'No Grade'}
                    </span>
                  </div>

                  {/* Feedback comments */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instructor Comments</span>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                        {project.feedback ? `"${project.feedback}"` : 'No comments provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grading Form for Faculty */}
          {!isStudent && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Award className="w-5 h-5 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800">Submit Review & Grade</h2>
              </div>

              {reviewError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
                
                {/* Status Selection */}
                <div>
                  <label className="block mb-1.5">Review Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('Approved')}
                      className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                        reviewStatus === 'Approved'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-500/5'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewStatus('Rejected')}
                      className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                        reviewStatus === 'Rejected'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-md shadow-rose-500/5'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className="block mb-1.5">Assign Grade / Marks</label>
                  <input
                    type="text"
                    value={reviewGrade}
                    onChange={(e) => setReviewGrade(e.target.value)}
                    placeholder="e.g. A, B+, 95/100"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                {/* Feedback Comments */}
                <div>
                  <label className="block mb-1.5">Feedback / Comments</label>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={4}
                    placeholder="Add evaluation comments here..."
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full mt-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-600/10 flex items-center justify-center gap-2 transition"
                >
                  {reviewLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting review...
                    </>
                  ) : (
                    'Submit Assessment'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
