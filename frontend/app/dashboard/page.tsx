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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto mb-4"></div>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <span className="text-xl font-bold gradient-text">StudyRag</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-indigo-500/20"
            >
              <FiMessageSquare />
              Go to Chat
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 glass text-white rounded-xl hover:bg-white/10 transition-all"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Document Management</h1>
          <p className="text-white/60">Welcome back, <span className="text-indigo-400">{user?.name}</span>!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <FileUploader onUploadSuccess={fetchDocuments} />
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2 fade-in">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg">📚</span>
                Your Documents 
                <span className="text-sm font-normal text-white/40 ml-2">({documents.length})</span>
              </h2>

              {documents.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <FiFileText size={40} className="opacity-30" />
                  </div>
                  <p className="text-lg mb-2">No documents uploaded yet</p>
                  <p className="text-sm text-white/30">Upload your first document to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="glass rounded-xl p-5 hover:bg-white/10 transition-all hover-lift border border-white/5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1 text-lg">{doc.name}</h3>
                          <p className="text-sm text-white/60 mb-3">{doc.originalName}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {doc.tags && doc.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              📦 {formatFileSize(doc.size)}
                            </span>
                            <span>•</span>
                            <span className="text-indigo-400">{doc.chunksCount || 0} chunks</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="text-white/40 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
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
