'use client';
import { useEffect, useState } from 'react';

export default function SupplierProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch profile on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setMessage('You are not logged in');
      setLoading(false);
      return;
    }

    const { email, role } = JSON.parse(storedUser);
    if (!email || role !== 'supplier') {
      setMessage('You are not logged in');
      setLoading(false);
      return;
    }

    fetch(`/api/profile?role=${role}&email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(data.error);
        else {
          setProfile(data);
          setFormData(data);
        }
      })
      .catch(() => setMessage('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'supplier', email: formData.email }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(formData);
        setIsEditing(false);
        setMessage('Profile updated successfully ✅');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Update failed');
      }
    } catch {
      setMessage('Error updating profile');
    }
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading profile...</p>;
  if (message && !profile) return <p className="text-center text-red-500 mt-10">{message}</p>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-b-3xl shadow-md flex items-end p-8 z-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
          Supplier Dashboard
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 w-full mt-6 px-4 md:px-8">
        {/* Left Panel */}
        <div className="md:w-1/3 w-full bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center space-y-6">
          <div className="w-32 h-32 bg-gradient-to-tr from-purple-300 to-pink-200 rounded-full flex items-center justify-center text-5xl font-bold text-purple-700 shadow-inner">
            {profile?.company_name ? profile.company_name[0] : '-'}
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">{profile?.company_name || '-'}</h2>
          <p className="text-gray-600 text-center">{profile?.address || '-'}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
          >
            Edit Profile
          </button>
        </div>

        {/* Right Panel */}
        <div id="profile-form" className="md:w-2/3 w-full bg-white shadow-xl rounded-2xl p-8 flex flex-col space-y-6">
          {!isEditing ? (
            <div className="grid grid-cols-2 gap-6">
              {[
                ['Email', profile?.email],
                ['Phone', profile?.phone],
                ['GST Number', profile?.gst_number],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="font-semibold text-gray-700">{label}</span>
                  <span className="text-gray-600 mt-1">{value || '-'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['company_name', 'email', 'phone', 'address', 'gst_number'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="block text-gray-700 font-medium mb-2 capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleChange}
                    readOnly={field === 'email'}
                    placeholder={field !== 'email' ? '-' : ''}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 transition-all duration-300 hover:shadow-md ${
                      field === 'email' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                </div>
              ))}

              {/* Save / Cancel Buttons */}
              <div className="col-span-full flex justify-end gap-4 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-teal-500 hover:to-green-400 text-white px-6 py-3 rounded-lg font-medium shadow-md transform transition-all hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => { setIsEditing(false); setFormData(profile); }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 'use client';
// import { useEffect, useState } from 'react';

// export default function SupplierProfile() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({});

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (!storedUser) {
//       setMessage('You are not logged in');
//       setLoading(false);
//       return;
//     }

//     const { email, role } = JSON.parse(storedUser);
//     if (!email || role !== 'supplier') {
//       setMessage('You are not logged in');
//       setLoading(false);
//       return;
//     }

//     fetch(`/api/profile?role=${role}&email=${email}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.error) setMessage(data.error);
//         else {
//           setProfile(data);
//           setFormData(data);
//         }
//       })
//       .catch(() => setMessage('Failed to load profile'))
//       .finally(() => setLoading(false));
//   }, []);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSave = async () => {
//     try {
//       const res = await fetch('/api/profile', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...formData, role: 'supplier', email: formData.email }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setProfile(formData);
//         setIsEditing(false);
//         setMessage('Profile updated successfully ✅');
//         setTimeout(() => setMessage(''), 3000);
//       } else {
//         setMessage(data.error || 'Update failed');
//       }
//     } catch {
//       setMessage('Error updating profile');
//     }
//   };

//   if (loading) return <p className="text-center text-gray-600 mt-10">Loading profile...</p>;
//   if (message && !profile) return <p className="text-center text-red-500 mt-10">{message}</p>;

//   return (
// <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
//   {/* Header */}
// <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-b-3xl shadow-md flex items-end p-8 z-10">
//   <h1 className="text-4xl font-bold text-white drop-shadow-lg">
//     Supplier Dashboard
//   </h1>
// </div>


//   {/* Main Content */}
//   <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 justify-center pt-12 px-6">
//     {/* Left Panel */}
//     <div className="md:w-1/3 bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center space-y-6">
//       <div className="w-32 h-32 bg-gradient-to-tr from-purple-300 to-pink-200 rounded-full flex items-center justify-center text-5xl font-bold text-purple-700 shadow-inner">
//         {profile?.company_name ? profile.company_name[0] : '-'}
//       </div>
//       <h2 className="text-2xl font-semibold text-gray-800">{profile?.company_name || '-'}</h2>
//       <p className="text-gray-600 text-center">{profile?.address || '-'}</p>
//       <button
//         onClick={() => setIsEditing(true)}
//         className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
//       >
//         Edit Profile
//       </button>
//     </div>

//     {/* Right Panel */}
//     <div className="md:w-2/3 bg-white shadow-xl rounded-2xl p-8 flex flex-col space-y-6">
//       {!isEditing ? (
//         <div className="grid grid-cols-2 gap-6">
//           {[
//             ['Email', profile?.email],
//             ['Phone', profile?.phone],
//             ['GST Number', profile?.gst_number],
//           ].map(([label, value]) => (
//             <div key={label} className="flex flex-col">
//               <span className="font-semibold text-gray-700">{label}</span>
//               <span className="text-gray-600 mt-1">{value || '-'}</span>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {['company_name', 'email', 'phone', 'address', 'gst_number'].map((field) => (
//                 <div key={field} className="flex flex-col">
//                   <label className="block text-gray-700 font-medium mb-2 capitalize">
//                     {field.replace('_', ' ')}
//                   </label>
//                   <input
//                     name={field}
//                     value={formData[field] || ''}
//                     onChange={handleChange}
//                     readOnly={field === 'email'}
//                     placeholder={field !== 'email' ? '-' : ''}
//                     className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 transition-all duration-300 hover:shadow-md ${
//                       field === 'email' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
//                     }`}
//                   />
//                 </div>
//               ))}

//               <div className="col-span-full flex justify-end gap-4 mt-4">
//                 <button
//                   onClick={handleSave}
//                   className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-teal-500 hover:to-green-400 text-white px-6 py-3 rounded-lg font-medium shadow-md transform transition-all hover:scale-105"
//                 >
//                   Save Changes
//                 </button>
//                 <button
//                   onClick={() => { setIsEditing(false); setFormData(profile); }}
//                   className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:scale-105"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
