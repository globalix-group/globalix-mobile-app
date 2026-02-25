import { Car } from '../models';
import { AppError } from '../middleware/errorHandler';

export class CarService {
  private static sanitizeCarPayload(data: any) {
    const payload: Record<string, any> = {};

    if (typeof data?.name === 'string') payload.name = data.name.trim();
    if (typeof data?.brand === 'string') payload.brand = data.brand.trim();
    if (typeof data?.model === 'string') payload.model = data.model.trim();
    if (typeof data?.year === 'number') payload.year = data.year;
    if (typeof data?.price === 'number') payload.price = data.price;
    if (typeof data?.pricePerDay === 'number') payload.pricePerDay = data.pricePerDay;
    if (typeof data?.specs === 'string') payload.specs = data.specs.trim();
    if (Array.isArray(data?.images)) payload.images = data.images.filter((v: any) => typeof v === 'string');
    if (Array.isArray(data?.features)) payload.features = data.features.filter((v: any) => typeof v === 'string');
    if (typeof data?.category === 'string') payload.category = data.category.trim();
    if (typeof data?.availability === 'boolean') payload.availability = data.availability;

    return payload;
  }
  static async getCars(tenantId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Car.findAndCountAll({
      where: { tenantId },
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

  static async getCarById(tenantId: string, id: string) {
    const car = await Car.findOne({ where: { id, tenantId } });
    if (!car) {
      throw new AppError(404, 'CAR_NOT_FOUND', 'Car not found');
    }
    return car;
  }

  static async createCar(tenantId: string, userId: string, data: any) {
    const payload = CarService.sanitizeCarPayload(data);
    return await Car.create({
      ...payload,
      tenantId,
      ownerId: userId,
    });
  }

  static async updateCar(tenantId: string, id: string, userId: string, data: any) {
    const car = await Car.findOne({ where: { id, tenantId } });
    if (!car) {
      throw new AppError(404, 'CAR_NOT_FOUND', 'Car not found');
    }

    if (car.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this car');
    }

    const payload = CarService.sanitizeCarPayload(data);
    await car.update(payload);
    return car;
  }

  static async deleteCar(tenantId: string, id: string, userId: string) {
    const car = await Car.findOne({ where: { id, tenantId } });
    if (!car) {
      throw new AppError(404, 'CAR_NOT_FOUND', 'Car not found');
    }

    if (car.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this car');
    }

    await car.destroy();
    return { message: 'Car deleted successfully' };
  }

  static async searchCars(tenantId: string, query: string, brand?: string, minPrice?: number, maxPrice?: number) {
    const where: any = { tenantId };

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

  static async getCarCategories(tenantId: string) {
    const cars = await Car.findAll({
      where: { tenantId },
      attributes: ['category'],
      group: ['category'],
      raw: true,
    });
    return cars.map((car: any) => car.category).filter(Boolean);
  }
}
