import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/propertyService';
import { AppError } from '../middleware/errorHandler';

export class PropertyController {
  static async getProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PropertyService.getProperties(tenantId, page, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPropertyById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { id } = req.params;
      const property = await PropertyService.getPropertyById(tenantId, id);

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const property = await PropertyService.createProperty(tenantId, userId, req.body);
      res.status(201).json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { id } = req.params;
      const property = await PropertyService.updateProperty(tenantId, id, userId, req.body);

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { id } = req.params;
      const result = await PropertyService.deleteProperty(tenantId, id, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPropertiesForMap(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const properties = await PropertyService.getPropertiesForMap(tenantId);
      res.json({
        success: true,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, type, minPrice, maxPrice } = req.query;

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const properties = await PropertyService.searchProperties(
        tenantId,
        query as string,
        type as string,
        minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice ? parseInt(maxPrice as string) : undefined
      );

      res.json({
        success: true,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      void req;
      const categories = await PropertyService.getPropertyCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
