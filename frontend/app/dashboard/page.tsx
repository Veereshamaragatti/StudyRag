'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiTrash2, FiFileText, FiMessageSquare } from 'react-icons/fi';
import FileUploader from '@/components/FileUploader';
import { authAPI, documentsAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Document {
  _id: string;
  name: string;
  originalName: string;
  fileType: string;
  tags: string[];
  size: number;
  uploadedAt: string;
  chunksCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchDocuments();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await documentsAPI.list();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsAPI.delete(id);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                🎓 StudyRAG
              </h1>
              <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <FiMessageSquare />
                Go to Chat
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <FileUploader onUploadSuccess={fetchDocuments} />
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                📚 Your Documents 
                <span className="text-sm font-normal text-gray-400">({documents.length})</span>
              </h2>

              {documents.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FiFileText size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">No documents uploaded yet</p>
                  <p className="text-sm text-gray-500">Upload your first document to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1 text-lg">{doc.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{doc.originalName}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {doc.tags && doc.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              📦 {formatFileSize(doc.size)}
                            </span>
                            <span>•</span>
                            <span>{doc.chunksCount || 0} chunks</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                          title="Delete document"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
