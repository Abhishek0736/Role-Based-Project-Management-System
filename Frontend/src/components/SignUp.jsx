import { UserPlus } from 'lucide-react'
import React, { useState } from 'react'
import {BUTTONCLASSES, FIELDS, Inputwrapper, MESSAGE_ERROR, MESSAGE_SUCCESS} from '../assets/dummy'
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
const INITIAL_FORM = {
  name: "",
  email: "",
  password: ""
}

const SignUp = ({ onSwitchMode }) => {
   const [userRole] = useState(localStorage.getItem('userRole'));
   
   // Block non-admin users from accessing signup
   React.useEffect(() => {
     if (userRole && userRole !== 'admin') {
       alert('Access Denied: Only administrators can create new accounts');
       onSwitchMode(); // Redirect to login
       return;
     }
   }, [userRole, onSwitchMode]);

   const [formData, setFormData] = useState(INITIAL_FORM);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState({text: "", type: ""});

   const handleSubmit = async (e) => {
     e.preventDefault()
     setLoading(true)
     setMessage({ text: "", type: "" })

     try {
          const {data} = await axios.post(`${API_URL}/api/auth/register`, formData)
          console.log("Signup Successfully", data)
          setMessage({text : "Registration successful! You can now login.", type: "success"})
          setFormData(INITIAL_FORM)
     } 
     catch (error) {
        console.error("Signup error:", error)
        setMessage({text : error.response?.data?.message || "An error occoured. Please try again.", type: "error"})  
     }
     finally {
          setLoading(false)
     }
   }

  return (

      <div className='w-96 h-auto bg-white rounded-xl shadow-xl border border-gray-200 p-8'>
          <div className='mb-8 text-center'>
               <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                 <UserPlus className='w-8 h-8 text-white' />
               </div>
               <h1 className='text-3xl font-bold text-gray-800 mb-2'>Join PMS</h1>
               <p className='text-gray-500'>Create your account</p>
          </div>

          {message.text && (
               <div className={message.type === 'success' ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
                    {message.text}
               </div>
          )}

          
          <form onSubmit={handleSubmit} className='space-y-5'>
               {FIELDS.map(({ name, type, placeholder, icon: Icon }) => (
                    <div key={name} className='space-y-2'>
                         <label className='block text-sm font-medium text-gray-700'>{placeholder}</label>
                         <div className='relative'>
                           <Icon className='absolute left-3 top-3 w-5 h-5 text-gray-400'/>
                           <input
                                id={name}
                                name={name}
                                type={type}
                                placeholder={`Enter your ${placeholder.toLowerCase()}`}
                                value={formData[name]}
                                onChange={(e) => {
                                     setFormData({...formData, [name]: e.target.value })
                                }}
                                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                                required
                           />
                         </div>
                    </div>
               ))}

               <button type='submit' className='w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium' disabled={loading}>
                       {loading ? (
                         <div className='flex items-center justify-center'>
                           <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                           Creating Account...
                         </div>
                       ) : 'Create Account'}
               </button>
          </form>

          <div className='text-center mt-6 pt-6 border-t border-gray-200'>
             <p className='text-gray-600 text-sm'>Already have an account? 
               <button onClick={onSwitchMode} className='text-green-600 hover:text-green-800 font-medium ml-1'>
                       Sign In
               </button>
             </p>
          </div>
      </div>
  )
}

export default SignUp
