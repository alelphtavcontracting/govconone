import React from 'react';
import { useAI } from '../contexts/AIContext';

const Sidebar: React.FC = () => {
  const { setCurrentModule } = useAI();

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'opportunities', name: 'Opportunities', icon: '🎯' },
    { id: 'contracts', name: 'Contracts', icon: '📋' },
    { id: 'crm', name: 'CRM', icon: '👥' },
    { id: 'subcontractors', name: 'Subcontractors', icon: '🤝' },
    { id: 'sow', name: 'SOW Repurposer', icon: '📝' },
    { id: 'capabilities', name: 'Capabilities', icon: '⭐' },
    { id: 'agreements', name: 'Agreements', icon: '📄' },
    { id: 'pricing', name: 'Pricing Intel', icon: '💰' },
    { id: 'proposals', name: 'Proposals', icon: '📊' }
  ];

  return (
    <div className="bg-white w-64 shadow-sm border-r border-secondary-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-600">GovConOne</h1>
        <p className="text-sm text-secondary-500 mt-1">AI-Powered Platform</p>
      </div>
      
      <nav className="mt-6">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => setCurrentModule(module.id)}
            className="w-full flex items-center px-6 py-3 text-left text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors duration-200"
          >
            <span className="mr-3">{module.icon}</span>
            {module.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
