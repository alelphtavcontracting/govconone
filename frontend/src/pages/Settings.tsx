import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CompanySettings {
  company_name: string;
  company_logo_url: string;
  capability_statement: string;
  years_in_business: number;
  naics_codes: string[];
  address: string;
  phone: string;
  email: string;
  website: string;
  certifications: string[];
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    company_logo_url: '',
    capability_statement: '',
    years_in_business: 0,
    naics_codes: [''],
    address: '',
    phone: '',
    email: '',
    website: '',
    certifications: ['']
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.settings) {
        setSettings({
          ...data.settings,
          naics_codes: data.settings.naics_codes || [''],
          certifications: data.settings.certifications || ['']
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/company-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNaicsCode = () => {
    setSettings(prev => ({
      ...prev,
      naics_codes: [...prev.naics_codes, '']
    }));
  };

  const removeNaicsCode = (index: number) => {
    setSettings(prev => ({
      ...prev,
      naics_codes: prev.naics_codes.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setSettings(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index: number) => {
    setSettings(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Settings</h1>
        <p className="text-gray-600">Manage your company profile for SOW repurposing and branding</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
              <input
                type="number"
                value={settings.years_in_business}
                onChange={(e) => handleInputChange('years_in_business', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Company Logo</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={settings.company_logo_url}
              onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-gray-500 mt-1">Enter a URL to your company logo image</p>
            {settings.company_logo_url && (
              <div className="mt-2">
                <img 
                  src={settings.company_logo_url} 
                  alt="Company Logo Preview" 
                  className="h-16 w-auto border border-gray-200 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://www.company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123 Main St, City, State 12345"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Capability Statement</h2>
          <textarea
            value={settings.capability_statement}
            onChange={(e) => handleInputChange('capability_statement', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of your company's capabilities and expertise..."
            rows={4}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">NAICS Codes</h2>
          {settings.naics_codes.map((code, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const newCodes = [...settings.naics_codes];
                  newCodes[index] = e.target.value;
                  handleInputChange('naics_codes', newCodes);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter NAICS code (e.g., 541511)"
              />
              {settings.naics_codes.length > 1 && (
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

        <div>
          <h2 className="text-xl font-semibold mb-4">Certifications</h2>
          {settings.certifications.map((cert, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={cert}
                onChange={(e) => {
                  const newCerts = [...settings.certifications];
                  newCerts[index] = e.target.value;
                  handleInputChange('certifications', newCerts);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter certification (e.g., 8(a), HUBZone, WOSB)"
              />
              {settings.certifications.length > 1 && (
                <button
                  onClick={() => removeCertification(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCertification}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            + Add Certification
          </button>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
