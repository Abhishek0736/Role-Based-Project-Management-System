import React, { useEffect, useState } from 'react'
import { LogIn, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import {toast, ToastContainer} from 'react-toastify'
import { BUTTON_CLASSES, Inputwrapper} from '../assets/dummy'
import {useNavigate} from 'react-router-dom'
import api from '../config/api.js'


const INITIAL_FORM = { email: "", password: "" }

const Login = ({onSubmit, onSwitchMode}) => {

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
 const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()


  const handleSwitchMode = () => {
    toast.dismiss()
    onSwitchMode()
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (token) {
      (async () => {
        try {
          const { data } = await api.get('/api/user/me')
          if (data.success){
          localStorage.setItem('userRole', data.user.role);
          onSubmit?.({ token, userId, role: data.user.role, ...data.user })
          toast.success("Session restored. Redirecting...")
          setTimeout(() => {
            if (data.user.role === 'admin') {
              navigate('/admin')
            } else {
              navigate('/')
            }
          }, 500)
          }
          else {
            localStorage.clear()
          }
        }
        catch {
          localStorage.clear()
        }
      })()
    }
  }, [navigate, onSubmit])



  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const {data} = await api.post('/api/auth/login', formData)
      if (!data.success && !data.accessToken) throw new Error(data.message || "Login failed")

        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('userRole', data.user.role)
        setFormData(INITIAL_FORM)
        onSubmit?.({ 
          token: data.accessToken || data.token, 
          userId: data.user.id, 
          role: data.user.role, 
          ...data.user 
        })
        toast.success(`Login successful as ${data.user.role.toUpperCase()}`)
        
        // Navigate based on role immediately
        if (data.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
    } 
    catch (error) {
      const msg = error.response?.data?.message || error.message
      toast.error(msg)
    }
    finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      icon: Mail,
      isPassword: false
    },
    {
      name: 'password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Password',
      icon: Lock,
      isPassword: true
    }
  ]

  return (

      <div className='w-96 h-auto bg-white rounded-xl shadow-xl border border-gray-200 p-8'>
         <ToastContainer position='top-center' autoClose={3000} hideProgressBar/>

         <div className='mb-8 text-center'>
             <div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
               <LogIn className="w-8 h-8 text-white"/>
             </div>
             <h1 className='text-3xl font-bold text-gray-800 mb-2'>PMS Login</h1>
             <p className='text-gray-500'>Project Management System</p>
         </div>

         <form onSubmit={handleSubmit} className='space-y-5'>
        {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
        <div key={name} className='relative'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>{placeholder}</label>
          <div className='relative'>
            <Icon className='absolute left-3 top-3 w-5 h-5 text-gray-400'/>
            <input
              id={name}
              name={name}
              type={type}
              placeholder={`Enter your ${placeholder.toLowerCase()}`}
              value={formData[name]}
              onChange={(e) => {
                setFormData({...formData, [name]: e.target.value})
              }}
              className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
            {isPassword && (
              <button type='button' onClick={() => setShowPassword((prev) => !prev)} className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'>
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            )}
          </div>
        </div>  
        ))}

        <div className='flex items-center justify-between'>
          <label className='flex items-center'>
            <input type='checkbox' checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className='h-4 w-4 text-blue-600 rounded'/>
            <span className='ml-2 text-sm text-gray-600'>Remember me</span>
          </label>
          <button type='button' className='text-sm text-blue-600 hover:text-blue-800'>Forgot password?</button>
        </div>

        <button type='submit' className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium' disabled={loading}>
          {loading ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Signing in...
            </div>
          ) : 'Sign In'}
        </button>
         </form>
        
          <div className='text-center mt-6 pt-6 border-t border-gray-200'>
            <p className='text-gray-600 text-sm'>Don't have an account? 
              <button type='button' onClick={handleSwitchMode} className='text-blue-600 hover:text-blue-800 font-medium ml-1'>
                Create Account
              </button>
            </p>
          </div>
      </div>
  )
}

export default Login
