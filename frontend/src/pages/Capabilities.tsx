import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';

interface CompanyProfile {
  name: string;
  description: string;
  yearsInBusiness: number;
  employeeCount: string;
  location: string;
  certifications: string[];
  coreCompetencies: string[];
}

interface CapabilityStatement {
  content: string;
  generatedAt: string;
}

const Capabilities: React.FC = () => {
  const { generateCapabilityStatement, optimizeContent } = useAI();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    description: '',
    yearsInBusiness: 0,
    employeeCount: '',
    location: '',
    certifications: [],
    coreCompetencies: []
  });
  const [naicsCodes, setNaicsCodes] = useState<string[]>(['']);
  const [templateType, setTemplateType] = useState('standard');
  const [capabilityStatement, setCapabilityStatement] = useState<CapabilityStatement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleInputChange = (field: keyof CompanyProfile, value: any) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

<<<<<<< HEAD
=======
  // These functions are kept for future use
  /*
  const handleArrayInputChange = (field: 'certifications' | 'coreCompetencies', index: number, value: string) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'certifications' | 'coreCompetencies') => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'certifications' | 'coreCompetencies', index: number) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  */
>>>>>>> fix-main

  const handleNaicsChange = (index: number, value: string) => {
    setNaicsCodes(prev => prev.map((code, i) => i === index ? value : code));
  };

  const addNaicsCode = () => {
    setNaicsCodes(prev => [...prev, '']);
  };

  const removeNaicsCode = (index: number) => {
    setNaicsCodes(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCapabilityStatement(
        companyProfile,
        naicsCodes.filter(code => code.trim()),
        templateType
      );
      setCapabilityStatement(result);
    } catch (error) {
      console.error('Error generating capability statement:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (!capabilityStatement) return;
    
    setIsOptimizing(true);
    try {
      const optimized = await optimizeContent(capabilityStatement.content, 'government');
      setCapabilityStatement(prev => prev ? {
        ...prev,
        content: optimized,
        generatedAt: new Date().toISOString()
      } : null);
    } catch (error) {
      console.error('Error optimizing content:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Capabilities Statement Generator</h1>
        <p className="text-gray-600">Create AI-powered capability statements for government contracting opportunities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyProfile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                <textarea
                  value={companyProfile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description of your company"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                  <input
                    type="number"
                    value={companyProfile.yearsInBusiness}
                    onChange={(e) => handleInputChange('yearsInBusiness', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                  <select
                    value={companyProfile.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-100">51-100</option>
                    <option value="101-500">101-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={companyProfile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">NAICS Codes</h2>
            {naicsCodes.map((code, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleNaicsChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter NAICS code"
                />
                {naicsCodes.length > 1 && (
                  <button
                    onClick={() => removeNaicsCode(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNaicsCode}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add NAICS Code
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Template Type</h2>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="standard">Standard Government</option>
              <option value="detailed">Detailed Technical</option>
              <option value="small-business">Small Business</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !companyProfile.name || naicsCodes.filter(c => c.trim()).length === 0}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isGenerating ? 'Generating...' : 'Generate Capability Statement'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-6">
          {capabilityStatement && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated Capability Statement</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 disabled:opacity-50 text-sm"
                  >
                    {isOptimizing ? 'Optimizing...' : 'Optimize'}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(capabilityStatement.content)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded-md">
                  {capabilityStatement.content}
                </pre>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Generated: {new Date(capabilityStatement.generatedAt).toLocaleString()}
              </div>
            </div>
          )}

          {!capabilityStatement && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No capability statement generated yet</p>
                <p className="text-sm">Fill out the form and click generate to create your AI-powered capability statement</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Capabilities;
