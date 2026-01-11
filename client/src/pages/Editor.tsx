import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import Block from '../components/Block';
import { updateDocument } from '../api/documents';

const Editor = () => {
    const { id } = useParams<{ id: string }>();
    const { blocks, title, setTitle, isConnected, addBlock, updateBlock, deleteBlock } = useDocument(id!);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Basic debounce
        debouncedUpdateTitle(newTitle);
    };

    // Simple manual debounce to avoid needing a utility file right now
    const debouncedUpdateTitle = useCallback((newTitle: string) => {
        const timeoutId = setTimeout(() => {
            updateDocument(id!, newTitle).catch(console.error);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [id]);

    const handleAddBlock = (afterId: string | null, type: any = 'p') => {
        addBlock(afterId, type);
    };

    const handleAddBlock = (afterId: string | null, type: any = 'p') => {
        addBlock(afterId, type);
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white shadow-sm z-10">
                <div className="flex items-center w-full max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="text-2xl font-bold text-gray-800 w-full focus:outline-none placeholder-gray-300 bg-transparent"
                        placeholder="Untitled User"
                    />
                    <div className="flex items-center space-x-3 ml-4">
                        <span className={`w-2.5 h-2.5 rounded-full transition-colors ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto cursor-text bg-white" onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') return;
                if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;

                // Keep the "click empty space" behavior as a fallback
                if (blocks.length === 0) {
                    handleAddBlock(null, 'h1');
                }
            }}>
                <div className="max-w-4xl px-8 py-12 mx-auto min-h-[500px] flex flex-col">
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

                    <div className="mt-8 flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const lastId = blocks.length > 0 ? blocks[blocks.length - 1].id : null;
                                handleAddBlock(lastId, 'p');
                            }}
                            className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition"
                        >
                            <span className="text-xl font-light">+</span>
                            <span>Add Block</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default Editor;
