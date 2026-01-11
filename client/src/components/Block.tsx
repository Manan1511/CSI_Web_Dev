import React, { useRef, useEffect } from 'react';
import type { Block as BlockType } from '../types';
import { Trash2, GripVertical } from 'lucide-react';

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
        <div className="group relative flex items-start -ml-12 pl-12">
            {/* Hover Menu / Drag Handle (Left Gutter) */}
            <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 flex items-center transition-opacity pr-2">
                <div className="flex items-center gap-0.5" title="Drag to move">
                    <button
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                    <div className="cursor-grab p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <GripVertical size={14} />
                    </div>
                </div>
            </div>

            <textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => {
                    updateBlock(block.id, e.target.value);
                    autoResize();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => onFocus(block.id)}
                placeholder={block.type === 'h1' ? "Untitled" : "Click here to type"}
                className={`w-full resize-none outline-none bg-transparent overflow-hidden py-1 rounded-sm selection:bg-brand-100 selection:text-brand-900 ${block.type === 'h1' ? 'text-4xl font-bold mb-4 placeholder-slate-200 text-slate-900 min-h-[3.5rem] leading-tight' :
                    block.type === 'h2' ? 'text-2xl font-semibold mb-3 placeholder-slate-200 text-slate-800 min-h-[2.5rem] mt-6' :
                        block.type === 'h3' ? 'text-xl font-semibold mb-2 placeholder-slate-200 text-slate-800 min-h-[2rem] mt-4' :
                            block.type === 'ul' ? 'text-base leading-relaxed text-slate-700 ml-6 list-disc' :
                                // Default paragraph
                                'text-base leading-7 text-slate-700 min-h-[1.75rem] mb-1'
                    }`}
                rows={1}
            />
        </div>
    );
};
export default Block;
