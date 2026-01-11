import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, deleteDocument } from '../api/documents';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
    Trash2,
    Plus,
    FileText,
    Layout,
    Settings,
    LogOut,
    Search,
    MoreVertical
} from 'lucide-react';

interface Document {
    id: string;
    title: string;
    updated_at: string;
}

const Dashboard = () => {
    const [docs, setDocs] = useState<Document[]>([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('documents');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        try {
            const data = await getDocuments();
            setDocs(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async () => {
        try {
            console.log('Creating document...');
            const newDoc = await createDocument();
            console.log('Document created:', newDoc);
            navigate(`/document/${newDoc.id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create document. Check console or server logs.');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            await deleteDocument(id);
            setDocs(docs.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredDocs = docs.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex">
                <div className="p-6">
                    <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
                        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                            <FileText size={18} />
                        </div>
                        CollabDocs
                    </div>
                </div>

                <div className="px-3 py-2 flex-1">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'documents' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Layout size={18} />
                            All Documents
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-sm">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                            <p className="text-xs text-slate-500 truncate">Free Plan</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="md:hidden text-brand-600 font-bold text-lg">CollabDocs</div>
                        <div className="relative max-w-md w-full hidden sm:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:transform active:scale-95"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">New Document</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {filteredDocs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {searchQuery ? 'No documents found' : 'No documents yet'}
                            </h3>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                {searchQuery ? "Try searching for something else." : "Create your first document to start writing and collaborating with your team."}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={handleCreate}
                                    className="bg-white border border-slate-300 text-slate-700 hover:border-brand-500 hover:text-brand-600 px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
                                >
                                    Create a document
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
                            {filteredDocs.map((doc) => (
                                <Link
                                    key={doc.id}
                                    to={`/document/${doc.id}`}
                                    className="group block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-brand-200 transition-all duration-200 relative"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(doc.id, e)}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-lg mb-1 truncate pr-2 group-hover:text-brand-600 transition-colors">
                                        {doc.title || 'Untitled Document'}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Edited {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                                    </p>

                                    {/* Hover effect bottom bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl origin-left" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
