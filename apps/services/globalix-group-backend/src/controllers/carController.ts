import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/carService';
import { AppError } from '../middleware/errorHandler';

export class CarController {
  static async getCars(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CarService.getCars(page, limit);
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
      const { id } = req.params;
      const car = await CarService.getCarById(id);

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

      const car = await CarService.createCar(userId, req.body);
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

      const { id } = req.params;
      const car = await CarService.updateCar(id, userId, req.body);

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

      const { id } = req.params;
      const result = await CarService.deleteCar(id, userId);

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

      const cars = await CarService.searchCars(
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
      const categories = await CarService.getCarCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
