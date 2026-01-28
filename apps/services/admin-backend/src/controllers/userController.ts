import { Request, Response } from 'express';
import { CarService } from '../services/carService';

export class CarController {
  static async getCars(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;

      const result = await CarService.getCars(
        parseInt(page as string),
        parseInt(limit as string),
        category as string,
        search as string
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

  static async getCarById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const car = await CarService.getCarById(id);

      res.status(200).json({
        success: true,
        data: car,
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

  static async createCar(req: Request, res: Response) {
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

      const car = await CarService.createCar(req.body, req.userId);

      res.status(201).json({
        success: true,
        data: car,
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

  static async updateCar(req: Request, res: Response) {
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
      const car = await CarService.updateCar(id, req.body, req.userId);

      res.status(200).json({
        success: true,
        data: car,
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

  static async deleteCar(req: Request, res: Response) {
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
      const result = await CarService.deleteCar(id, req.userId);

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

  static async searchCars(req: Request, res: Response) {
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

      const cars = await CarService.searchCars(q as string);

      res.status(200).json({
        success: true,
        data: cars,
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

  static async getCarCategories(req: Request, res: Response) {
    try {
      const categories = await CarService.getCarCategories();

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
