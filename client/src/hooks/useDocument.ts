import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Block, BlockType } from '../types';
import { getAuthHeader, API_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

// Simple fractional indexing helper (very basic implementation)
const generateRank = (prev: string | null, next: string | null): string => {
    const p = prev || '0';
    const n = next || 'z';

    let rank = '';
    let i = 0;
    while (i < p.length || i < n.length) {
        const charP = (i < p.length ? p.charCodeAt(i) : 48); // '0'
        const charN = (i < n.length ? n.charCodeAt(i) : 122); // 'z'
        if (charP === charN) {
            rank += String.fromCharCode(charP);
            i++;
            continue;
        }
        const mid = Math.floor((charP + charN) / 2);
        if (mid === charP) {
            rank += String.fromCharCode(charP);
            i++;
            return rank + 'M'; // 'M' is ~middle
        }
        rank += String.fromCharCode(mid);
        return rank;
    }
    return rank + 'M';
};

export const useDocument = (docId: string) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [title, setTitle] = useState('Untitled');
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        // 1. Fetch initial state (including doc metadata for title)
        fetch(`${API_URL}/documents/${docId}`, { headers: getAuthHeader() })
            .then(res => res.json())
            .then(data => setTitle(data.title))
            .catch(console.error);

        fetch(`${API_URL}/documents/${docId}/blocks`, { headers: getAuthHeader() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const sorted = data.sort((a: Block, b: Block) => a.rank.localeCompare(b.rank));
                    setBlocks(sorted);
                }
            })
            .catch(console.error);

        // 2. Connect WebSocket
        const wsUrl = `ws://localhost:3001?docId=${docId}&token=${token}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            console.log('WS Connected');
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'OP') {
                applyRemoteOp(msg.payload);
            }
        };

        ws.onclose = () => setIsConnected(false);

        return () => {
            ws.close();
        };
    }, [docId, token]);

    const applyRemoteOp = (op: any) => {
        setBlocks(prev => {
            let newBlocks = [...prev];
            if (op.type === 'INSERT') {
                newBlocks.push(op.block);
            } else if (op.type === 'UPDATE') {
                const idx = newBlocks.findIndex(b => b.id === op.blockId);
                if (idx !== -1) newBlocks[idx] = { ...newBlocks[idx], ...op.data };
            } else if (op.type === 'DELETE') {
                newBlocks = newBlocks.filter(b => b.id !== op.blockId);
            }
            return newBlocks.sort((a, b) => a.rank.localeCompare(b.rank));
        });
    };

    const broadcastOp = (op: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'OP', payload: op }));
        }
    };

    // Actions
    const addBlock = (afterId: string | null, type: BlockType = 'p') => {
        const prevBlock = afterId ? blocks.find(b => b.id === afterId) : null;
        const prevRank = prevBlock ? prevBlock.rank : null;

        // Find next block
        const prevIndex = afterId ? blocks.findIndex(b => b.id === afterId) : -1;
        const nextBlock = prevIndex + 1 < blocks.length ? blocks[prevIndex + 1] : null;
        const nextRank = nextBlock ? nextBlock.rank : null;

        const newRank = generateRank(prevRank, nextRank);
        const newBlock: Block = { id: uuidv4(), content: '', type, rank: newRank };

        // Optimistic Update
        setBlocks(prev => {
            const next = [...prev, newBlock].sort((a, b) => a.rank.localeCompare(b.rank));
            return next;
        });

        broadcastOp({ type: 'INSERT', block: newBlock });
    };

    const updateBlock = (id: string, content: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
        // Debounce this in real app
        broadcastOp({ type: 'UPDATE', blockId: id, data: { content } });
    };

    const deleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        broadcastOp({ type: 'DELETE', blockId: id });
    };

    return { blocks, title, setTitle, isConnected, addBlock, updateBlock, deleteBlock };
};
