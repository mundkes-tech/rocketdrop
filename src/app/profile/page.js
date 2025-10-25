'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Pencil, Check, X } from 'lucide-react';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setMessage('Not logged in');
      setLoading(false);
      return;
    }

    const { email, role } = JSON.parse(storedUser);
    if (!email || role !== 'user') {
      setMessage('Not logged in');
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?role=${role}&email=${email}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setForm(data);
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const storedUser = localStorage.getItem('user');
    const { email, role } = JSON.parse(storedUser);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setProfile(form);
      setEditing(false);
      setMessage('Profile updated successfully ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading profile...</p>;
  if (message && !profile) return <p className="text-center text-red-500 mt-10">{message}</p>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-b-3xl shadow-lg flex items-end p-8 z-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
          Welcome, {profile.name || 'User'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-10 px-4 md:px-0">
        {/* Left Panel */}
        <div className="md:w-1/3 flex flex-col items-center space-y-6">
          <div className="w-36 h-36 bg-gradient-to-tr from-purple-300 to-pink-200 rounded-full flex items-center justify-center text-6xl font-bold text-purple-700 shadow-lg">
            {profile.name ? profile.name[0] : '-'}
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">{profile.name || '-'}</h2>
          <p className="text-gray-600 text-center">{profile.address || '-'}</p>
          {!editing && (
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center gap-2">
              <Pencil size={18} /> Edit Profile
            </Button>
          )}
        </div>

        {/* Right Panel */}
        <div className="md:w-2/3 bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
          {editing ? (
            <>
              {['name', 'phone', 'address', 'password'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'password' ? 'password' : 'text'}
                    name={field}
                    value={form[field] || ''}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 hover:shadow-md transition-all"
                    placeholder={field !== 'password' ? '-' : 'Leave blank to keep'}
                  />
                </div>
              ))}
              <div className="flex gap-4 mt-4">
                <Button className="flex items-center gap-2" onClick={handleSubmit}>
                  <Check size={18} /> Save
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => { setEditing(false); setForm(profile); }}
                >
                  <X size={18} /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {['Name', 'Email', 'Phone', 'Address'].map((label) => (
                <div key={label} className="flex justify-between border-b py-2">
                  <span className="font-semibold text-gray-700">{label}:</span>
                  <span className="text-gray-600">{profile[label.toLowerCase()] || '-'}</span>
                </div>
              ))}
              <div className="flex gap-4 mt-6">
                <Button className="flex items-center gap-2" onClick={() => setEditing(true)}>
                  <Pencil size={18} /> Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { localStorage.clear(); location.reload(); }}
                >
                  Logout
                </Button>
              </div>
            </>
          )}
          {message && <p className="text-green-500 mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
}
