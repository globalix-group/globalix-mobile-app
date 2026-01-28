import { Car } from '../models';
import { AppError } from '../middleware/errorHandler';

export class CarService {
  static async getCars(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Car.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: rows,
    };
  }

  static async getCarById(id: string) {
    const car = await Car.findByPk(id);
    if (!car) {
      throw new AppError(404, 'CAR_NOT_FOUND', 'Car not found');
    }
    return car;
  }

  static async createCar(userId: string, data: any) {
    return await Car.create({
      ...data,
      ownerId: userId,
    });
  }

  static async updateCar(id: string, userId: string, data: any) {
    const car = await Car.findByPk(id);
    if (!car) {
      throw new AppError(404, 'CAR_NOT_FOUND', 'Car not found');
    }

    if (car.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this car');
    }

    await car.update(data);
    return car;
  }

  static async deleteCar(id: string, userId: string) {
    const car = await Car.findByPk(id);
    if (!car) {
      throw new AppError(404, 'CAR_NOT_FOUND', 'Car not found');
    }

    if (car.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this car');
    }

    await car.destroy();
    return { message: 'Car deleted successfully' };
  }

  static async searchCars(query: string, brand?: string, minPrice?: number, maxPrice?: number) {
    const where: any = {};

    if (query) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { model: { [require('sequelize').Op.iLike]: `%${query}%` } },
      ];
    }

    if (brand) where.brand = brand;
    if (minPrice) where.price = { [require('sequelize').Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [require('sequelize').Op.lte]: maxPrice };

    return await Car.findAll({ where });
  }

  static async getCarCategories() {
    const cars = await Car.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true,
    });
    return cars.map((car: any) => car.category).filter(Boolean);
  }
}
