import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { upload } from '../config/multer';
import {
  uploadMedia,
  getUserMedia,
  getMediaById,
  deleteMedia,
  updateMediaCaption,
} from '../controllers/media.controller';

const router = Router();

// Upload media (image or video)
router.post('/upload', authMiddleware, upload.single('media'), uploadMedia);

// Get user's media gallery
router.get('/user/:userId', authMiddleware, getUserMedia);

// Get specific media by ID (privacy enforced in controller)
router.get('/:mediaId', optionalAuthMiddleware, getMediaById);

// Delete media
router.delete('/:mediaId', authMiddleware, deleteMedia);

// Update media caption
router.patch('/:mediaId/caption', authMiddleware, updateMediaCaption);

export default router;
