'use client';

import React, { useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { documentsAPI } from '@/lib/api';

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOCX, and TXT files are allowed');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setName(file.name);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      await documentsAPI.upload(selectedFile, name, tagArray);
      
      setSelectedFile(null);
      setName('');
      setTags('');
      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setName('');
    setError('');
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        📤 Upload Document
      </h2>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select File (PDF, DOCX, TXT)
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-gray-700/50 transition-all text-gray-300"
            >
              <FiUpload size={20} />
              <span className="font-medium">{selectedFile ? 'Change File' : 'Choose File'}</span>
            </label>
          </div>
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <FiFile className="text-blue-400" size={20} />
              <div>
                <span className="text-sm text-white font-medium block">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </span>
              </div>
            </div>
            <button onClick={clearFile} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all">
              <FiX size={20} />
            </button>
          </div>
        )}

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Document Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder="Enter document name"
            disabled={uploading}
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder="e.g., math, physics, notes"
            disabled={uploading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading...
            </span>
          ) : (
            'Upload Document'
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
