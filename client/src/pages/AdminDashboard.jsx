import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Download, 
  Plus, 
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [projects, setProjects] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Create Deadline Form State
  const [dlTitle, setDlTitle] = useState('');
  const [dlDept, setDlDept] = useState('Computer Science');
  const [dlDate, setDlDate] = useState('');
  const [dlSuccess, setDlSuccess] = useState('');
  const [dlError, setDlError] = useState('');
  const [dlLoading, setDlLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build query string for projects
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (department) params.append('department', department);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [projectsRes, deadlinesRes] = await Promise.all([
        api.get(`/admin/projects?${params.toString()}`),
        api.get('/admin/deadlines')
      ]);

      setProjects(projectsRes.data);
      setDeadlines(deadlinesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch faculty metrics and projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, status, department, startDate, endDate]);

  const handleCreateDeadline = async (e) => {
    e.preventDefault();
    if (!dlTitle || !dlDept || !dlDate) {
      setDlError('Please fill in all deadline fields.');
      return;
    }

    setDlError('');
    setDlSuccess('');
    setDlLoading(true);

    try {
      const { data } = await api.post('/admin/deadlines', {
        title: dlTitle,
        department: dlDept,
        dueDate: dlDate
      });
      setDlSuccess('Deadline created successfully!');
      setDeadlines(prev => [...prev, data]);
      
      // Reset form
      setDlTitle('');
      setDlDate('');
    } catch (err) {
      console.error(err);
      setDlError(err.response?.data?.message || 'Failed to create deadline.');
    } finally {
      setDlLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Project_Submissions_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // Metrics calculations
  const totalCount = projects.length;
  const pendingCount = projects.filter(p => p.status === 'Pending').length;
  const approvedCount = projects.filter(p => p.status === 'Approved').length;
  const rejectedCount = projects.filter(p => p.status === 'Rejected').length;

  const departmentsList = [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">Faculty Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">Submissions Dashboard</h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition self-start sm:self-center"
        >
          <Download className="w-4 h-4" />
          Export submissions (CSV)
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: totalCount, icon: FileText, color: 'text-slate-600 bg-slate-100 border-slate-200' },
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Approved Projects', value: approvedCount, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Rejected Projects', value: rejectedCount, icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' }
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
        
        {/* Submissions Section (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800">Filter & Search Submissions</h2>
            </div>

            {/* Filter grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px]">Search Title / Student</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, title..."
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px]">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">All Departments</option>
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px]">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px]">Submission Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px]">Submission End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setDepartment('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Submissions List Grid */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 animate-float" />
                <h3 className="font-semibold text-slate-700 text-base mb-1">No Matching Submissions Found</h3>
                <p className="text-xs max-w-sm mx-auto">
                  Try adjusting your search criteria, selecting another department, or changing filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((p) => {
                  const student = p.studentId || {};
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
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                            {p.status}
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                            {student.department || 'N/A'}
                          </span>
                          {p.grade && (
                            <span className="bg-brand-50 border border-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded font-bold">
                              Grade: {p.grade}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{p.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                        
                        <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                          <span className="font-semibold text-slate-600">
                            By: {student.name || 'Unknown'} ({student.email || 'N/A'})
                          </span>
                          <span>&bull;</span>
                          <span>Submitted: {new Date(p.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center border-t border-slate-50 sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                        <Link 
                          to={`/projects/${p._id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 px-3.5 py-2.5 rounded-xl transition"
                        >
                          Review Submission
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls (Right Column) */}
        <div className="space-y-6">
          
          {/* Create Deadline Tool */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Set Submission Deadline</h2>
              <p className="text-slate-400 text-[10px] mt-0.5">Faculty set due dates for student departments.</p>
            </div>

            {dlError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dlError}</span>
              </div>
            )}

            {dlSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{dlSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateDeadline} className="space-y-3 text-xs font-semibold text-slate-500">
              <div>
                <label className="block mb-1.5">Deadline Title</label>
                <input
                  type="text"
                  value={dlTitle}
                  onChange={(e) => setDlTitle(e.target.value)}
                  placeholder="e.g. Final Report Submission"
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5">Department</label>
                <select
                  value={dlDept}
                  onChange={(e) => setDlDept(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  required
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={dlDate}
                  onChange={(e) => setDlDate(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={dlLoading}
                className="w-full mt-2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold shadow-md shadow-brand-600/10 flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                {dlLoading ? 'Creating...' : 'Create Deadline'}
              </button>
            </form>
          </div>

          {/* List of Existing Deadlines */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Active Deadlines</h2>
            
            {deadlines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No deadlines set.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {deadlines.map((d) => {
                  const isExpired = new Date() > new Date(d.dueDate);
                  return (
                    <div 
                      key={d._id}
                      className={`p-3.5 rounded-xl border flex gap-3 text-xs ${
                        isExpired 
                          ? 'bg-rose-50/20 border-rose-100 text-rose-800' 
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <Calendar className={`w-4 h-4 mt-0.5 shrink-0 ${isExpired ? 'text-rose-500' : 'text-slate-400'}`} />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h4 className="font-bold leading-snug truncate">{d.title}</h4>
                        <p className="text-[10px] text-slate-400">{d.department}</p>
                        <p className="text-[10px] font-semibold mt-1">
                          {isExpired ? 'Expired: ' : 'Due: '}
                          {new Date(d.dueDate).toLocaleString()}
                        </p>
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

export default AdminDashboard;
