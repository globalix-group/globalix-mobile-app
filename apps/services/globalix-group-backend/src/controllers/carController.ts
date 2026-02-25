import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/carService';
import { AppError } from '../middleware/errorHandler';

export class CarController {
  static async getCars(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CarService.getCars(tenantId, page, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCarById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { id } = req.params;
      const car = await CarService.getCarById(tenantId, id);

      res.json({
        success: true,
        data: car,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const car = await CarService.createCar(tenantId, userId, req.body);
      res.status(201).json({
        success: true,
        data: car,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCar(req: Request, res: Response, next: NextFunction) {
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
      const car = await CarService.updateCar(tenantId, id, userId, req.body);

      res.json({
        success: true,
        data: car,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCar(req: Request, res: Response, next: NextFunction) {
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
      const result = await CarService.deleteCar(tenantId, id, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchCars(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, brand, minPrice, maxPrice } = req.query;

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const cars = await CarService.searchCars(
        tenantId,
        query as string,
        brand as string,
        minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice ? parseInt(maxPrice as string) : undefined
      );

      res.json({
        success: true,
        data: cars,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const categories = await CarService.getCarCategories(tenantId);
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
