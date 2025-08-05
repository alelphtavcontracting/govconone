import React, { useState, useRef } from 'react';

interface SOWDocument {
  id: string;
  name: string;
  sections: any;
  raw_content: string;
  transformed_content?: string;
}

const SOWRepurposer: React.FC = () => {
  const [document, setDocument] = useState<SOWDocument | null>(null);
  const [transformedSOW, setTransformedSOW] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [transforming, setTransforming] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/documents/upload-sow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setDocument({
          id: data.document.id,
          name: data.document.name,
          sections: data.sections,
          raw_content: data.raw_content
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleTransform = async () => {
    if (!document) return;

    setTransforming(true);
    setError('');
    try {
      const response = await fetch('/api/documents/transform-sow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sowContent: document.raw_content,
          documentId: document.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTransformedSOW(data.transformed_sow);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to transform document');
      }
    } catch (error) {
      console.error('Transform error:', error);
      setError('Failed to transform document');
    } finally {
      setTransforming(false);
    }
  };

  const downloadDocument = (content: string, filename: string, format: 'docx' | 'pdf') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transformedSOW);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SOW Repurposer</h1>
        <p className="text-gray-600">Transform government SOWs into subcontractor-ready B2B documents</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {!document ? (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload SOW Document</p>
                  <p className="text-sm text-gray-500 mb-4">PDF, DOCX, DOC, or TXT files up to 10MB</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">Document Uploaded</p>
                  <p className="text-sm text-gray-500 mb-4">{document.name}</p>
                  <button
                    onClick={() => {
                      setDocument(null);
                      setTransformedSOW('');
                      fileInputRef.current?.click();
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Upload Different File
                  </button>
                </div>
              )}
            </div>
          </div>

          {document && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Transform to B2B</h2>
              <p className="text-gray-600 mb-4">
                Convert this government SOW into a subcontractor-ready document with your company branding.
              </p>
              <button
                onClick={handleTransform}
                disabled={transforming}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {transforming ? 'Transforming...' : 'Transform SOW'}
              </button>
            </div>
          )}

          {document && document.sections && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Extracted Sections</h2>
              <div className="space-y-2 text-sm">
                {Object.entries(document.sections).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium capitalize w-24">{key.replace('_', ' ')}:</span>
                    <span className="text-gray-600">{value ? '✓' : '✗'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {transformedSOW ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Repurposed SOW</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadDocument(transformedSOW, 'repurposed-sow', 'docx')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Download DOCX
                  </button>
                  <button
                    onClick={() => downloadDocument(transformedSOW, 'repurposed-sow', 'pdf')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <textarea
                  value={transformedSOW}
                  onChange={(e) => setTransformedSOW(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Transformed SOW will appear here..."
                />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log('Save to opportunity functionality to be implemented');
                  }}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm"
                >
                  Save to Opportunity
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No repurposed SOW yet</p>
                <p className="text-sm">Upload a document and transform it to see the B2B version here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOWRepurposer;
