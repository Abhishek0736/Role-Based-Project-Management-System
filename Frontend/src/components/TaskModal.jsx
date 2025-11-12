import React, { useCallback, useEffect, useState } from 'react'
import { baseControlClasses, DEFAULT_TASK, priorityStyles } from '../assets/dummy'
import { AlignLeft, Calendar, CheckCircle, Flag, PlusCircle, X, Save, FolderOpen, Users, Tag, Plus } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:3000/api/tasks'

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout, projects = [], onTaskCreated }) => {
  const [allProjects, setAllProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [userRole] = useState(localStorage.getItem('userRole') || 'employee');

  const [taskData, setTaskData] = useState({
    ...DEFAULT_TASK,
    project: '',
    assignedTo: [],
    tags: [],
    estimatedHours: 0,
    status: 'todo'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState(null)
  const [newTag, setNewTag] = useState('')
  const today = new Date().toISOString().split('T')[0];

  // Fetch project members when project is selected
  const fetchProjectMembers = async (projectId) => {
    if (!projectId) {
      setProjectMembers([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get(`http://localhost:3000/api/projects/${projectId}`, { headers });
      setProjectMembers(response.data.team || []);
    } catch (error) {
      console.error('Error fetching project members:', error);
      setProjectMembers([]);
    }
  };

  // Handle project selection change
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setTaskData(prev => ({ ...prev, project: projectId }));
    fetchProjectMembers(projectId);
  };

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/projects', { headers });
      setAllProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    if(!isOpen) return;
    if(taskToEdit) {
      const normalized = taskToEdit.completed === 'Yes' || taskToEdit.completed === true ? 'Yes' : 'No';
      setTaskData({ 
        ...DEFAULT_TASK,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'Low',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        completed: normalized,
        project: taskToEdit.project || '',
        assignedTo: taskToEdit.assignedTo || [],
        tags: taskToEdit.tags || [],
        estimatedHours: taskToEdit.estimatedHours || 0,
        status: taskToEdit.status || 'todo',
        id: taskToEdit.id
      });
    }
    else{
      setTaskData({
        ...DEFAULT_TASK,
        project: '',
        assignedTo: [],
        tags: [],
        estimatedHours: 0,
        status: 'todo'
      })
    }
       setErrors(null)
  }, [isOpen, taskToEdit])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, [])

  const addTag = useCallback(() => {
    if (newTag.trim() && !taskData.tags.includes(newTag.trim())) {
      setTaskData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, taskData.tags])

  const removeTag = useCallback((tagToRemove) => {
    setTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, [])

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    if(!token) throw new Error('Not authenticated')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if(taskData.dueDate < today) {
      setErrors('Due date cannot be in the past')
      return;
    }
    
    // Validate project if provided
    if(taskData.project && taskData.project.trim() && !allProjects.find(p => p._id === taskData.project)) {
      setErrors('Invalid project selected. Please select a valid project or leave it empty.');
      return;
    }
    
    setLoading(true)
    setErrors(null)
    try {
      const submitData = { ...taskData };
      // Remove project if empty string
      if (!submitData.project || submitData.project.trim() === '') {
        delete submitData.project;
      }
      
      const isEdit = Boolean(taskData.id);
      const url = isEdit ? `${API_BASE}/${taskData.id}` : `${API_BASE}/gp`;
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(submitData)
      })
      if(!response.ok) {
        if(response.status === 401) return onLogout?.();
        const err = await response.json();
        throw new Error(err.message || 'Failed to save task')
      }
      const saved = await response.json();
      onSave?.(saved);
      onTaskCreated?.();
      onClose();
    } catch (error) {
      console.error(error)
      setErrors(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false)
    }
  }, [taskData, today, getHeaders, onLogout, onClose, onSave, allProjects])

  if(!isOpen) return null;

  return (
      <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-50 flex items-center justify-center p-4">
           <div className="bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl max-w-lg w-full shadow-2xl relative p-8 max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                      {taskData.id ? <Save className="text-blue-500 w-6 h-6" /> :
                      <PlusCircle className="text-blue-500 w-6 h-6" />}
                        {taskData.id ? 'Edit Task' : 'Create New Task'}
                    </h2>

                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg transition text-gray-500 hover:text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                          <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form to Fill */}
                <form onSubmit={handleSubmit} className="space-y-4">
                     {errors && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{errors}</div>}
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                            Task Title
                      </label>
                      <div className='flex items-center border border-purple-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200'>
                          <input type='text' name='title' required value={taskData.title} onChange={handleChange} className='w-full focus:outline-none text-sm' placeholder='Enter task title' />
                      </div>
                     </div>
                     
                     <div>
                       <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                             <AlignLeft className='w-4 h-4 text-purple-500' />Description
                       </label>

                       <textarea name='description' rows='3' value={taskData.description} onChange={handleChange} className={baseControlClasses} placeholder='Add details about your task' />
                     </div>

                     {/* Project Selection */}
                     <div>
                       <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                             <FolderOpen className='w-4 h-4 text-purple-500' />Project
                       </label>
                       <select name='project' value={taskData.project} onChange={handleProjectChange} className={baseControlClasses}>
                            <option value=''>Select a project (optional)</option>
                            {allProjects.map(project => (
                              <option key={project._id} value={project._id}>
                                {project.name}
                              </option>
                            ))}
                       </select>
                     </div>

                     <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                                   <Flag className='w-4 h-4 text-purple-500' />Priority 
                            </label>
                            <select name='priority' value={taskData.priority} onChange={handleChange} className={baseControlClasses}>
                                 <option value='Low'>Low</option>
                                 <option value='Medium'>Medium</option>
                                 <option value='High'>High</option>
                                 <option value='Critical'>Critical</option>
                            </select>
                          </div>

                          <div>
                            <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                                   Status
                            </label>
                            <select name='status' value={taskData.status} onChange={handleChange} className={baseControlClasses}>
                                 <option value='todo'>To Do</option>
                                 <option value='in-progress'>In Progress</option>
                                 <option value='review'>Review</option>
                                 <option value='done'>Done</option>
                            </select>
                          </div>
                     </div>

                     <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                                   <Calendar className='w-4 h-4 text-purple-500' />Due Date
                            </label>
                            <input type='date' name='dueDate' value={taskData.dueDate} required min={today} onChange={handleChange} className={baseControlClasses} />
                          </div>

                          <div>
                            <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                                   Estimated Hours
                            </label>
                            <input type='number' name='estimatedHours' value={taskData.estimatedHours} onChange={handleChange} min='0' step='0.5' className={baseControlClasses} placeholder='0' />
                          </div>
                     </div>

                     {/* Assign to Project Members - Only for Managers/Admins */}
                     {(userRole === 'admin' || userRole === 'manager') && taskData.project && projectMembers.length > 0 && (
                       <div>
                         <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-2'>
                               <Users className='w-4 h-4 text-purple-500' />Assign to Team Member
                         </label>
                         <select 
                           value={taskData.assignedTo?.[0] || ''} 
                           onChange={(e) => setTaskData(prev => ({ 
                             ...prev, 
                             assignedTo: e.target.value ? [e.target.value] : [] 
                           }))}
                           className={baseControlClasses}
                         >
                           <option value=''>Select team member (optional)</option>
                           {projectMembers.map(member => (
                             <option key={member.user._id} value={member.user._id}>
                               {member.user.name} ({member.role})
                             </option>
                           ))}
                         </select>
                       </div>
                     )}

                     {/* Tags */}
                     <div>
                       <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-2'>
                             <Tag className='w-4 h-4 text-purple-500' />Tags
                       </label>
                       <div className='flex flex-wrap gap-2 mb-2'>
                         {taskData.tags.map((tag, index) => (
                           <span key={index} className='inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full'>
                             {tag}
                             <button type='button' onClick={() => removeTag(tag)} className='hover:text-purple-600'>
                               <X className='w-3 h-3' />
                             </button>
                           </span>
                         ))}
                       </div>
                       <div className='flex gap-2'>
                         <input
                           type='text'
                           value={newTag}
                           onChange={(e) => setNewTag(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                           className='flex-1 px-3 py-2 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm'
                           placeholder='Add a tag...'
                         />
                         <button type='button' onClick={addTag} className='px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors'>
                           <Plus className='w-4 h-4' />
                         </button>
                       </div>
                     </div>

                     <div>
                       <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-2'>
                             <CheckCircle className='w-4 h-4 text-purple-500' />Completion Status
                       </label>
                       <div className='flex gap-4'> 
                            {[{ val: 'Yes', label: 'Completed' }, { val: 'No', label: 'Not Completed' }].map(({ val, label }) => (
                              <label key={val} className='flex items-center'> 
                                 <input type='radio' name='completed' value={val} checked={taskData.completed === val} onChange={handleChange} className='w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded' />
                                <span className='ml-2 text-sm text-gray-700'>{label}</span>
                              </label>
                            ))}
                       </div>
                     </div>

                       <button type='submit' disabled={loading} className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg'>
                               {loading ? 'Saving...' : (taskData.id ? <>
                               <Save className='w-4 h-4' /> Update Task
                               </> : <>
                               <PlusCircle className='w-4 h-4' /> Create Task
                               </>) }
                       </button>
                </form>
           </div>
      </div>
  )
}

export default TaskModal



