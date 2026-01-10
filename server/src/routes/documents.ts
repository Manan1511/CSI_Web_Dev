import { Router } from 'express';
import { createDocument, getDocuments, getDocument, deleteDocument, getBlocks, updateDocument } from '../controllers/docController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.get('/:id/blocks', getBlocks);
router.delete('/:id', deleteDocument);

export default router;
