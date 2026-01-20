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
    <div className="glass border border-white/10 rounded-2xl p-6 fade-in">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-lg">📤</div>
        Upload Document
      </h2>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
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
              className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-500/5 transition-all text-white group"
            >
              <FiUpload size={24} className="text-white/60 group-hover:text-indigo-400 transition-colors" />
              <span className="font-medium text-white/60 group-hover:text-white transition-colors">{selectedFile ? 'Change File' : 'Choose File'}</span>
            </label>
          </div>
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <FiFile className="text-white" size={18} />
              </div>
              <div>
                <span className="text-sm text-white font-medium block">{selectedFile.name}</span>
                <span className="text-xs text-white/40">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </span>
              </div>
            </div>
            <button onClick={clearFile} className="text-white/40 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all">
              <FiX size={20} />
            </button>
          </div>
        )}

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Document Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 text-white placeholder-white/40 transition-all"
            placeholder="Enter document name"
            disabled={uploading}
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 text-white placeholder-white/40 transition-all"
            placeholder="e.g., math, physics, notes"
            disabled={uploading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
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
