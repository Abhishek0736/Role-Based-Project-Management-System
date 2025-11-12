import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { INPUT_WRAPPER, BACK_BUTTON, FULL_BUTTON, SECTION_WRAPPER, personalFields, DANGER_BTN, securityFields } from '../assets/dummy'
import { ChevronLeft, UserCircle, Save, Shield, LogOut, Lock } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:3000'

const Profile = ({setCurrentUser, onLogout }) => {

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: ''
    })
    const [userRole] = useState(localStorage.getItem('userRole') || 'employee'); 
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        // if there's no token, don't try to load profile
        if (!token) return

        axios
            .get(`${API_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(({ data }) => {
                    if (data.success)
                        setProfile({name: data.user.name, email: data.user.email, role: data.user.role})
                    else toast.error(data.message)
            })
            .catch((error) => toast.error("Unable to Load Profile."))
        }, [])
        
        const saveProfile = async (e) => {
            e.preventDefault()
            try {
                const token = localStorage.getItem('token')
                const { data } = await axios.put(`${API_URL}/api/user/profile`, { name : profile.name, email: profile.email}, { headers: { Authorization: `Bearer ${token}` } }
                )
                    if (data.success) {
                        setCurrentUser((prev) => ({
                            ...prev, name: profile.name, 
                            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
                        }))
                        toast.success("Profile Updated Successfully.")
                    }else toast.error(data.message)
                
            } catch (error) {
                 toast.error(error.response?.data?.message || "Profile update failed")
            }
            
        
        }
    
        const changePassword = async (e) => {
            e.preventDefault()
            if (passwords.newPassword !== passwords.confirmPassword) {
                return toast.error("New Passwords do not match.")
            }
            try {
                const token = localStorage.getItem('token')
                const { data } = await axios.put(`${API_URL}/api/user/password`, { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }, { headers: { Authorization: `Bearer ${token}` } })
                if (data.success) {
                    toast.success("Password Changed Successfully.")
                    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
                } else toast.error(data.message)
            } catch (error) {
                toast.error(error.response?.data?.message || "Password change failed.")
            }
        }

  return (
<div className='min-h-screen bg-gray-50'>
     <ToastContainer position='top-center' autoClose={3000}/>
     <div className='max-w-4xl mx-auto p-6'>
        <button onClick={() => navigate("/admin")} className={BACK_BUTTON}>
            <ChevronLeft className='w-5 h-5' /> Back to Dashboard
        </button>

        <div className='flex items-center gap-4 mb-8'>
             <div className='w-16 h-16 rounded-full bg-gradient-to-br from fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md'>
                {profile.name ? profile.name[0].toUpperCase() : 'U'}
             </div>
             <div>
                <div className='flex items-center gap-3'>
                  <h1 className='text-2xl font-bold text-gray-800'>Account Settings</h1>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    userRole === 'admin' ? 'bg-red-100 text-red-800' :
                    userRole === 'manager' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {userRole.toUpperCase()}
                  </span>
                </div>
                <p className='text-sm text-gray-500 flex items-center gap-1'>
                    Manage your profile and security settings
                </p>
             </div>
        </div>
        <div className='grid md:grid-cols-2 gap-8'>
             <section className={SECTION_WRAPPER}>
                    <div className='flex items-center gap-2 mb-6'>
                        <UserCircle className='text-purple-500 w-5 h-5'/>
                        <h2 className='text-xl font-semibold text-gray-800'>Personal Information</h2>
                    </div>

                    {/* Personal Information */}
                    <form onSubmit={saveProfile} className='space-y-4'>
                          {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                            <div key={name} className={INPUT_WRAPPER}>
                                <Icon className='w-5 h-5 text-purple-500 mr-2' />
                                <input
                                    type={type}
                                    name={name}
                                    placeholder={placeholder}
                                    value={profile[name]}
                                    onChange={(e) => setProfile({...profile, [name]: e.target.value})}
                                    className='w-full focus:outline-none text-sm' required />
                            </div>
                          ))}
                          <button className={FULL_BUTTON}>
                              <Save className='w-5 h-5' /> Save Changes
                          </button>
                    </form>
             </section>
             <section className={SECTION_WRAPPER}>
                     <div className='flex items-center gap-2 mb-6'>
                        <Shield className='text-purple-500 w-5 h-5'/>
                        <h2 className='text-xl font-semibold text-gray-800'>Security</h2>
                    </div>

                    {/* Password */}
                    <form onSubmit={changePassword} className='space-y-4'>
                          {securityFields.map(({ name, placeholder }) => (
                            <div key={name} className={INPUT_WRAPPER}>
                                <Lock className='w-5 h-5 text-purple-500 mr-2' />
                                <input
                                    type="password"
                                    name={name}
                                    placeholder={placeholder}
                                    value={passwords[name]}
                                    onChange={(e) => setPasswords({...passwords, [name]: e.target.value})}
                                    className='w-full focus:outline-none text-sm' required />
                            </div>
                          ))}
                          <button className={FULL_BUTTON}>
                              <Shield className='w-5 h-5' /> Change Password
                          </button>

                          <div className='mt-8 pt-6 border-t border-purple-100'>
                            <h3 className='text-red-600 font-semibold mb-4 flex items-center gap-2'>
                                <LogOut className='w-4 h-4' /> Danger Zone
                            </h3>
                              <button onClick={onLogout} className={DANGER_BTN}>
                                  Logout
                              </button>
                          </div>
                    </form>
             </section>
        </div>
     </div>
</div>
  )
}

export default Profile
