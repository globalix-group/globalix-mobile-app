import { Request, Response } from 'express';
import { UserMedia } from '../models/UserMedia';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { User } from '../models';

// ===== MEDIA SERVICE =====
export class MediaService {
  static async uploadMedia(
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
    caption?: string,
    privacy: 'public' | 'private' | 'followers' = 'public'
  ) {
    try {
      const isVideo = file.mimetype.startsWith('video/');
      const isAudio = file.mimetype.startsWith('audio/');
      const url = `/uploads/media/${file.filename}`;
      let thumbnailUrl = null;
      let width = null;
      let height = null;

      // For images, generate thumbnail and get dimensions
      if (!isVideo && !isAudio) {
        const metadata = await sharp(file.path).metadata();
        width = metadata.width || null;
        height = metadata.height || null;

        // Generate thumbnail
        const thumbnailName = `thumb_${file.filename}`;
        const thumbnailPath = path.join(path.dirname(file.path), thumbnailName);
        
        await sharp(file.path)
          .resize(300, 300, { fit: 'cover' })
          .toFile(thumbnailPath);

        thumbnailUrl = `/uploads/media/${thumbnailName}`;
      }

      // Create media record
      const media = await UserMedia.create({
        tenantId,
        userId,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        url,
        thumbnailUrl,
        caption: caption || null,
        privacy,
        likes: 0,
        views: 0,
        duration: null, // TODO: Extract video duration if needed
        width,
        height,
        fileSize: file.size,
        mimeType: file.mimetype,
      });

      return media;
    } catch (error) {
      // Clean up uploaded file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  static async getUserMedia(tenantId: string, userId: string, limit: number = 50, offset: number = 0) {
    const media = await UserMedia.findAll({
      where: { userId, tenantId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const total = await UserMedia.count({ where: { userId, tenantId } });

    return { media, total, limit, offset };
  }

  static async getMediaById(tenantId: string, mediaId: string) {
    const media = await UserMedia.findOne({
      where: { id: mediaId, tenantId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    if (!media) {
      throw {
        statusCode: 404,
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
      };
    }

    return media;
  }

  static async deleteMedia(tenantId: string, mediaId: string, userId: string) {
    const media = await UserMedia.findOne({ where: { id: mediaId, tenantId } });

    if (!media) {
      throw {
        statusCode: 404,
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
      };
    }

    // Check ownership
    if (media.userId !== userId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this media',
      };
    }

    // Delete files
    const uploadsDir = path.join(__dirname, '../../uploads/media');
    const filePath = path.join(uploadsDir, path.basename(media.url));
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    if (media.thumbnailUrl) {
      const thumbnailPath = path.join(uploadsDir, path.basename(media.thumbnailUrl));
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await media.destroy();
    return { message: 'Media deleted successfully' };
  }

  static async updateMediaCaption(tenantId: string, mediaId: string, userId: string, caption: string) {
    const media = await UserMedia.findOne({ where: { id: mediaId, tenantId } });

    if (!media) {
      throw {
        statusCode: 404,
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
      };
    }

    // Check ownership
    if (media.userId !== userId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this media',
      };
    }

    media.caption = caption;
    await media.save();
    return media;
  }

  static async incrementViews(tenantId: string, mediaId: string) {
    const media = await UserMedia.findOne({ where: { id: mediaId, tenantId } });
    if (media) {
      media.views += 1;
      await media.save();
    }
    return media;
  }
}
