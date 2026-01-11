import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import Block from '../components/Block';
import { updateDocument, deleteDocument } from '../api/documents';
import { ChevronLeft, MoreHorizontal, Cloud, CloudOff, Trash2, Edit2 } from 'lucide-react';

const Editor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { blocks, title, setTitle, isConnected, addBlock, updateBlock, deleteBlock } = useDocument(id!);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = async () => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) return;
        try {
            await deleteDocument(id);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Failed to delete document');
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedUpdateTitle(newTitle);
    };

    const debouncedUpdateTitle = useCallback((newTitle: string) => {
        const timeoutId = setTimeout(() => {
            updateDocument(id!, newTitle).catch(console.error);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [id]);

    const handleAddBlock = (afterId: string | null, type: any = 'p') => {
        addBlock(afterId, type);
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-200">
                <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                            onClick={() => navigate('/')}
                            className="p-1.5 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="text-sm font-medium text-slate-900 w-full max-w-md focus:outline-none focus:bg-slate-50 rounded px-2 py-1 transition-colors truncate placeholder-slate-400"
                            placeholder="Untitled Page"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
                            {isConnected ? (
                                <>
                                    <Cloud size={12} className="text-emerald-500" />
                                    <span className="text-emerald-600 hidden sm:inline">Saved</span>
                                </>
                            ) : (
                                <>
                                    <CloudOff size={12} className="text-amber-500" />
                                    <span className="text-amber-600 hidden sm:inline">Offline</span>
                                </>
                            )}
                        </div>

                        {/* More Menu Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ${isMenuOpen ? 'bg-slate-100 text-slate-700' : ''}`}
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 animate-fade-in origin-top-right">
                                        <button
                                            onClick={() => {
                                                titleInputRef.current?.focus();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Edit2 size={14} />
                                            Rename
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Delete Document
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Editor Area */}
            <main className="flex-1 overflow-y-auto cursor-text bg-white" onClick={(e) => {
                const target = e.target as HTMLElement;
                if (['textarea', 'input', 'button'].includes(target.tagName.toLowerCase())) return;

                if (blocks.length === 0) {
                    handleAddBlock(null, 'h1');
                }
            }}>
                <div className="max-w-3xl mx-auto px-8 py-16 min-h-[calc(100vh-3.5rem)] flex flex-col">
                    {/* Title (Big H1 feel for the document start) */}
                    {/* Note: We could put the title input here for a true Notion feel, but keeping it in header for now as updated in previous steps */}

                    {blocks.map(block => (
                        <Block
                            key={block.id}
                            block={block}
                            updateBlock={updateBlock}
                            addBlock={handleAddBlock}
                            deleteBlock={deleteBlock}
                            isFocused={focusedBlockId === block.id}
                            onFocus={setFocusedBlockId}
                        />
                    ))}

                    <div className="mt-4 flex justify-center pb-32">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const lastId = blocks.length > 0 ? blocks[blocks.length - 1].id : null;
                                handleAddBlock(lastId, 'p');
                            }}
                            className="flex items-center space-x-2 text-slate-300 hover:text-slate-500 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-all text-sm"
                        >
                            <span className="text-lg font-light leading-none">+</span>
                            <span>Click to add block</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default Editor;
