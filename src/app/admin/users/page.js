'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, MapPin, Calendar, AlertCircle } from 'lucide-react';

const fetcher = (url) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function UsersPage() {
  const { data, error, isLoading } = useSWR('/api/admin/users', fetcher);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    if (data?.users) {
      const users = data.users;
      const totalUsers = users.length;
      const activeUsers = users.filter(user => {
        const created = new Date(user.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length;

      const genderData = users.reduce((acc, user) => {
        acc[user.gender || 'other'] = (acc[user.gender || 'other'] || 0) + 1;
        return acc;
      }, {});

      const stateData = users.reduce((acc, user) => {
        acc[user.state || 'Unknown'] = (acc[user.state || 'Unknown'] || 0) + 1;
        return acc;
      }, {});

      setAnalytics({
        totalUsers,
        activeUsers,
        genderData: Object.entries(genderData).map(([name, value]) => ({ name, value })),
        stateData: Object.entries(stateData).map(([name, value]) => ({ name, value })).slice(0, 10) // top 10
      });
    }
  }, [data]);

  if (error) return (
    <div className="w-full p-6">
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Failed to load user analytics</p>
      </div>
    </div>
  );
  if (isLoading) return (
    <div className="w-full p-6">
      <div className="text-center py-12">
        <div className="text-white">Loading user analytics...</div>
      </div>
    </div>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full max-w-none">
      {/* Page Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">User Analytics</h1>
          <p className="text-gray-400 text-lg">Insights into your user base and demographics</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Total Users</p>
              <p className="text-white text-2xl font-bold">{analytics.totalUsers || 0}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Active Users (30 days)</p>
              <p className="text-white text-2xl font-bold">{analytics.activeUsers || 0}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">States Covered</p>
              <p className="text-white text-2xl font-bold">{analytics.stateData?.length || 0}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Avg. Registration</p>
              <p className="text-white text-2xl font-bold">Monthly</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          {/* Gender Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Users by Gender</h3>
              <p className="text-gray-400 text-sm">Gender distribution of registered users</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.genderData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {analytics.genderData?.slice(0, 3).map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-300">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* State Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Geographic Distribution</h3>
              <p className="text-gray-400 text-sm">Top 10 states by user count</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.stateData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Directory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-2">User Directory</h3>
            <p className="text-gray-400 text-sm">Complete list of registered users and their information</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {data.users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="hover:bg-gray-700/20 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.city && user.state ? `${user.city}, ${user.state}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 capitalize">{user.gender || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
