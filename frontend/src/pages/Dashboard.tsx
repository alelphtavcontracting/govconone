import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Opportunities', value: '12', icon: '🎯' },
    { label: 'Proposals in Progress', value: '3', icon: '📊' },
    { label: 'Active Contracts', value: '8', icon: '📋' },
    { label: 'Subcontractors', value: '24', icon: '🤝' }
  ];

  const recentActivity = [
    { action: 'New opportunity identified', time: '2 hours ago', type: 'opportunity' },
    { action: 'Proposal submitted for DOD-2024-001', time: '1 day ago', type: 'proposal' },
    { action: 'Subcontractor agreement signed', time: '2 days ago', type: 'contract' },
    { action: 'Capability statement updated', time: '3 days ago', type: 'document' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          Welcome back, {user?.name}! Here's your government contracting overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className="text-2xl mr-3">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className="text-sm text-secondary-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-secondary-900">{activity.action}</p>
                  <p className="text-xs text-secondary-500">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activity.type === 'opportunity' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'proposal' ? 'bg-green-100 text-green-800' :
                  activity.type === 'contract' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">AI Assistant Features</h2>
          <div className="space-y-3">
            <div className="p-3 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-primary-900">🎯 Opportunity Analysis</h3>
              <p className="text-sm text-primary-700 mt-1">AI-powered opportunity scoring and executive summaries</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">📝 Document Generation</h3>
              <p className="text-sm text-green-700 mt-1">Auto-generate proposals, SOWs, and capability statements</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900">🤝 Subcontractor Matching</h3>
              <p className="text-sm text-purple-700 mt-1">Intelligent matching and outreach automation</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-secondary-600">
              💡 Click the AI assistant button to get started with any of these features!
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary text-left p-4 h-auto">
            <div className="text-lg mb-2">📊</div>
            <div className="font-medium">Generate Capability Statement</div>
            <div className="text-sm opacity-90 mt-1">Create AI-powered capability statements</div>
          </button>
          <button className="btn-secondary text-left p-4 h-auto">
            <div className="text-lg mb-2">🎯</div>
            <div className="font-medium">Find Opportunities</div>
            <div className="text-sm opacity-90 mt-1">Search and analyze new opportunities</div>
          </button>
          <button className="btn-secondary text-left p-4 h-auto">
            <div className="text-lg mb-2">🤝</div>
            <div className="font-medium">Find Subcontractors</div>
            <div className="text-sm opacity-90 mt-1">AI-powered subcontractor matching</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
