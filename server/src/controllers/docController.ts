import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const createDocument = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    console.log('[CreateDocument] Request received. User ID:', userId);
    try {
        if (!userId) {
            console.error('[CreateDocument] No User ID found in request');
            return res.status(401).json({ message: 'Unauthorized: No User ID' });
        }
        const newDoc = await pool.query(
            'INSERT INTO documents (owner_id) VALUES ($1) RETURNING *',
            [userId]
        );
        console.log('[CreateDocument] Document created:', newDoc.rows[0]);
        res.status(201).json(newDoc.rows[0]);
    } catch (err) {
        console.error('[CreateDocument] Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            'SELECT * FROM documents WHERE owner_id = $1 ORDER BY updated_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDocument = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (docResult.rows.length === 0) return res.status(404).json({ message: 'Document not found' });

        if (docResult.rows[0].owner_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(docResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const result = await pool.query('DELETE FROM documents WHERE id = $1 AND owner_id = $2 RETURNING *', [id, userId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Document not found or unauthorized' });
        res.json({ message: 'Document deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, header_note } = req.body;
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            'UPDATE documents SET title = COALESCE($1, title), header_note = COALESCE($2, header_note), updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND owner_id = $4 RETURNING *',
            [title, header_note, id, userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Document not found or unauthorized' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBlocks = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    // TODO: Add access control check here similar to getDocument
    try {
        const result = await pool.query('SELECT * FROM blocks WHERE document_id = $1 ORDER BY rank ASC', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
