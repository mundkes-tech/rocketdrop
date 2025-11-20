'use client';
import { useEffect, useState, useCallback } from 'react';
// Importing components and hooks used in the original component
import { Pencil, Check, X, LogOut, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🚨 PLACEHOLDER DEPENDENCIES (Replace with your actual project imports)
// 1. Placeholder for your Button component
const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, ...props }) => {
    let baseStyles = 'px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2';
    let variantStyles;

    if (variant === 'outline') {
        variantStyles = 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 shadow-md';
    } else if (variant === 'danger') {
        variantStyles = 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/50';
    } else {
        // Default (primary) - High-conversion gradient
        variantStyles = 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500 shadow-blue-500/50';
    }
    
    if (disabled) {
        variantStyles = 'bg-gray-500 text-gray-300 cursor-not-allowed shadow-none';
    }

    return (
        <motion.button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles} ${className}`}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            {...props}
        >
            {children}
        </motion.button>
    );
};

// 2. Placeholder for useRouter (replaces 'next/navigation')
const useRouter = () => ({
    replace: (path) => {
        console.log(`Simulating router.replace(${path})`);
    },
});
// 🚨 END PLACEHOLDER DEPENDENCIES

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { 
            delayChildren: 0.1, 
            staggerChildren: 0.1 
        } 
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
};

const inputTransition = { duration: 0.3, ease: "easeInOut" };

// --- MAIN COMPONENT ---
export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    // Form state now only holds profile fields, no password-related fields
    const [form, setForm] = useState({}); 
    const [message, setMessage] = useState({ text: '', type: '' });
    const router = useRouter();

    // ✅ Fetch user profile on mount (Original Logic Preserved)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            setMessage({ text: 'Not logged in', type: 'error' });
            setLoading(false);
            return;
        }

        const { email, role } = JSON.parse(storedUser);
        if (!email || role !== 'user') {
            setMessage({ text: 'Not logged in', type: 'error' });
            setLoading(false);
            return;
        }

        async function fetchProfile() {
            try {
                const res = await fetch(`/api/profile?role=${role}&email=${email}`);
                const data = await res.json();

                if (!res.ok || !data.success)
                    throw new Error(data.message || 'Failed to fetch profile');

                const userProfile = data.data?.profile || {};
                setProfile(userProfile);
                
                // Initialize form with profile data
                setForm(userProfile); 

                setMessage({ text: '', type: '' });
            } catch (err) {
                console.error(err);
                setMessage({ text: err.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    // ✅ Form handling
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ Submit updates (Simplified Logic - only profile fields)
    const handleSubmit = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const { email, role } = JSON.parse(storedUser);

        // Client-side validation for required profile fields
        if (!form.name || !form.phone) {
             setMessage({ text: 'Name and Phone are required fields.', type: 'error' });
             return;
        }

        setMessage({ text: 'Saving changes...', type: 'info' });
        
        // Payload only contains name, phone, address, email, and role
        const payload = { ...form, email, role };

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || 'Failed to update profile.');
            
            // Success: Update profile state
            const updatedProfile = data.data?.updatedProfile || form;
            setProfile(updatedProfile);
            setEditing(false);
            setForm(updatedProfile); // Reset form to latest profile data

            setMessage({ text: 'Profile updated successfully! 🎉', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error(err);
            setMessage({ text: err.message, type: 'error' });
        }
    };

    // ✅ Logout (Original Logic Preserved)
    const handleLogout = () => {
        localStorage.clear();
        setProfile(null);
        router.replace('/login');
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#070E20]">
                <div className="flex flex-col items-center text-blue-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-3" />
                    <p className="text-lg text-gray-400">Loading secure profile data...</p>
                </div>
            </div>
        );
    }

    // --- Error/Not Logged In State ---
    if (message.text && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#070E20] px-6">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-red-900/40 p-10 rounded-2xl border border-red-700 shadow-2xl max-w-md w-full"
                >
                    <p className="text-xl font-semibold text-red-300">Authentication Required</p>
                    <p className="text-red-400 mt-2">{message.text}</p>
                    <Button onClick={() => router.replace('/login')} className="mt-6 bg-red-600 hover:bg-red-700 shadow-red-500/50">
                        <LogOut size={18} /> Go to Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    // --- MAIN UI RENDER ---
    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="min-h-screen w-full bg-[#070E20] text-white relative overflow-hidden pb-16"
        >
            {/* Background Grid and Blur Effect */}
            <div className="absolute inset-0 bg-repeat opacity-5" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34L30 28l-6 6-6-6-6 6 12 12 12-12zm-12 8L18 36l-6 6 12 12 12-12-6-6zm24 0l-6 6-6-6 12-12 12 12 6 6-12 12-6-6zm-12 0l-6 6-6-6 12-12 12 12z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px] mix-blend-screen opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
            </div>


            {/* Header with Greeting */}
            <header className="relative w-full py-20 bg-gray-900/50 backdrop-blur-sm shadow-2xl border-b border-gray-700 z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-200">
                            Dashboard
                        </span> / Profile
                    </h1>
                    <p className="text-xl text-gray-400 mt-2">Manage and update your personal account information.</p>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 px-6 relative z-20">
                
                {/* Left Column: Avatar and Actions (1/3) */}
                <motion.div
                    className="md:col-span-1 flex flex-col items-center space-y-6 bg-gray-800/70 p-8 rounded-3xl shadow-2xl border border-gray-700/50 h-fit"
                    variants={itemVariants}
                >
                    {/* Avatar */}
                    <motion.div 
                        className="w-40 h-40 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-8xl font-bold text-white shadow-2xl border-4 border-gray-700"
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        aria-label="User Avatar"
                    >
                        {profile.name ? profile.name[0].toUpperCase() : <User size={64} />}
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold text-white mt-4 text-center">{profile.name || 'User'}</h2>
                    <p className="text-gray-400 text-center">{profile.email || '-'}</p>
                    <p className="text-sm text-gray-500">Account Type: <span className="capitalize">{profile.role || 'Guest'}</span></p>

                    <div className="w-full pt-4 space-y-3">
                        {/* Primary Action Button - Conditional */}
                        <AnimatePresence mode="wait">
                            {!editing && (
                                <motion.div key="edit-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Button
                                        onClick={() => { setEditing(true); setMessage({ text: '', type: '' }); }}
                                        className="w-full text-lg shadow-xl"
                                    >
                                        <Pencil size={18} /> Edit Profile
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Logout Button */}
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full text-lg border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:border-red-500"
                        >
                            <LogOut size={18} /> Secure Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Right Column: Profile Details / Edit Form (2/3) */}
                <motion.div
                    className="md:col-span-2 bg-gray-800/70 p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-700/50"
                    variants={itemVariants}
                >
                    <h2 className="text-3xl font-extrabold text-blue-300 mb-8 border-b border-gray-700 pb-3">
                        {editing ? 'Update Account Details' : 'View Account Details'}
                    </h2>
                    
                    {/* Feedback Message */}
                    <AnimatePresence>
                        {message.text && (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={inputTransition}
                                className={`p-3 mb-6 rounded-xl font-medium text-sm sm:text-base ${
                                    message.type === 'success' ? 'bg-green-600/30 text-green-300 border border-green-500' :
                                    message.type === 'error' ? 'bg-red-600/30 text-red-300 border border-red-500' :
                                    'bg-blue-600/30 text-blue-300 border border-blue-500'
                                }`}
                                role="alert"
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {editing ? (
                            /* Edit Form */
                            <motion.div 
                                key="edit-form"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6"
                            >
                                {/* Only fields relevant for profile updates (no password) */}
                                {['name', 'phone', 'address', 'city', 'state'].map((field) => (
                                <div key={field} className="flex flex-col">
                                    <label className="text-gray-400 font-medium mb-2 capitalize">{field}</label>
                                    <input
                                    type="text"
                                    name={field}
                                    value={form[field] || ""}
                                    onChange={handleChange}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    />
                                </div>
                                ))}    
                                <div className="flex flex-col">
                                    <label className="text-gray-400 font-medium mb-2 text-sm">Gender</label>

                                    <div className="flex gap-6">
                                        {['male', 'female', 'other'].map((g) => (
                                        <label key={g} className="flex items-center gap-2">
                                            <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={form.gender === g}
                                            onChange={handleChange}
                                            className="w-4 h-4"
                                            />
                                            <span className="capitalize text-white">{g}</span>
                                        </label>
                                        ))}
                                    </div>
                                    </div>                         
                                {/* Form Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button className="text-lg" onClick={handleSubmit}>
                                        <Check size={18} /> Save Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-lg border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:border-red-500"
                                        onClick={() => {
                                            setEditing(false);
                                            setForm(profile); // Revert form to current profile state
                                            setMessage({ text: '', type: '' });
                                        }}
                                    >
                                        <X size={18} /> Cancel
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            /* View Details */
                            <motion.div
                                key="view-details"
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6"
                            >
                            {['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Gender'].map((label, index) => (
                                <motion.div 
                                    key={label} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="flex flex-col sm:flex-row justify-between pb-3 border-b border-gray-700/50"
                                >
                                    <span className="font-semibold text-gray-400 text-lg">{label}:</span>
                                    <span className="text-white font-medium text-lg capitalize mt-1 sm:mt-0">
                                        {profile[label.toLowerCase()] || 'N/A'}
                                    </span>
                                </motion.div>
                            ))}
                                 <div className="flex justify-start md:justify-end gap-4 mt-8 pt-4 border-t border-gray-700/50">
                                    {/* Edit Button moved here for clarity in view mode */}
                                    <Button className="flex items-center gap-2" onClick={() => setEditing(true)}>
                                        <Pencil size={18} /> Edit Profile
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        variant="danger"
                                        className="text-lg shadow-red-500/50"
                                    >
                                        <LogOut size={18} /> Logout
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
