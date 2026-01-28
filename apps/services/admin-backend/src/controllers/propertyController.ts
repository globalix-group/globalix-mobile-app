import { Request, Response } from 'express';
import { PropertyService } from '../services/propertyService';

export class PropertyController {
  static async getProperties(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, search, minPrice, maxPrice } = req.query;

      const result = await PropertyService.getProperties(
        parseInt(page as string),
        parseInt(limit as string),
        category as string,
        search as string,
        minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice ? parseInt(maxPrice as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async getPropertyById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const property = await PropertyService.getPropertyById(id);

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async createProperty(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const property = await PropertyService.createProperty(req.body, req.userId);

      res.status(201).json({
        success: true,
        data: property,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async updateProperty(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const { id } = req.params;
      const property = await PropertyService.updateProperty(id, req.body, req.userId);

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async deleteProperty(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const { id } = req.params;
      const result = await PropertyService.deleteProperty(id, req.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async getPropertiesForMap(req: Request, res: Response) {
    try {
      const properties = await PropertyService.getPropertiesForMap(req.query as any);

      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async searchProperties(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query required',
            statusCode: 400,
          },
        });
      }

      const properties = await PropertyService.searchProperties(q as string);

      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async getPropertyCategories(req: Request, res: Response) {
    try {
      const categories = await PropertyService.getPropertyCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }
}
