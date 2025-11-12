import React, { useMemo, useState, useEffect } from 'react'
import { CT_CLASSES, SORT_OPTIONS } from '../assets/dummy'
import { CheckCircle2, Filter } from 'lucide-react'
import TaskItem from '../components/TaskItem';
import axios from 'axios';
import { toast } from 'react-toastify';

const CompletePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ sortBy, setSortBy ] = useState("newest")

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/tasks/gp', { headers });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const sortedCompletedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        return task.completed === true || task.completed === 'Yes' || task.status === 'done';
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt ?? a.createAt ?? a.created_at);
        const dateB = new Date(b.createdAt ?? b.createAt ?? b.created_at);

        switch (sortBy) {
          case 'newest':
            return dateB - dateA;
          case 'oldest':
            return dateA - dateB;
          case 'priority': {
            const order = { high: 3, medium: 2, low: 1 };
            const pa = (a.priority ?? '').toString().toLowerCase();
            const pb = (b.priority ?? '').toString().toLowerCase();
            return (order[pb] || 0) - (order[pa] || 0);
          }
          default:
            return 0;
        }
      });
  }, [tasks, sortBy])

  return (
    <div className={CT_CLASSES.page}>
        {/* Header */}
        <div className={CT_CLASSES.header}>
            <div className={CT_CLASSES.titleWrapper}>
                 <h1 className={CT_CLASSES.title}>
                      <CheckCircle2 className='text-purple-500 w-5 h-5 md:w-6 md:h-6 ml-5' />
                      <span className='truncate'>Completed Tasks</span>
                 </h1>

                 <p className={CT_CLASSES.subtitle}>
                     {sortedCompletedTasks.length} task{sortedCompletedTasks.length !== 1 && 's'} {' '} marked as complete
                 </p>
            </div>

            {/* Sort Control */}
            <div className={CT_CLASSES.sort}>
                 <div className={CT_CLASSES.sortBox}>
                      <div className={CT_CLASSES.filterLabel}>
                           <Filter className='w-4 h-4 text-purple-500' />
                           <span className='text-xs md:text-sm'>Sort by:</span>
                      </div>

                      {/* /Mobile Dropdown */}
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={CT_CLASSES.select}> {SORT_OPTIONS.map(Opt => (
                        <option key={Opt.id} value={Opt.id}> 
                        {Opt.label} {Opt.id == 'newest' ? 'First' : ''}
                        </option>
                      ))}
                      </select>

                      {/* Destop Buttons */}
                      <div className={CT_CLASSES.btnGroup}>
                           {SORT_OPTIONS.map(Opt => (
                            <button key={Opt.id} onClick={() => setSortBy(Opt.id)} className={[CT_CLASSES.btnBase, sortBy === Opt.id ? CT_CLASSES.btnActive : CT_CLASSES.btnInactive].join(" ")}>
                              {Opt.icon}{Opt.label}
                            </button>
                           ))}
                      </div>
                 </div>
            </div>
        </div>

        {/* Task List */}
        <div className={CT_CLASSES.list}>
             {sortedCompletedTasks.length === 0 ? (
              <div className={CT_CLASSES.emptyState}>
                   <div className={CT_CLASSES.emptyIconWrapper}>
                        <CheckCircle2 className='w-6 h-6 md:h-8 text-purple-500' />
                   </div>
                   <h3 className={CT_CLASSES.emptyTitle}>
                      No completed tasks yet!
                   </h3>
                   <p className={CT_CLASSES.emptyText}>
                      Complete some tasks and they'll appear here
                   </p>
              </div>
             ) : (
                sortedCompletedTasks.map(task => (
                <TaskItem key={task._id || task.id} task={task} onRefresh={fetchTasks} showCompleteCheckbox={false} className='opacity-90 hover:opacity-100 transition-opacity text-sm md:text-base' />
              ))
             )}
        </div>
    </div>
  )
}

export default CompletePage