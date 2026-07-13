import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  Github, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, deadlinesRes] = await Promise.all([
        api.get('/projects'),
        api.get('/admin/deadlines')
      ]);
      setProjects(projectsRes.data);
      setDeadlines(deadlinesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete submission');
    }
  };

  // Metrics calculations
  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.status === 'Pending').length,
    approved: projects.filter(p => p.status === 'Approved').length,
    rejected: projects.filter(p => p.status === 'Rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {user?.department} Department
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Hello, {user?.name}!</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl">
            Welcome to your project submission panel. Upload, manage, and review your academic project statuses here.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Submitted', value: stats.total, icon: FileText, color: 'text-slate-600 bg-slate-100 border-slate-200' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Approved Projects', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Rejected Projects', value: stats.rejected, icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">{item.label}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block">{item.value}</span>
            </div>
            <div className={`p-3 rounded-xl border ${item.color.split(' ')[1]} ${item.color.split(' ')[2]}`}>
              <item.icon className={`w-6 h-6 ${item.color.split(' ')[0]}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Your Submissions</h2>
            <Link
              to="/submit"
              className="flex items-center gap-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              New Submission
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-700 text-base mb-1">No Projects Submitted Yet</h3>
              <p className="text-xs mb-6 max-w-sm mx-auto">
                Ready to submit your work? Click below to fill out your project details and upload documentation.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition"
              >
                Create Submission
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => {
                const isPending = p.status === 'Pending';
                const isApproved = p.status === 'Approved';
                const isRejected = p.status === 'Rejected';
                
                const badgeColor = isApproved 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : isRejected 
                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100';

                return (
                  <div 
                    key={p._id} 
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                          {p.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted on {new Date(p.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">{p.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                      
                      {/* Tech stack */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.techStack.map((tech, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-100 text-[10px] text-slate-500 px-2 py-0.5 rounded font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center border-t border-slate-50 sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                      {p.githubLink && (
                        <a 
                          href={p.githubLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 rounded-lg transition"
                          title="GitHub Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      <Link 
                        to={`/projects/${p._id}`}
                        className="flex items-center gap-1 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg transition"
                      >
                        Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      
                      {isPending && (
                        <>
                          <Link 
                            to={`/submit?edit=${p._id}`}
                            className="text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-2 rounded-lg transition"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(p._id)}
                            className="text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-2 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deadlines Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Deadlines</h2>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            {deadlines.filter(d => d.active).length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming deadlines for your department.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {deadlines.map((d) => {
                  const isExpired = new Date() > new Date(d.dueDate);
                  return (
                    <div 
                      key={d._id} 
                      className={`p-4 rounded-2xl border transition flex gap-3 ${
                        isExpired 
                          ? 'bg-rose-50/20 border-rose-100 text-rose-800' 
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        <Calendar className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-bold leading-tight">{d.title}</h4>
                        <p className="text-[10px] text-slate-400">{d.department}</p>
                        <div className="flex items-center gap-1 pt-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-semibold">
                            {isExpired ? 'Expired: ' : 'Due: '}
                            {new Date(d.dueDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
