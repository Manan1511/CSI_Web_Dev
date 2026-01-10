import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, deleteDocument } from '../api/documents';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    updated_at: string;
}

const Dashboard = () => {
    const [docs, setDocs] = useState<Document[]>([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

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
            const newDoc = await createDocument();
            navigate(`/document/${newDoc.id}`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm('Are you sure?')) return;
        try {
            await deleteDocument(id);
            setDocs(docs.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">CollabDocs</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Hello, {user?.email}</span>
                            <button onClick={logout} className="text-gray-500 hover:text-gray-700">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
                    <button onClick={handleCreate} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                        + New Document
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc) => (
                        <Link key={doc.id} to={`/document/${doc.id}`} className="block p-6 transition shadow bg-white rounded-lg hover:shadow-md border border-gray-100">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{doc.title}</h3>
                                <button onClick={(e) => handleDelete(doc.id, e)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Last updated: {format(new Date(doc.updated_at), 'MMM d, yyyy HH:mm')}
                            </p>
                        </Link>
                    ))}
                </div>
                {docs.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No documents yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
