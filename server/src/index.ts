import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import docRoutes from './routes/documents';

app.use('/auth', authRoutes);
app.use('/documents', docRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

import jwt from 'jsonwebtoken';
import pool from './config/db';

const clients = new Map(); // ws -> { docId, userId }

wss.on('connection', async (ws, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const token = urlParams.get('token');
    const docId = urlParams.get('docId');

    if (!token || !docId) {
        ws.close();
        return;
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const userId = decoded.id;

        // Store metadata
        clients.set(ws, { docId, userId });
        console.log(`User ${userId} connected to doc ${docId}`);

        ws.on('message', async (message) => {
            const msg = JSON.parse(message.toString());

            if (msg.type === 'OP') {
                const op = msg.payload;

                // Broadcast to others in the same room
                [...wss.clients].forEach((client) => {
                    const clientData = clients.get(client);
                    if (client !== ws && client.readyState === WebSocket.OPEN && clientData?.docId === docId) {
                        client.send(JSON.stringify({ type: 'OP', payload: op }));
                    }
                });

                // Persist to DB (Simplistic approach)
                try {
                    if (op.type === 'INSERT') {
                        const { id, content, type, rank } = op.block;
                        await pool.query(
                            'INSERT INTO blocks (id, document_id, content, type, rank) VALUES ($1, $2, $3, $4, $5)',
                            [id, docId, content, type, rank]
                        );
                    } else if (op.type === 'UPDATE') {
                        const { id, ...data } = op.data; // Expecting { id: string, content?: string, rank?: string, ... }
                        // Construct dynamic update query
                        const keys = Object.keys(data);
                        if (keys.length > 0) {
                            const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
                            const values = keys.map(key => data[key]);
                            await pool.query(
                                `UPDATE blocks SET ${setClause} WHERE id = $${keys.length + 1}`,
                                [...values, op.blockId]
                            );
                        }
                    } else if (op.type === 'DELETE') {
                        await pool.query('DELETE FROM blocks WHERE id = $1', [op.blockId]);
                    }
                } catch (err) {
                    console.error('Persistence error:', err);
                }
            }
        });

        ws.on('close', () => {
            clients.delete(ws);
        });

    } catch (err) {
        ws.close();
    }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
