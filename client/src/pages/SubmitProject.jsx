import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Upload, 
  Github, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';

const SubmitProject = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [githubLink, setGithubLink] = useState('');
  const [file, setFile] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingFileName, setExistingFileName] = useState('');

  // Fetch details if we are in edit mode
  useEffect(() => {
    if (editId) {
      const fetchProjectDetails = async () => {
        try {
          setFetchingDetails(true);
          const { data } = await api.get(`/projects/${editId}`);
          setTitle(data.title);
          setDescription(data.description);
          setTechStack(data.techStack);
          setGithubLink(data.githubLink || '');
          setExistingFileName(data.fileName);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch project details for editing');
        } finally {
          setFetchingDetails(false);
        }
      };
      fetchProjectDetails();
    }
  }, [editId]);

  // Handle tech stack tags
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = techInput.trim();
    if (tag && !techStack.includes(tag)) {
      setTechStack([...techStack, tag]);
      setTechInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTechStack(techStack.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check size limit: 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Max limit is 10MB.');
      setFile(null);
      return;
    }

    // Check file extension
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'zip'].includes(ext)) {
      setError('Unsupported file type. Only PDF, DOCX, and ZIP files are allowed.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || techStack.length === 0) {
      setError('Please fill in all required fields and add at least one tech stack tag.');
      return;
    }

    if (!editId && !file) {
      setError('Please upload a project document.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('techStack', JSON.stringify(techStack));
    formData.append('githubLink', githubLink);
    if (file) {
      formData.append('file', file);
    }

    try {
      if (editId) {
        await api.put(`/projects/${editId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Project submission updated successfully!');
      } else {
        await api.post('/projects', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Project submitted successfully!');
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Submission failed. Please check the deadline or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDetails) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {editId ? 'Edit Project Submission' : 'Submit New Project'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {editId 
              ? 'Update details or replace files for your project submission before the deadline.'
              : 'Fill in your project metadata and upload documentation. Maximum file size is 10MB.'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white transition text-sm"
              placeholder="e.g. AI Smart Classroom Assistant"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white transition text-sm"
              placeholder="Provide a detailed summary of what your project achieves, its goals, architecture, and features..."
              required
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tech Stack Used *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                className="block flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white transition text-sm"
                placeholder="e.g. React, Node.js (Press enter to add)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Tags view */}
            <div className="flex flex-wrap gap-2 mt-3">
              {techStack.length === 0 && (
                <span className="text-xs text-slate-400">No tech stack tags added yet. Add at least one.</span>
              )}
              {techStack.map((tag) => (
                <span 
                  key={tag}
                  className="bg-brand-50 border border-brand-100 text-brand-700 text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition hover:bg-brand-100"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:bg-brand-200/50 rounded-full transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* GitHub Repository */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GitHub Repository URL (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Github className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white transition text-sm"
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Project Documentation * {editId && '(Upload file only to replace existing)'}
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50/50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,.zip"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Drag and drop your file here, or <span className="text-brand-600 hover:text-brand-500 transition">browse files</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, ZIP (Max 10MB)</p>
            </div>

            {/* Selected File Details */}
            {file && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span className="font-semibold text-slate-700 truncate max-w-xs">{file.name}</span>
                  <span className="text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Old File Details */}
            {editId && !file && existingFileName && (
              <div className="mt-3 p-3 bg-brand-50/40 border border-brand-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span className="font-semibold text-slate-700 truncate max-w-xs">Existing: {existingFileName}</span>
                </div>
                <span className="text-[10px] bg-brand-100/70 text-brand-700 px-2 py-0.5 rounded font-medium">Keeping existing file</span>
              </div>
            )}
          </div>

          {/* Submission button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20 flex items-center justify-center gap-2 transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {editId ? 'Updating submission...' : 'Submitting project...'}
              </>
            ) : (
              editId ? 'Save Changes' : 'Submit Project'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;
