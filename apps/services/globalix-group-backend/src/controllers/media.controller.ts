import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';

// ===== UPLOAD MEDIA =====
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // From authMiddleware
    const tenantId = req.tenantId;
    const file = req.file;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILE',
        message: 'No file uploaded',
      });
    }

    const { caption, privacy } = req.body;
    const allowedPrivacy = ['public', 'private', 'followers'];
    if (privacy && !allowedPrivacy.includes(privacy)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PRIVACY',
        message: 'Invalid privacy value',
      });
    }
    if (caption && typeof caption !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CAPTION',
        message: 'Caption must be a string',
      });
    }
    if (caption && String(caption).length > 2000) {
      return res.status(400).json({
        success: false,
        code: 'CAPTION_TOO_LONG',
        message: 'Caption is too long',
      });
    }

    const media = await MediaService.uploadMedia(
      tenantId,
      userId,
      file,
      caption,
      (privacy || 'public') as 'public' | 'private' | 'followers'
    );

    return res.status(201).json({
      success: true,
      data: media,
      message: 'Media uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload media error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'UPLOAD_ERROR',
      message: error.message || 'Failed to upload media',
    });
  }
};

// ===== GET USER MEDIA =====
export const getUserMedia = async (req: Request, res: Response) => {
  try {
    if (!req.userId || !req.tenantId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const { userId } = req.params;
    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this media',
      });
    }
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await MediaService.getUserMedia(req.tenantId, userId, limit, offset);

    return res.json({
      success: true,
      data: result.media,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total,
      },
    });
  } catch (error: any) {
    console.error('Get user media error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'FETCH_ERROR',
      message: error.message || 'Failed to fetch media',
    });
  }
};

// ===== GET MEDIA BY ID =====
export const getMediaById = async (req: Request, res: Response) => {
  try {
    const { mediaId } = req.params;
    if (!req.tenantId) {
      return res.status(400).json({
        success: false,
        code: 'TENANT_REQUIRED',
        message: 'Tenant context is required',
      });
    }

    const media = await MediaService.getMediaById(req.tenantId, mediaId);

    if (media.privacy !== 'public' && req.userId !== media.userId) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this media',
      });
    }

    // Increment views
    await MediaService.incrementViews(req.tenantId, mediaId);

    return res.json({
      success: true,
      data: media,
    });
  } catch (error: any) {
    console.error('Get media error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'FETCH_ERROR',
      message: error.message || 'Failed to fetch media',
    });
  }
};

// ===== DELETE MEDIA =====
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // From authMiddleware
    const tenantId = req.tenantId;
    const { mediaId } = req.params;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const result = await MediaService.deleteMedia(tenantId, mediaId, userId);

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'DELETE_ERROR',
      message: error.message || 'Failed to delete media',
    });
  }
};

// ===== UPDATE MEDIA CAPTION =====
export const updateMediaCaption = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // From authMiddleware
    const tenantId = req.tenantId;
    const { mediaId } = req.params;
    const { caption } = req.body;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    if (caption === undefined) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CAPTION',
        message: 'Caption is required',
      });
    }

    const media = await MediaService.updateMediaCaption(tenantId, mediaId, userId, caption);

    return res.json({
      success: true,
      data: media,
      message: 'Caption updated successfully',
    });
  } catch (error: any) {
    console.error('Update caption error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'UPDATE_ERROR',
      message: error.message || 'Failed to update caption',
    });
  }
};
