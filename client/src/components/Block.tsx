import React, { useRef, useEffect } from 'react';
import type { Block as BlockType } from '../types';
import { Trash2 } from 'lucide-react';

interface BlockProps {
    block: BlockType;
    updateBlock: (id: string, content: string) => void;
    addBlock: (afterId: string, type: BlockType['type']) => void;
    deleteBlock: (id: string) => void;
    isFocused: boolean;
    onFocus: (id: string) => void;
}

const Block: React.FC<BlockProps> = ({ block, updateBlock, addBlock, deleteBlock, isFocused, onFocus }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isFocused && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isFocused]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBlock(block.id, 'p');
        } else if (e.key === 'Backspace' && block.content === '') {
            e.preventDefault();
            deleteBlock(block.id);
        }
    };

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        autoResize();
    }, [block.content]);

    return (
        <div className="group relative mb-4 flex items-start w-full">
            <textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => {
                    updateBlock(block.id, e.target.value);
                    autoResize();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => onFocus(block.id)}
                placeholder={block.type === 'h1' ? "Untitled" : "Click here to start typing"}
                className={`flex-1 resize-none outline-none bg-transparent overflow-hidden px-4 py-3 rounded hover:bg-gray-50 transition-colors ${block.type === 'h1' ? 'text-4xl font-bold mb-4 placeholder-gray-300 min-h-[3rem]' :
                    block.type === 'h2' ? 'text-2xl font-bold mb-2 placeholder-gray-300 min-h-[2.5rem]' :
                        block.type === 'ul' ? 'list-disc ml-4' :
                            'text-lg leading-relaxed text-gray-800 min-h-[6rem]' /* Increased default height/size */
                    }`}
                rows={1}
            />

            {/* Delete Button - Moved to the right */}
            <div className="ml-2 mt-3 opacity-0 group-hover:opacity-100 flex items-center transition-opacity flex-shrink-0">
                <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete block"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
export default Block;
