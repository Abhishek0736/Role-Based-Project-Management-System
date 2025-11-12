import React, { useState, useEffect } from 'react'
import { MENU_OPTIONS, TI_CLASSES, getPriorityBadgeColor, getPriorityColor } from '../assets/dummy'
import { Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react'
import axios from 'axios'
import {format, isToday} from 'date-fns'
import TaskModal from './TaskModal';


const API_BASE = 'http://localhost:3000/api/tasks'


const TaskItem = ({ task, onRefresh, onLogout, showCompleteCheckbox = true }) => {
  const [userRole] = useState(localStorage.getItem('userRole') || 'employee');
  const [userId] = useState(localStorage.getItem('userId'));
  const [showMenu, setShowMenu] = useState(false)
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, 'yes'].includes(
      typeof task.completed === 'string'
        ? task.completed.toLowerCase()
        : task.completed
    ))

  const [showEditModal, setShowEditModal] = useState(false)
  const [subTasks, setSubTasks] = useState(task.subTasks || [])

  useEffect(() => {
    setSubTasks(
      [true, 1, 'yes'].includes(
        typeof task.completed === 'string'
          ? task.completed.toLowerCase()
          : task.completed
      )
    )
  }, [task.completed])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    return {
        Authorization: `Bearer ${token}`
      }
  }
  
  const borderColor = isCompleted ? 'border-green-500' : getPriorityColor(task.priority).split(" ")[0]

  const handleComplete = async () => {
    const newStatus = isCompleted ? 'todo' : 'done'
    try {
        await axios.put(
        `${API_BASE}/${task._id}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      )
      setIsCompleted(!isCompleted)
      onRefresh?.()
    } catch (error) {
      console.error('Error completing task:', error)
      alert('Failed to update task status');
      if (error.response?.status === 401) {
        onLogout?.()
      }
    }
  }


  const handleAction = (action) => {
    setShowMenu(false)
    if (action === 'edit') 
      setShowEditModal(true) 
    if (action === 'delete') 
      handleDelete()
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, { headers: getAuthHeaders() })
      onRefresh?.()
    } catch (error) {
      if (error.response?.status === 401) {
        onLogout?.()
      }
    }
  }

  const handleSave = async (updatedTask) => {
    try {
      const payload = (({ title, description, priority, dueDate, completed }) =>
        ({ title, description, priority, dueDate, completed }))(updatedTask)
      await axios.put(`${API_BASE}/${task._id}/gp`, payload,
      { headers: getAuthHeaders() })
      setShowEditModal(false)
      onRefresh?.()
    } catch (error) {
      if (error.response?.status === 401) {
        onLogout?.()
      }
    }
  }
    
  const progress = subTasks.length ? (subTasks.filter((subTask) => subTask.completed).length / subTasks.length) * 100 : 0

  return (
    <>
     <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
         <div className={TI_CLASSES.leftContainer}>
             {showCompleteCheckbox && (
              <button onClick={handleComplete} className={`${TI_CLASSES.completeButton} ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
                     <CheckCircle2 size={18} className={`${TI_CLASSES.checkboxIconBase} ${isCompleted ? 'fill-green-500' : ''}`} />
              </button>
             )}

             <div className='flex-1 min-w-0'>
                 <div className='flex items-baseline gap-2 mb-1 flex-wrap'>
                     <h3 className={`${TI_CLASSES.titleBase} ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                     </h3> 
                     <span className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                     </span>
                 </div>
                 {task.description && <p className={TI_CLASSES.description}>
                      {task.description} </p>}
             </div>
         </div>

         <div className={TI_CLASSES.rightContainer}>
             <div className='relative'>
                 <button onClick={() => setShowMenu(!showMenu)} className={TI_CLASSES.menuButton}>
                     <MoreVertical className='w-4 h-4 sm:w-5 sm:h-5' size={18} />
                  </button>

                  {showMenu && (
                    <div className={TI_CLASSES.menuDropdown}>
                        {MENU_OPTIONS.filter(opt => {
                          // Employees can only edit/delete their own tasks or tasks assigned to them
                          if (userRole === 'employee') {
                            const isOwner = task.owner === userId;
                            const isAssigned = task.assignedTo?.includes(userId);
                            return (isOwner || isAssigned);
                          }
                          return true; // Admins and managers can edit all tasks
                        }).map(opt => (
                          <button key={opt.action} onClick={() => handleAction(opt.action)} className='w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors duration-200'>
                            {opt.icon} {opt.label}
                          </button>
                        ))}   
             </div>
                  )}
         </div>

         <div>
          <div className={`${TI_CLASSES.dateRow} ${task.dueDate && isToday(new Date(task.dueDate)) ? 'text-fuchsia-600' : 'text-gray-500'}`}>
               <Calendar className='w-3.5 h-3.5' />
               {task.dueDate ? (isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM dd')) : '-'} 
          </div>

          <div className={TI_CLASSES.createdRow}>
               <Clock className='w-3.5 h-3.5 sm:h-3.5' />
               {task.createAt ? `Created ${format(new Date(task.createAt), 'MMM dd')}` : 'No date'}
          </div>
         </div>
      </div>  
      </div>  
      <TaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} taskToEdit={task} onSave={handleSave} />
    </>

  )
}

export default TaskItem
